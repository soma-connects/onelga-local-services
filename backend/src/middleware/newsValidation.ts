import { body, param, query } from 'express-validator';

// Article validation rules
export const createArticleValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('excerpt')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Excerpt must not exceed 500 characters'),
  
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters long'),
  
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('Featured image must be a valid URL'),
  
  body('metaTitle')
    .optional()
    .isLength({ max: 60 })
    .withMessage('Meta title must not exceed 60 characters'),
  
  body('metaDescription')
    .optional()
    .isLength({ max: 160 })
    .withMessage('Meta description must not exceed 160 characters'),
  
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED'),
  
  body('isBreaking')
    .optional()
    .isBoolean()
    .withMessage('isBreaking must be a boolean'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  
  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
    .isString()
    .withMessage('Category ID must be a string'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters')
];

export const updateArticleValidation = [
  param('id')
    .notEmpty()
    .withMessage('Article ID is required'),
  
  body('title')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('excerpt')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Excerpt must not exceed 500 characters'),
  
  body('content')
    .optional()
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters long'),
  
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('Featured image must be a valid URL'),
  
  body('metaTitle')
    .optional()
    .isLength({ max: 60 })
    .withMessage('Meta title must not exceed 60 characters'),
  
  body('metaDescription')
    .optional()
    .isLength({ max: 160 })
    .withMessage('Meta description must not exceed 160 characters'),
  
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED'),
  
  body('isBreaking')
    .optional()
    .isBoolean()
    .withMessage('isBreaking must be a boolean'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  
  body('categoryId')
    .optional()
    .isString()
    .withMessage('Category ID must be a string'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string')
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters')
];

// Category validation rules
export const createCategoryValidation = [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
];

export const updateCategoryValidation = [
  param('id')
    .notEmpty()
    .withMessage('Category ID is required'),
  
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Comment validation rules
export const createCommentValidation = [
  body('content')
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Comment must be between 5 and 1000 characters'),
  
  body('articleId')
    .notEmpty()
    .withMessage('Article ID is required')
    .isString()
    .withMessage('Article ID must be a string'),
  
  body('parentId')
    .optional()
    .isString()
    .withMessage('Parent comment ID must be a string')
];

// Query parameter validation
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const searchValidation = [
  query('search')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  
  query('tag')
    .optional()
    .isString()
    .withMessage('Tag must be a string'),
  
  query('featured')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Featured must be true or false'),
  
  query('breaking')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Breaking must be true or false')
];

// ID parameter validation
export const idValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isString()
    .withMessage('ID must be a string')
];

export const slugValidation = [
  param('slug')
    .notEmpty()
    .withMessage('Slug is required')
    .isString()
    .withMessage('Slug must be a string')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens')
];