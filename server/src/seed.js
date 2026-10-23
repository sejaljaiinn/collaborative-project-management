import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Project from './models/Project.js';
import ProjectMember from './models/ProjectMember.js';
import Task from './models/Task.js';

dotenv.config();

const seedUsers = [
  {
    fullName: 'Admin User',
    email: 'admin@projecthub.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    fullName: 'Project Manager',
    email: 'manager@projecthub.com',
    password: 'manager123',
    role: 'project_manager'
  },
  {
    fullName: 'Team Member',
    email: 'member@projecthub.com',
    password: 'member123',
    role: 'team_member'
  },
  {
    fullName: 'Viewer User',
    email: 'viewer@projecthub.com',
    password: 'viewer123',
    role: 'viewer'
  }
];

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/project_management';
    await mongoose.connect(mongoUri);

    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      ProjectMember.deleteMany({}),
      Task.deleteMany({})
    ]);

    const createdUsers = [];
    for (const userData of seedUsers) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        fullName: userData.fullName,
        email: userData.email,
        passwordHash,
        role: userData.role,
        isActive: true
      });
      createdUsers.push(user);
    }

    const admin = createdUsers.find((user) => user.role === 'admin');
    const manager = createdUsers.find((user) => user.role === 'project_manager');
    const member = createdUsers.find((user) => user.role === 'team_member');
    const viewer = createdUsers.find((user) => user.role === 'viewer');

    const project = await Project.create({
      name: 'Website Revamp',
      description: 'Redesign the product landing page and project management flows.',
      owner: admin._id,
      status: 'active'
    });

    await ProjectMember.create([
      { projectId: project._id, userId: admin._id, role: 'project_manager' },
      { projectId: project._id, userId: manager._id, role: 'project_manager' },
      { projectId: project._id, userId: member._id, role: 'team_member' },
      { projectId: project._id, userId: viewer._id, role: 'viewer' }
    ]);

    const task1 = await Task.create({
      projectId: project._id,
      title: 'Create landing page wireframes',
      description: 'Prepare low-fidelity views for homepage and pricing sections.',
      status: 'in_progress',
      priority: 'high',
      assigneeId: member._id,
      reporterId: manager._id,
      dueDate: new Date(Date.now() + 86400000 * 4),
      version: 1
    });

    await Task.create({
      projectId: project._id,
      title: 'QA the dashboard interactions',
      description: 'Validate the dashboard card interactions and navigation.',
      status: 'todo',
      priority: 'medium',
      assigneeId: member._id,
      reporterId: manager._id,
      dueDate: new Date(Date.now() + 86400000 * 7),
      version: 1
    });

    console.log('Seed data inserted successfully');
    console.log({
      admin: admin.email,
      manager: manager.email,
      member: member.email,
      viewer: viewer.email,
      task: task1.title
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
