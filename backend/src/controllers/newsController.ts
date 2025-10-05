import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Helper function to ensure unique slug
const ensureUniqueSlug = async (baseSlug: string, model: 'article' | 'category' | 'tag', excludeId?: string): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existing = await (model === 'article' 
      ? prisma.newsArticle.findFirst({ where: { slug, ...(excludeId && { id: { not: excludeId } }) } })
      : model === 'category'
      ? prisma.newsCategory.findFirst({ where: { slug, ...(excludeId && { id: { not: excludeId } }) } })
      : prisma.newsTag.findFirst({ where: { slug, ...(excludeId && { id: { not: excludeId } }) } })
    );
    
    if (!existing) break;
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

// NEWS ARTICLES CONTROLLERS

export const getPublishedArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      tag, 
      search, 
      featured,
      breaking 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {
      status: 'PUBLISHED',
      publishedAt: { lte: new Date() }
    };

    if (category) {
      where.category = { slug: category };
    }

    if (tag) {
      where.tags = { some: { slug: tag } };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { excerpt: { contains: search as string } },
        { content: { contains: search as string } }
      ];
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (breaking === 'true') {
      where.isBreaking = true;
    }

    const [articles, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true
            }
          },
          category: true,
          tags: true,
          _count: { select: { comments: { where: { status: 'APPROVED' } } } }
        },
        orderBy: [
          { isBreaking: 'desc' },
          { isFeatured: 'desc' },
          { publishedAt: 'desc' }
        ],
        skip,
        take: Number(limit)
      }),
      prisma.newsArticle.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching published articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles'
    });
  }
};

export const getArticleBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const article = await prisma.newsArticle.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        },
        category: true,
        tags: true,
        comments: {
          where: { 
            status: 'APPROVED',
            parentId: null 
          },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true
              }
            },
            replies: {
              where: { status: 'APPROVED' },
              include: {
                author: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profilePicture: true
                  }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!article || article.status !== 'PUBLISHED') {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
      return;
    }

    // Increment view count
    await prisma.newsArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } }
    });

    res.json({
      success: true,
      data: { ...article, viewCount: article.viewCount + 1 }
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch article'
    });
  }
};

export const createArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const {
      title,
      excerpt,
      content,
      featuredImage,
      metaTitle,
      metaDescription,
      status = 'DRAFT',
      isBreaking = false,
      isFeatured = false,
      categoryId,
      tags = []
    } = req.body;

    const authorId = (req as any).user?.id;
    if (!authorId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    // Generate and ensure unique slug
    const baseSlug = generateSlug(title);
    const slug = await ensureUniqueSlug(baseSlug, 'article');

    // Handle tags - create new ones if they don't exist
    const tagConnections = [];
    for (const tagName of tags) {
      let tag = await prisma.newsTag.findFirst({
        where: { name: tagName.trim() }
      });

      if (!tag) {
        const tagSlug = await ensureUniqueSlug(generateSlug(tagName.trim()), 'tag');
        tag = await prisma.newsTag.create({
          data: {
            name: tagName.trim(),
            slug: tagSlug
          }
        });
      }

      tagConnections.push({ id: tag.id });
    }

    const publishedAt = status === 'PUBLISHED' ? new Date() : null;

    const article = await prisma.newsArticle.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        status,
        isBreaking,
        isFeatured,
        publishedAt,
        authorId,
        categoryId,
        tags: {
          connect: tagConnections
        }
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        },
        category: true,
        tags: true
      }
    });

    res.status(201).json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create article'
    });
  }
};

export const updateArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;
    const {
      title,
      excerpt,
      content,
      featuredImage,
      metaTitle,
      metaDescription,
      status,
      isBreaking,
      isFeatured,
      categoryId,
      tags = []
    } = req.body;

    const existingArticle = await prisma.newsArticle.findUnique({
      where: { id },
      include: { tags: true }
    });

    if (!existingArticle) {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
      return;
    }

    let slug = existingArticle.slug;
    if (title && title !== existingArticle.title) {
      const baseSlug = generateSlug(title);
      slug = await ensureUniqueSlug(baseSlug, 'article', id);
    }

    // Handle tags
    const tagConnections = [];
    for (const tagName of tags) {
      let tag = await prisma.newsTag.findFirst({
        where: { name: tagName.trim() }
      });

      if (!tag) {
        const tagSlug = await ensureUniqueSlug(generateSlug(tagName.trim()), 'tag');
        tag = await prisma.newsTag.create({
          data: {
            name: tagName.trim(),
            slug: tagSlug
          }
        });
      }

      tagConnections.push({ id: tag.id });
    }

    const publishedAt = status === 'PUBLISHED' && !existingArticle.publishedAt
      ? new Date()
      : existingArticle.publishedAt;

    const article = await prisma.newsArticle.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        status,
        isBreaking,
        isFeatured,
        publishedAt,
        categoryId,
        tags: {
          set: [], // Disconnect all tags first
          connect: tagConnections
        }
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        },
        category: true,
        tags: true
      }
    });

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update article'
    });
  }
};

