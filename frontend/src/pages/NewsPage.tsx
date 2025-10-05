import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Skeleton,
  Container,
  Alert,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  SearchOutlined,
  CalendarTodayOutlined,
  VisibilityOutlined,
  CommentOutlined,
  NewspaperOutlined,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { RootState, AppDispatch } from '../store';
import {
  fetchArticles,
  fetchCategories,
  setFilters,
  clearFilters,
  NewsArticle,
} from '../store/slices/newsSlice';

const NewsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const {
    articles,
    categories,
  } = useSelector((state: RootState) => state.news);

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: 12,
      ...(searchParams.get('search') && { search: searchParams.get('search')! }),
      ...(searchParams.get('category') && { category: searchParams.get('category')! }),
      ...(currentTab === 1 && { featured: true }),
      ...(currentTab === 2 && { breaking: true }),
    };

    dispatch(fetchArticles(params));
    dispatch(setFilters(params));
  }, [dispatch, searchParams, currentTab]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (searchTerm) {
      newSearchParams.set('search', searchTerm);
    } else {
      newSearchParams.delete('search');
    }
    
    newSearchParams.set('page', '1');
    setSearchParams(newSearchParams);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (category) {
      newSearchParams.set('category', category);
    } else {
      newSearchParams.delete('category');
    }
    
    newSearchParams.set('page', '1');
    setSearchParams(newSearchParams);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', value.toString());
    setSearchParams(newSearchParams);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', '1');
    setSearchParams(newSearchParams);
  };

  const NewsCard: React.FC<{ article: NewsArticle }> = ({ article }) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
      }}
      onClick={() => navigate(`/news/${article.slug}`)}
    >
      {article.featuredImage && (
        <CardMedia
          component="img"
          height="180"
          image={article.featuredImage}
          alt={article.title}
        />
      )}
      <CardContent sx={{ p: 2 }}>
        {/* Category and badges */}
        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={article.category.name}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
          {article.isBreaking && (
            <Chip
              label="Breaking"
              size="small"
              color="error"
              sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}
            />
          )}
          {article.isFeatured && (
            <Chip
              label="Featured"
              size="small"
              color="primary"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 'bold',
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontSize: '1.1rem',
          }}
        >
          {article.title}
        </Typography>

        {/* Excerpt */}
        {article.excerpt && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {article.excerpt}
          </Typography>
        )}

        {/* Meta information */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
              {article.author.firstName[0]}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {article.author.firstName} {article.author.lastName}
            </Typography>
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            {format(new Date(article.publishedAt || article.createdAt), 'MMM dd')}
          </Typography>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VisibilityOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {article.viewCount}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CommentOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {article._count?.comments ?? 0}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <NewspaperOutlined color="primary" fontSize="large" />
          ONELGA News
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Stay updated with the latest news and announcements from ONELGA Local Government
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined />
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.items.map((category) => (
                  <MenuItem key={category.id} value={category.slug}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {articles.total} articles found
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="All News" />
          <Tab label="Featured" />
          <Tab label="Breaking News" />
        </Tabs>
      </Box>

      {/* Articles Grid */}
      {articles.loading ? (
        <Grid container spacing={3}>
          {Array.from(new Array(12)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={300} />
            </Grid>
          ))}
        </Grid>
      ) : articles.error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {articles.error}
        </Alert>
      ) : articles.items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No articles found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {articles.items.map((article) => (
              <Grid item xs={12} sm={6} md={4} key={article.id}>
                <NewsCard article={article} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {articles.pagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={articles.pagination.pages}
                page={articles.pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default NewsPage;