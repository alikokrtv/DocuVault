import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertFileSchema, insertCommentSchema, insertDepartmentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs/promises";

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = randomUUID() + ext;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'video/mp4',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Department routes
  app.get('/api/departments', isAuthenticated, async (req: any, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.post('/api/departments', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can create departments" });
      }

      const validatedData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(validatedData);
      res.json(department);
    } catch (error) {
      console.error("Error creating department:", error);
      res.status(500).json({ message: "Failed to create department" });
    }
  });

  // File routes
  app.get('/api/files', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { departmentId, status, category, search, limit, offset } = req.query;
      
      let options: any = {
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        status: status as string,
        category: category as string,
        search: search as string,
      };

      // If user is not admin, restrict to their department
      if (user.role !== 'admin') {
        const department = await storage.getDepartmentByName(user.departmentName!);
        if (department) {
          options.departmentId = department.id;
        }
        options.uploadedBy = user.id; // Users can only see their own files
      } else if (departmentId) {
        options.departmentId = parseInt(departmentId as string);
      }

      const files = await storage.getFiles(options);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.post('/api/files', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !user.departmentName) {
        return res.status(400).json({ message: "User must belong to a department" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const department = await storage.getDepartmentByName(user.departmentName);
      if (!department) {
        return res.status(400).json({ message: "Department not found" });
      }

      const fileData = {
        title: req.body.title,
        description: req.body.description || '',
        filename: req.file.originalname,
        storedFilename: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        category: req.body.category || null,
        departmentId: department.id,
        uploadedBy: user.id,
      };

      const validatedData = insertFileSchema.parse(fileData);
      const file = await storage.createFile({ ...validatedData, uploadedBy: user.id });
      
      res.json(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.patch('/api/files/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can update file status" });
      }

      const fileId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const file = await storage.updateFileStatus(fileId, status);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      res.json(file);
    } catch (error) {
      console.error("Error updating file status:", error);
      res.status(500).json({ message: "Failed to update file status" });
    }
  });

  app.delete('/api/files/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      const fileId = parseInt(req.params.id);
      
      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Users can only delete their own files, admins can delete any
      if (user?.role !== 'admin' && file.uploadedBy !== user?.id) {
        return res.status(403).json({ message: "Not authorized to delete this file" });
      }

      const success = await storage.deleteFile(fileId);
      if (success) {
        // Delete the physical file
        try {
          await fs.unlink(path.join(process.cwd(), 'uploads', file.storedFilename));
        } catch (error) {
          console.error("Error deleting physical file:", error);
        }
        res.json({ message: "File deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete file" });
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Comment routes
  app.get('/api/files/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const comments = await storage.getFileComments(fileId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/files/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can add comments" });
      }

      const fileId = parseInt(req.params.id);
      const commentData = insertCommentSchema.parse({
        ...req.body,
        fileId,
      });

      const comment = await storage.createComment({
        ...commentData,
        authorId: user.id,
      });

      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Stats routes
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can view stats" });
      }

      const stats = await storage.getFileStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/departments/:id/stats', isAuthenticated, async (req: any, res) => {
    try {
      const departmentId = parseInt(req.params.id);
      const stats = await storage.getDepartmentStats(departmentId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching department stats:", error);
      res.status(500).json({ message: "Failed to fetch department stats" });
    }
  });

  // Initialize default departments
  app.post('/api/init', async (req, res) => {
    try {
      const defaultDepartments = [
        { name: "HR Department", description: "Human Resources", icon: "fas fa-users", color: "green" },
        { name: "Finance", description: "Financial Department", icon: "fas fa-chart-line", color: "blue" },
        { name: "Marketing", description: "Marketing Department", icon: "fas fa-bullhorn", color: "purple" },
        { name: "Operations", description: "Operations Department", icon: "fas fa-cogs", color: "orange" },
        { name: "IT Department", description: "Information Technology", icon: "fas fa-laptop", color: "indigo" },
        { name: "Sales", description: "Sales Department", icon: "fas fa-handshake", color: "red" },
        { name: "Legal", description: "Legal Department", icon: "fas fa-gavel", color: "gray" },
        { name: "Quality Assurance", description: "Quality Control", icon: "fas fa-check-circle", color: "teal" },
      ];

      for (const dept of defaultDepartments) {
        try {
          await storage.createDepartment(dept);
        } catch (error) {
          // Department might already exist
        }
      }

      res.json({ message: "Initialization complete" });
    } catch (error) {
      console.error("Error initializing:", error);
      res.status(500).json({ message: "Failed to initialize" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
