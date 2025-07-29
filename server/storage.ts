import {
  users,
  departments,
  files,
  comments,
  type User,
  type UpsertUser,
  type Department,
  type InsertDepartment,
  type File,
  type InsertFile,
  type Comment,
  type InsertComment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, ilike, or, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Department operations
  getDepartments(): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  getDepartmentByName(name: string): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  
  // File operations
  getFiles(options?: {
    departmentId?: number;
    uploadedBy?: string;
    status?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<File[]>;
  getFile(id: number): Promise<File | undefined>;
  createFile(file: InsertFile & { uploadedBy: string }): Promise<File>;
  updateFileStatus(id: number, status: string): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  
  // Comment operations
  getFileComments(fileId: number): Promise<Comment[]>;
  createComment(comment: InsertComment & { authorId: string }): Promise<Comment>;
  
  // Stats operations
  getFileStats(): Promise<{
    totalFiles: number;
    pendingFiles: number;
    approvedFiles: number;
    rejectedFiles: number;
    totalSize: number;
  }>;
  getDepartmentStats(departmentId: number): Promise<{
    fileCount: number;
    totalSize: number;
    pendingCount: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Department operations
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments).orderBy(departments.name);
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department;
  }

  async getDepartmentByName(name: string): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.name, name));
    return department;
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [created] = await db.insert(departments).values(department).returning();
    return created;
  }

  // File operations
  async getFiles(options: {
    departmentId?: number;
    uploadedBy?: string;
    status?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<File[]> {
    let query = db.select().from(files);
    
    const conditions = [];
    
    if (options.departmentId) {
      conditions.push(eq(files.departmentId, options.departmentId));
    }
    
    if (options.uploadedBy) {
      conditions.push(eq(files.uploadedBy, options.uploadedBy));
    }
    
    if (options.status) {
      conditions.push(eq(files.status, options.status));
    }
    
    if (options.category) {
      conditions.push(eq(files.category, options.category));
    }
    
    if (options.search) {
      conditions.push(
        or(
          ilike(files.title, `%${options.search}%`),
          ilike(files.description, `%${options.search}%`),
          ilike(files.filename, `%${options.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(desc(files.createdAt));
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }

  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async createFile(fileData: InsertFile & { uploadedBy: string }): Promise<File> {
    const [file] = await db.insert(files).values(fileData).returning();
    return file;
  }

  async updateFileStatus(id: number, status: string): Promise<File | undefined> {
    const [file] = await db
      .update(files)
      .set({ status, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return file;
  }

  async deleteFile(id: number): Promise<boolean> {
    const result = await db.delete(files).where(eq(files.id, id));
    return result.rowCount > 0;
  }

  // Comment operations
  async getFileComments(fileId: number): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.fileId, fileId))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(commentData: InsertComment & { authorId: string }): Promise<Comment> {
    const [comment] = await db.insert(comments).values(commentData).returning();
    return comment;
  }

  // Stats operations
  async getFileStats(): Promise<{
    totalFiles: number;
    pendingFiles: number;
    approvedFiles: number;
    rejectedFiles: number;
    totalSize: number;
  }> {
    const allFiles = await db.select().from(files);
    
    return {
      totalFiles: allFiles.length,
      pendingFiles: allFiles.filter(f => f.status === 'pending').length,
      approvedFiles: allFiles.filter(f => f.status === 'approved').length,
      rejectedFiles: allFiles.filter(f => f.status === 'rejected').length,
      totalSize: allFiles.reduce((sum, f) => sum + f.size, 0),
    };
  }

  async getDepartmentStats(departmentId: number): Promise<{
    fileCount: number;
    totalSize: number;
    pendingCount: number;
  }> {
    const departmentFiles = await db
      .select()
      .from(files)
      .where(eq(files.departmentId, departmentId));
    
    return {
      fileCount: departmentFiles.length,
      totalSize: departmentFiles.reduce((sum, f) => sum + f.size, 0),
      pendingCount: departmentFiles.filter(f => f.status === 'pending').length,
    };
  }
}

export const storage = new DatabaseStorage();
