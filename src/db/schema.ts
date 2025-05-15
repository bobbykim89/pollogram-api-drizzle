import { pgTable, pgEnum } from 'drizzle-orm/pg-core'
import * as t from 'drizzle-orm/pg-core'

export const userRoles = pgEnum('user_roles', ['USER', 'MANAGER', 'ADMIN'])

export const usersTable = pgTable('users', {
  id: t.integer('id').primaryKey().notNull().generatedAlwaysAsIdentity(),
  email: t.varchar('email', { length: 256 }).notNull().unique(),
  password: t.text('password').notNull(),
  role: userRoles().default('USER'),
  createdAt: t.timestamp('created_at').defaultNow(),
  updatedAt: t.timestamp('updated_at').defaultNow(),
})

export const profileTable = pgTable('profiles', {
  id: t.integer('id').primaryKey().notNull().generatedAlwaysAsIdentity(),
  username: t.varchar('user_name', { length: 256 }).notNull().unique(),
  imageId: t.varchar('image_id', { length: 256 }),
  profileDescription: t.text('profile_description'),
  userId: t.integer('user_id').references(() => usersTable.id),
})
