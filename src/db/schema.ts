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

// follow/like relations

export const follow = pgTable(
  'follow',
  {
    followedById: t
      .integer('followed_by_id')
      .notNull()
      .references(() => profileTable.id, { onDelete: 'cascade' }),
    followingId: t
      .integer('following_id')
      .notNull()
      .references(() => profileTable.id, { onDelete: 'cascade' }),
  },
  (table) => [
    t.primaryKey({ columns: [table.followingId, table.followedById] }),
  ]
)

export const postLike = pgTable(
  'post_like',
  {
    profileId: t
      .integer('profile_id')
      .notNull()
      .references(() => profileTable.id, { onDelete: 'cascade' }),
    postId: t
      .integer('post_id')
      .notNull()
      .references(() => postTable.id, { onDelete: 'cascade' }),
  },
  (table) => [t.primaryKey({ columns: [table.profileId, table.postId] })]
)

export const commentLike = pgTable(
  'comment_like',
  {
    profileId: t
      .integer('profile_id')
      .notNull()
      .references(() => profileTable.id, { onDelete: 'cascade' }),
    commentId: t
      .integer('comment_id')
      .notNull()
      .references(() => commentTable.id, { onDelete: 'cascade' }),
  },
  (table) => [t.primaryKey({ columns: [table.profileId, table.commentId] })]
)

// relationship between tables
export const userRelations = relations(usersTable, ({ one }) => ({
  profile: one(profileTable),
}))
export const profileRelations = relations(profileTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [profileTable.userId],
    references: [usersTable.id],
  }),
  posts: many(postTable),
  comments: many(commentTable),
  following: many(follow),
  followedBy: many(follow),
  likedPosts: many(postLike),
  likedComments: many(commentLike),
}))

export const postRelations = relations(postTable, ({ one, many }) => ({
  userProfile: one(profileTable, {
    fields: [postTable.profileId],
    references: [profileTable.id],
  }),
  comments: many(commentTable),
  likedBy: many(postLike),
}))

export const commentRelations = relations(commentTable, ({ one, many }) => ({
  userProfile: one(profileTable, {
    fields: [commentTable.profileId],
    references: [profileTable.id],
  }),
  post: one(postTable, {
    fields: [commentTable.postId],
    references: [postTable.id],
  }),
  likedBy: many(commentLike),
}))

export const followRelations = relations(follow, ({ one }) => ({
  followedBy: one(profileTable, {
    fields: [follow.followedById],
    references: [profileTable.id],
  }),
  following: one(profileTable, {
    fields: [follow.followingId],
    references: [profileTable.id],
  }),
}))

export const postLikeRelations = relations(postLike, ({ one }) => ({
  profile: one(profileTable, {
    fields: [postLike.profileId],
    references: [profileTable.id],
  }),
  likedPost: one(postTable, {
    fields: [postLike.postId],
    references: [postTable.id],
  }),
}))

export const commentLikeRelations = relations(commentLike, ({ one }) => ({
  profile: one(profileTable, {
    fields: [commentLike.profileId],
    references: [profileTable.id],
  }),
  likedComment: one(commentTable, {
    fields: [commentLike.commentId],
    references: [commentTable.id],
  }),
}))
