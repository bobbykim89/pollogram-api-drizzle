import { relations } from 'drizzle-orm'
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
  createdAt: t.timestamp('created_at').defaultNow(),
  updatedAt: t.timestamp('updated_at').defaultNow(),
})

export const postTable = pgTable('posts', {
  id: t.integer('id').primaryKey().notNull().generatedAlwaysAsIdentity(),
  text: t.text('text'),
  imageId: t.varchar('image_id', { length: 256 }),
  profileId: t.integer('profile_id').references(() => profileTable.id),
  createdAt: t.timestamp('created_at').defaultNow(),
  updatedAt: t.timestamp('updated_at').defaultNow(),
})

export const commentTable = pgTable('comments', {
  id: t.integer('id').primaryKey().notNull().generatedAlwaysAsIdentity(),
  text: t.text('text'),
  profileId: t.integer('profile_id').references(() => profileTable.id),
  postId: t.integer('post_id').references(() => postTable.id),
  createdAt: t.timestamp('created_at').defaultNow(),
})

// relationship between userTable and profileTable
export const userToProfileRelations = relations(usersTable, ({ one }) => ({
  profile: one(profileTable),
}))

export const profileToUserRelations = relations(profileTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [profileTable.userId],
    references: [usersTable.id],
  }),
}))

// relationship between profileTable and postTable
export const profileToPostRelations = relations(profileTable, ({ many }) => ({
  posts: many(postTable),
}))

export const postToProfileRelations = relations(postTable, ({ one }) => ({
  userProfile: one(profileTable, {
    fields: [postTable.profileId],
    references: [profileTable.id],
  }),
}))
