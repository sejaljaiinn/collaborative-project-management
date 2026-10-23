import express from 'express';
import Project from '../models/Project.js';
import ProjectMember from '../models/ProjectMember.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

const canViewProject = async (userId, projectId) => {
  const project = await Project.findById(projectId);
  if (!project) return false;

  if (project.owner.toString() === userId.toString()) return true;

  const member = await ProjectMember.findOne({ projectId, userId });
  if (member) return true;

  const user = await User.findById(userId);
  return user?.role === 'admin';
};

const canManageProject = async (userId, projectId) => {
  const project = await Project.findById(projectId);
  if (!project) return false;

  const user = await User.findById(userId);
  if (user?.role === 'admin') return true;
  if (project.owner.toString() === userId.toString()) return true;

  const member = await ProjectMember.findOne({ projectId, userId, role: 'project_manager' });
  return !!member;
};

router.get('/', protect, async (req, res) => {
  try {
    const user = req.user;

    let projects;
    if (user.role === 'admin') {
      projects = await Project.find({}).sort({ updatedAt: -1 }).lean();
    } else {
      const memberships = await ProjectMember.find({ userId: user._id }).lean();
      const projectIds = memberships.map((item) => item.projectId);
      projects = await Project.find({
        $or: [
          { _id: { $in: projectIds } },
          { owner: user._id }
        ]
      }).sort({ updatedAt: -1 }).lean();
    }

    return res.status(200).json({
      success: true,
      data: projects,
      message: 'Projects fetched successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.post('/', protect, authorize('admin', 'project_manager'), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Project name is required' }
      });
    }

    const project = await Project.create({
      name,
      description: description || '',
      owner: req.user._id,
      status: 'active'
    });

    await ProjectMember.create({
      projectId: project._id,
      userId: req.user._id,
      role: 'project_manager'
    });

    return res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    const allowed = await canViewProject(req.user._id, req.params.id);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not a member of this project' }
      });
    }

    const members = await ProjectMember.find({ projectId: project._id }).populate('userId', '-passwordHash');

    return res.status(200).json({
      success: true,
      data: {
        project,
        members
      },
      message: 'Project fetched successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.patch('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    const allowed = await canManageProject(req.user._id, req.params.id);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not allowed to update this project' }
      });
    }

    const { name, description, status } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;

    await project.save();

    return res.status(200).json({
      success: true,
      data: project,
      message: 'Project updated successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.patch('/:id/archive', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    const allowed = await canManageProject(req.user._id, req.params.id);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You cannot archive this project' }
      });
    }

    project.status = project.status === 'archived' ? 'active' : 'archived';
    project.archivedAt = project.status === 'archived' ? new Date() : null;
    await project.save();

    return res.status(200).json({
      success: true,
      data: project,
      message: `Project ${project.status === 'archived' ? 'archived' : 'restored'} successfully`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.get('/:id/members', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' }
      });
    }

    const allowed = await canViewProject(req.user._id, req.params.id);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You cannot view members for this project' }
      });
    }

    const members = await ProjectMember.find({ projectId: project._id }).populate('userId', '-passwordHash');

    return res.status(200).json({
      success: true,
      data: members,
      message: 'Members fetched successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.post('/:id/members', protect, async (req, res) => {
  try {
    const { userId, role } = req.body;
    const isAllowed = await canManageProject(req.user._id, req.params.id);
    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You cannot manage project members' }
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }

    const membership = await ProjectMember.findOneAndUpdate(
      { projectId: req.params.id, userId },
      { role: role || 'team_member' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      success: true,
      data: membership,
      message: 'Member added successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.patch('/:id/members/:userId/role', protect, async (req, res) => {
  try {
    const allowed = await canManageProject(req.user._id, req.params.id);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You cannot update member roles' }
      });
    }

    const member = await ProjectMember.findOne({ projectId: req.params.id, userId: req.params.userId });
    if (!member) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Member not found' }
      });
    }

    member.role = req.body.role || member.role;
    await member.save();

    return res.status(200).json({
      success: true,
      data: member,
      message: 'Member role updated successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.delete('/:id/members/:userId', protect, async (req, res) => {
  try {
    const allowed = await canManageProject(req.user._id, req.params.id);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You cannot remove members from this project' }
      });
    }

    const result = await ProjectMember.findOneAndDelete({ projectId: req.params.id, userId: req.params.userId });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Member not found' }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

export default router;
