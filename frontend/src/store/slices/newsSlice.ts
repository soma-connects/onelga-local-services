import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isBreaking: boolean;
  isFeatured: boolean;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  category: NewsCategory;
  tags: NewsTag[];
  comments?: NewsComment[];
  _count: {
    comments: number;
  };
}

export interface NewsCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    articles: number;
  };
}

export interface NewsTag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count?: {
    articles: number;
  };
}

export interface NewsComment {
  id: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isReply: boolean;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  replies?: NewsComment[];
}

export interface NewsState {
  articles: {
    items: NewsArticle[];
    total: number;
    loading: boolean;
    error: string | null;
    pagination: {
      page: number;
      limit: number;
      pages: number;
    };
  };
  featuredArticles: {
    items: NewsArticle[];
    loading: boolean;
    error: string | null;
  };
  breakingNews: {
    items: NewsArticle[];
    loading: boolean;
    error: string | null;
  };
  currentArticle: {
    data: NewsArticle | null;
    loading: boolean;
    error: string | null;
  };
  comments: {
    items: NewsComment[];
    loading: boolean;
    error: string | null;
  };
  categories: {
    items: NewsCategory[];
    loading: boolean;
    error: string | null;
  };
  tags: {
    items: NewsTag[];
    loading: boolean;
    error: string | null;
  };
  filters: {
    category?: string;
    tag?: string;
    search?: string;
    featured?: boolean;
    breaking?: boolean;
  };
}

const initialState: NewsState = {
  articles: {
    items: [],
    total: 0,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      pages: 0,
    },
  },
  featuredArticles: {
    items: [],
    loading: false,
    error: null,
  },
  breakingNews: {
    items: [],
    loading: false,
    error: null,
  },
  currentArticle: {
    data: null,
    loading: false,
    error: null,
  },
  comments: {
    items: [],
    loading: false,
    error: null,
  },
  categories: {
    items: [],
    loading: false,
    error: null,
  },
  tags: {
    items: [],
    loading: false,
    error: null,
  },
  filters: {},
};

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchArticles = createAsyncThunk(
  'news/fetchArticles',
  async (params: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
    featured?: boolean;
    breaking?: boolean;
  } = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.tag) queryParams.append('tag', params.tag);
    if (params.search) queryParams.append('search', params.search);
    if (params.featured) queryParams.append('featured', 'true');
    if (params.breaking) queryParams.append('breaking', 'true');

    const response = await axios.get(`${API_BASE_URL}/news/articles?${queryParams}`);
    return response.data.data;
  }
);

export const fetchFeaturedArticles = createAsyncThunk(
  'news/fetchFeaturedArticles',
  async () => {
    const response = await axios.get(`${API_BASE_URL}/news/articles?featured=true&limit=6`);
    return response.data.data.articles;
  }
);

export const fetchBreakingNews = createAsyncThunk(
  'news/fetchBreakingNews',
  async () => {
    const response = await axios.get(`${API_BASE_URL}/news/articles?breaking=true&limit=3`);
    return response.data.data.articles;
  }
);

export const fetchArticleBySlug = createAsyncThunk(
  'news/fetchArticleBySlug',
  async (slug: string) => {
    const response = await axios.get(`${API_BASE_URL}/news/articles/${slug}`);
    return response.data.data;
  }
);

export const fetchCategories = createAsyncThunk(
  'news/fetchCategories',
  async () => {
    const response = await axios.get(`${API_BASE_URL}/news/categories`);
    return response.data.data;
  }
);

export const fetchTags = createAsyncThunk(
  'news/fetchTags',
  async (search?: string) => {
    const queryParams = search ? `?search=${search}` : '';
    const response = await axios.get(`${API_BASE_URL}/news/tags${queryParams}`);
    return response.data.data;
  }
);

export const fetchArticleComments = createAsyncThunk(
  'news/fetchArticleComments',
  async (articleId: string) => {
    const response = await axios.get(`${API_BASE_URL}/news/articles/${articleId}/comments`);
    return response.data.data;
  }
);

export const createComment = createAsyncThunk(
  'news/createComment',
  async (data: { content: string; articleId: string; parentId?: string }, { getState }) => {
    const state = getState() as any;
    const token = state.auth.token;
    
    const response = await axios.post(
      `${API_BASE_URL}/news/comments`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<NewsState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearCurrentArticle: (state) => {
      state.currentArticle.data = null;
      state.currentArticle.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Articles
      .addCase(fetchArticles.pending, (state) => {
        state.articles.loading = true;
        state.articles.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.articles.loading = false;
        state.articles.items = action.payload.articles;
        state.articles.total = action.payload.pagination.total;
        state.articles.pagination = action.payload.pagination;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.articles.loading = false;
        state.articles.error = action.error.message || 'Failed to fetch articles';
      })
      
      // Fetch Featured Articles
      .addCase(fetchFeaturedArticles.pending, (state) => {
        state.featuredArticles.loading = true;
        state.featuredArticles.error = null;
      })
      .addCase(fetchFeaturedArticles.fulfilled, (state, action) => {
        state.featuredArticles.loading = false;
        state.featuredArticles.items = action.payload;
      })
      .addCase(fetchFeaturedArticles.rejected, (state, action) => {
        state.featuredArticles.loading = false;
        state.featuredArticles.error = action.error.message || 'Failed to fetch featured articles';
      })
      
      // Fetch Breaking News
      .addCase(fetchBreakingNews.pending, (state) => {
        state.breakingNews.loading = true;
        state.breakingNews.error = null;
      })
      .addCase(fetchBreakingNews.fulfilled, (state, action) => {
        state.breakingNews.loading = false;
        state.breakingNews.items = action.payload;
      })
      .addCase(fetchBreakingNews.rejected, (state, action) => {
        state.breakingNews.loading = false;
        state.breakingNews.error = action.error.message || 'Failed to fetch breaking news';
      })
      
      // Fetch Article by Slug
      .addCase(fetchArticleBySlug.pending, (state) => {
        state.currentArticle.loading = true;
        state.currentArticle.error = null;
      })
      .addCase(fetchArticleBySlug.fulfilled, (state, action) => {
        state.currentArticle.loading = false;
        state.currentArticle.data = action.payload;
      })
      .addCase(fetchArticleBySlug.rejected, (state, action) => {
        state.currentArticle.loading = false;
        state.currentArticle.error = action.error.message || 'Failed to fetch article';
      })
      
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categories.loading = true;
        state.categories.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories.loading = false;
        state.categories.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categories.loading = false;
        state.categories.error = action.error.message || 'Failed to fetch categories';
      })
      
      // Fetch Tags
      .addCase(fetchTags.pending, (state) => {
        state.tags.loading = true;
        state.tags.error = null;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tags.loading = false;
        state.tags.items = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.tags.loading = false;
        state.tags.error = action.error.message || 'Failed to fetch tags';
      })
      
      // Fetch Article Comments
      .addCase(fetchArticleComments.pending, (state) => {
        state.comments.loading = true;
        state.comments.error = null;
      })
      .addCase(fetchArticleComments.fulfilled, (state, action) => {
        state.comments.loading = false;
        state.comments.items = action.payload;
      })
      .addCase(fetchArticleComments.rejected, (state, action) => {
        state.comments.loading = false;
        state.comments.error = action.error.message || 'Failed to fetch comments';
      });
  },
});

export const { setFilters, clearFilters, clearCurrentArticle } = newsSlice.actions;

export default newsSlice.reducer;