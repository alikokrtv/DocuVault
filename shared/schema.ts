import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  serial,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth  
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("department"), // "department" or "admin"
  departmentName: varchar("department_name"), // null for admin users
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  icon: varchar("icon").notNull().default("fas fa-building"),
  color: varchar("color").notNull().default("blue"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  filename: varchar("filename").notNull(), // original filename
  storedFilename: varchar("stored_filename").notNull(), // hashed filename for security
  mimeType: varchar("mime_type").notNull(),
  size: integer("size").notNull(), // file size in bytes
  category: varchar("category"),
  status: varchar("status").notNull().default("pending"), // "pending", "approved", "rejected"
  uploadedBy: varchar("uploaded_by").notNull(),
  departmentId: integer("department_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  fileId: integer("file_id").notNull(),
  authorId: varchar("author_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  files: many(files),
  comments: many(comments),
  department: one(departments, {
    fields: [users.departmentName],
    references: [departments.name],
  }),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  files: many(files),
  users: many(users),
}));

export const filesRelations = relations(files, ({ one, many }) => ({
  uploader: one(users, {
    fields: [files.uploadedBy],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [files.departmentId],
    references: [departments.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  file: one(files, {
    fields: [comments.fileId],
    references: [files.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;
export type File = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  uploadedBy: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  authorId: true,
});

export type InsertUserType = z.infer<typeof insertUserSchema>;
export type InsertDepartmentType = z.infer<typeof insertDepartmentSchema>;
export type InsertFileType = z.infer<typeof insertFileSchema>;
export type InsertCommentType = z.infer<typeof insertCommentSchema>;
