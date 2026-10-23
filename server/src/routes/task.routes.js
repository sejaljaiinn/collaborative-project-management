import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const projectPermission = async (userId, projectId) => {
  const user = await User.findById(userId);
  if (user?.role === 'admin') return true;

  const project = await Project.findById(projectId);
  if (!project) return false;

  if (project.owner.toString() === userId.toString()) return true;

  const member = await ProjectMember.findOne({ projectId, userId });
  return !!member;
};

router.get('/project/:projectId/tasks', protect, async (req, res) => {
  try {
    const { projectId } = req.params;
    const allowed = await projectPermission(req.user._id, projectId);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You cannot view tasks for this project' }
      });
    }

    const tasks = await Task.find({ projectId, isDeleted: false }).sort({ updatedAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      data: tasks,
      message: 'Tasks fetched successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.post('/project/:projectId/tasks', protect, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, assigneeId, priority, dueDate, status } = req.body;

    const user = await User.findById(req.user._id);
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    const member = await ProjectMember.findOne({ projectId, userId: req.user._id });
    const canCreate = user.role === 'admin' || user.role === 'project_manager' || project.owner.toString() === req.user._id.toString() || !!member?.role;
    if (!canCreate) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only project managers and admins can create tasks' }
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Task title is required' }
      });
    }

    const task = await Task.create({
      projectId,
      title,
      description: description || '',
      assigneeId: assigneeId || null,
      reporterId: req.user._id,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      status: status || 'todo',
      version: 1
    });

    return res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.get('/:taskId', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task || task.isDeleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' }
      });
    }

    const allowed = await projectPermission(req.user._id, task.projectId.toString());
    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You cannot access this task' }
      });
    }

    const comments = await Comment.find({ taskId: task._id }).populate('userId', '-passwordHash').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { task, comments },
      message: 'Task fetched successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.patch('/:taskId', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task || task.isDeleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' }
      });
    }

    const user = await User.findById(req.user._id);
    const isAdmin = user.role === 'admin';
    const isPm = user.role === 'project_manager';
    const isAssignee = task.assigneeId?.toString() === req.user._id.toString();
    const isReporter = task.reporterId?.toString() === req.user._id.toString();

    if (!isAdmin && !isPm && !isAssignee && !isReporter) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You cannot modify this task' }
      });
    }

    const incomingVersion = Number(req.body.version ?? task.version);
    if (incomingVersion !== task.version) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'VERSION_CONFLICT',
          message: 'Task was updated by another user. Refresh and review the latest version.'
        }
      });
    }

    const { title, description, priority, dueDate, status, assigneeId } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (status) task.status = status;
    if (assigneeId !== undefined) task.assigneeId = assigneeId;

    task.version += 1;
    await task.save();

    return res.status(200).json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.patch('/:taskId/status', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task || task.isDeleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' }
      });
    }

    const user = await User.findById(req.user._id);
    const allowed = user.role === 'admin' || user.role === 'project_manager' || task.assigneeId?.toString() === req.user._id.toString();

    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You cannot update this task status' }
      });
    }

    const incomingVersion = Number(req.body.version ?? task.version);
    if (incomingVersion !== task.version) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'VERSION_CONFLICT',
          message: 'Another user updated this task. Refresh and retry.'
        }
      });
    }

    task.status = req.body.status || task.status;
    task.version += 1;
    await task.save();

    return res.status(200).json({
      success: true,
      data: task,
      message: 'Task status updated successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.delete('/:taskId', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task || task.isDeleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' }
      });
    }

    const user = await User.findById(req.user._id);
    const isAuthorized = user.role === 'admin' || user.role === 'project_manager';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admins and project managers can delete tasks' }
      });
    }

    task.isDeleted = true;
    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

export default router;
