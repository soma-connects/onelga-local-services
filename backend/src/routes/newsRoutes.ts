import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';
import {
  // Articles
  getPublishedArticles,
  getArticleBySlug,
  getAllArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  // Categories
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  // Tags
  getTags,
  // Comments
  createComment,
  approveComment,
  rejectComment,
  getPendingComments,
  // Stats
  getNewsStats
} from '../controllers/newsController';

import {
  createArticleValidation,
  updateArticleValidation,
  createCategoryValidation,
  updateCategoryValidation,
  createCommentValidation,
  paginationValidation,
  searchValidation,
  idValidation,
  slugValidation
} from '../middleware/newsValidation';

const router = express.Router();

// PUBLIC ROUTES - Articles
/**
 * @swagger
 * /api/news/articles:
 *   get:
 *     tags: [News]
 *     summary: Get published articles with pagination and filtering
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of articles per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category slug
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag slug
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, excerpt, and content
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter featured articles
 *       - in: query
 *         name: breaking
 *         schema:
 *           type: boolean
 *         description: Filter breaking news
 *     responses:
 *       200:
 *         description: List of published articles
 */
router.get('/articles', [...paginationValidation, ...searchValidation], getPublishedArticles);

/**
 * @swagger
 * /api/news/articles/{slug}:
 *   get:
 *     tags: [News]
 *     summary: Get a single article by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article details with comments
 *       404:
 *         description: Article not found
 */
router.get('/articles/:slug', slugValidation, getArticleBySlug);

// PUBLIC ROUTES - Categories
/**
 * @swagger
 * /api/news/categories:
 *   get:
 *     tags: [News]
 *     summary: Get all active categories
 *     parameters:
 *       - in: query
 *         name: active_only
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter only active categories
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', getCategories);

// PUBLIC ROUTES - Tags
/**
 * @swagger
 * /api/news/tags:
 *   get:
 *     tags: [News]
 *     summary: Get all tags
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search for tags by name
 *     responses:
 *       200:
 *         description: List of tags
 */
router.get('/tags', getTags);

// AUTHENTICATED ROUTES - Comments
/**
 * @swagger
 * /api/news/comments:
 *   post:
 *     tags: [News]
 *     summary: Create a new comment on an article
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - articleId
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 1000
 *               articleId:
 *                 type: string
 *               parentId:
 *                 type: string
 *                 description: ID of parent comment for replies
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/comments', authenticateToken, createCommentValidation, createComment);

// ADMIN ROUTES - Articles Management
/**
 * @swagger
 * /api/news/admin/articles:
 *   get:
 *     tags: [News Admin]
 *     summary: Get all articles (including drafts) - Admin only
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all articles
 *       403:
 *         description: Admin access required
 */
router.get('/admin/articles', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'STAFF'), 
  [...paginationValidation, ...searchValidation], 
  getAllArticles
);

/**
 * @swagger
 * /api/news/admin/articles:
 *   post:
 *     tags: [News Admin]
 *     summary: Create a new article - Admin only
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - categoryId
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *               excerpt:
 *                 type: string
 *                 maxLength: 500
 *               content:
 *                 type: string
 *                 minLength: 50
 *               featuredImage:
 *                 type: string
 *                 format: url
 *               metaTitle:
 *                 type: string
 *                 maxLength: 60
 *               metaDescription:
 *                 type: string
 *                 maxLength: 160
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *                 default: DRAFT
 *               isBreaking:
 *                 type: boolean
 *                 default: false
 *               isFeatured:
 *                 type: boolean
 *                 default: false
 *               categoryId:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Article created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 */
router.post('/admin/articles', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'STAFF'), 
  createArticleValidation, 
  createArticle
);

/**
 * @swagger
 * /api/news/admin/articles/{id}:
 *   put:
 *     tags: [News Admin]
 *     summary: Update an article - Admin only
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *               excerpt:
 *                 type: string
 *                 maxLength: 500
 *               content:
 *                 type: string
 *                 minLength: 50
 *               featuredImage:
 *                 type: string
 *                 format: url
 *               metaTitle:
 *                 type: string
 *                 maxLength: 60
 *               metaDescription:
 *                 type: string
 *                 maxLength: 160
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *               isBreaking:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *               categoryId:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Article updated successfully
 *       404:
 *         description: Article not found
 *       403:
 *         description: Admin access required
 */
router.put('/admin/articles/:id', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'STAFF'), 
  updateArticleValidation, 
  updateArticle
);

/**
 * @swagger
 * /api/news/admin/articles/{id}:
 *   delete:
 *     tags: [News Admin]
 *     summary: Delete an article - Admin only
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article deleted successfully
 *       404:
 *         description: Article not found
 *       403:
 *         description: Admin access required
 */
router.delete('/admin/articles/:id', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'STAFF'), 
  idValidation, 
  deleteArticle
);

// ADMIN ROUTES - Categories Management
/**
 * @swagger
 * /api/news/admin/categories:
 *   post:
 *     tags: [News Admin]
 *     summary: Create a new category - Admin only
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 */
router.post('/admin/categories', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'STAFF'), 
  createCategoryValidation, 
  createCategory
);

/**
 * @swagger
 * /api/news/admin/categories/{id}:
 *   put:
 *     tags: [News Admin]
 *     summary: Update a category - Admin only
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 *       403:
 *         description: Admin access required
 */
router.put('/admin/categories/:id', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'STAFF'), 
  updateCategoryValidation, 
  updateCategory
);

/**
 * @swagger
 * /api/news/admin/categories/{id}:
 *   delete:
 *     tags: [News Admin]
 *     summary: Delete a category - Admin only
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Cannot delete category with associated articles
 *       404:
 *         description: Category not found
 *       403:
 *         description: Admin access required
 */
router.delete('/admin/categories/:id', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'STAFF'), 
  idValidation, 
  deleteCategory
);

// ADMIN ROUTES - Comments Management
/**
 * @swagger
 * /api/news/admin/comments/pending:
 *   get:
 *     tags: [News Admin]
 *     summary: Get pending comments for moderation - Admin only
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: List of pending comments
 *       403:
 *         description: Admin access required
 */
router.get('/admin/comments/pending', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'STAFF'), 
  paginationValidation, 
  getPendingComments
);

/**
 * @swagger
 * /api/news/admin/comments/{id}/approve:
 *   patch:
 *     tags: [News Admin]
 *     summary: Approve a comment - Admin only
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment approved successfully
 *       404:
 *         description: Comment not found
 *       403:
 *         description: Admin access required
 */
router.patch('/admin/comments/:id/approve', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'STAFF'), 
  idValidation, 
  approveComment
);

/**
 * @swagger
 * /api/news/admin/comments/{id}/reject:
 *   patch:
 *     tags: [News Admin]
 *     summary: Reject a comment - Admin only
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment rejected successfully
 *       404:
 *         description: Comment not found
 *       403:
 *         description: Admin access required
 */
router.patch('/admin/comments/:id/reject', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'STAFF'), 
  idValidation, 
  rejectComment
);

// ADMIN ROUTES - Statistics
/**
 * @swagger
 * /api/news/admin/stats:
 *   get:
 *     tags: [News Admin]
 *     summary: Get news statistics and analytics - Admin only
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: News statistics and recent articles
 *       403:
 *         description: Admin access required
 */
router.get('/admin/stats', 
  authenticateToken, 
  authorizeRoles('ADMIN', 'STAFF'), 
  getNewsStats
);

export default router;