export const deleteArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const article = await prisma.newsArticle.findUnique({
      where: { id }
    });

    if (!article) {
      res.status(404).json({
        success: false,
        message: 'Article not found'
      });
      return;
    }

    await prisma.newsArticle.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete article'
    });
  }
};

// ADMIN: Get all articles (including drafts)
export const getAllArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      search 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { excerpt: { contains: search as string } }
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true
            }
          },
          category: true,
          tags: true,
          _count: { select: { comments: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.newsArticle.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles'
    });
  }
};

// CATEGORIES CONTROLLERS

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { active_only = 'true' } = req.query;
    
    const where: any = {};
    if (active_only === 'true') {
      where.isActive = true;
    }

    const categories = await prisma.newsCategory.findMany({
      where,
      include: {
        _count: { 
          select: { 
            articles: { 
              where: { status: 'PUBLISHED' } 
            } 
          } 
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { name, description } = req.body;
    
    const baseSlug = generateSlug(name);
    const slug = await ensureUniqueSlug(baseSlug, 'category');

    const category = await prisma.newsCategory.create({
      data: {
        name,
        description,
        slug
      }
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const existingCategory = await prisma.newsCategory.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    let slug = existingCategory.slug;
    if (name && name !== existingCategory.name) {
      const baseSlug = generateSlug(name);
      slug = await ensureUniqueSlug(baseSlug, 'category', id);
    }

    const category = await prisma.newsCategory.update({
      where: { id },
      data: {
        name,
        description,
        slug,
        isActive
      }
    });

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await prisma.newsCategory.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } }
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    if (category._count.articles > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete category with associated articles'
      });
      return;
    }

    await prisma.newsCategory.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

// TAGS CONTROLLERS

export const getTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    
    const where: any = {};
    if (search) {
      where.name = { contains: search as string };
    }

    const tags = await prisma.newsTag.findMany({
      where,
      include: {
        _count: { 
          select: { 
            articles: { 
              where: { status: 'PUBLISHED' } 
            } 
          } 
        }
      },
      orderBy: { name: 'asc' },
      take: 50 // Limit to 50 tags for performance
    });

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags'
    });
  }
};

// COMMENTS CONTROLLERS

export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array()
      });
      return;
    }

    const { content, articleId, parentId } = req.body;
    const authorId = (req as any).user?.id;

    if (!authorId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
      return;
    }

    const comment = await prisma.newsComment.create({
      data: {
        content,
        authorId,
        articleId,
        parentId: parentId || null,
        isReply: !!parentId
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create comment'
    });
  }
};

export const approveComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const comment = await prisma.newsComment.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error approving comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve comment'
    });
  }
};

export const rejectComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const comment = await prisma.newsComment.update({
      where: { id },
      data: { status: 'REJECTED' }
    });

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Error rejecting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject comment'
    });
  }
};

export const getPendingComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [comments, total] = await Promise.all([
      prisma.newsComment.findMany({
        where: { status: 'PENDING' },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true
            }
          },
          article: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.newsComment.count({ where: { status: 'PENDING' } })
    ]);

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching pending comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending comments'
    });
  }
};

// Analytics and Stats
export const getNewsStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews,
      totalComments,
      pendingComments,
      categories,
      recentArticles
    ] = await Promise.all([
      prisma.newsArticle.count(),
      prisma.newsArticle.count({ where: { status: 'PUBLISHED' } }),
      prisma.newsArticle.count({ where: { status: 'DRAFT' } }),
      prisma.newsArticle.aggregate({ _sum: { viewCount: true } }),
      prisma.newsComment.count({ where: { status: 'APPROVED' } }),
      prisma.newsComment.count({ where: { status: 'PENDING' } }),
      prisma.newsCategory.count({ where: { isActive: true } }),
      prisma.newsArticle.findMany({
        where: { status: 'PUBLISHED' },
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          category: true,
          _count: { select: { comments: { where: { status: 'APPROVED' } } } }
        },
        orderBy: { publishedAt: 'desc' },
        take: 5
      })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalArticles,
          publishedArticles,
          draftArticles,
          totalViews: totalViews._sum.viewCount || 0,
          totalComments,
          pendingComments,
          categories
        },
        recentArticles
      }
    });
  } catch (error) {
    console.error('Error fetching news stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news statistics'
    });
  }
};