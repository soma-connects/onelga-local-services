import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Skeleton,
  Button,
  Container,
  Alert,
  Avatar,
} from '@mui/material';
import {
  NewspaperOutlined,
  TrendingUpOutlined,
  CalendarTodayOutlined,
  PersonOutlined,
  VisibilityOutlined,
  CommentOutlined,
  ArrowForwardOutlined,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { RootState, AppDispatch } from '../../store';
import {
  fetchFeaturedArticles,
  fetchBreakingNews,
  fetchArticles,
  NewsArticle,
} from '../../store/slices/newsSlice';

const NewsSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    featuredArticles,
    breakingNews,
    articles,
  } = useSelector((state: RootState) => state.news);

  useEffect(() => {
    dispatch(fetchFeaturedArticles());
    dispatch(fetchBreakingNews());
    dispatch(fetchArticles({ limit: 4 }));
  }, [dispatch]);

  const NewsCard: React.FC<{ article: NewsArticle; featured?: boolean }> = ({ article, featured = false }) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={() => navigate(`/news/${article.slug}`)}
    >
      {article.featuredImage && (
        <CardMedia
          component="img"
          height={featured ? 200 : 160}
          image={article.featuredImage}
          alt={article.title}
        />
      )}
      <CardContent sx={{ p: 2 }}>
        {/* Category and Breaking Badge */}
        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
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
          variant={featured ? 'h6' : 'subtitle1'}
          component="h3"
          sx={{
            fontWeight: 'bold',
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
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
              WebkitLineClamp: featured ? 3 : 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {article.excerpt}
          </Typography>
        )}

        {/* Meta information */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
              {article.author.firstName[0]}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {article.author.firstName} {article.author.lastName}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayOutlined sx={{ fontSize: 14 }} />
            <Typography variant="caption" color="text.secondary">
              {format(new Date(article.publishedAt || article.createdAt), 'MMM dd, yyyy')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VisibilityOutlined sx={{ fontSize: 14 }} />
              <Typography variant="caption" color="text.secondary">
                {article.viewCount}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CommentOutlined sx={{ fontSize: 14 }} />
              <Typography variant="caption" color="text.secondary">
                {article._count?.comments ?? 0}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const BreakingNewsCard: React.FC<{ article: NewsArticle }> = ({ article }) => (
    <Card 
      sx={{ 
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
        color: 'white',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
        },
      }}
      onClick={() => navigate(`/news/${article.slug}`)}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <TrendingUpOutlined sx={{ color: 'white' }} />
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' }}>
            BREAKING NEWS
          </Typography>
        </Box>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 'bold',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.title}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breaking News Banner */}
      {breakingNews.items.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpOutlined color="error" />
            Breaking News
          </Typography>
          <Grid container spacing={2}>
            {breakingNews.loading
              ? Array.from(new Array(3)).map((_, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Skeleton variant="rectangular" height={120} />
                  </Grid>
                ))
              : breakingNews.items.map((article) => (
                  <Grid item xs={12} md={4} key={article.id}>
                    <BreakingNewsCard article={article} />
                  </Grid>
                ))
            }
          </Grid>
        </Box>
      )}

      {/* Main News Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <NewspaperOutlined color="primary" />
          Latest News
        </Typography>
        <Button
          variant="outlined"
          endIcon={<ArrowForwardOutlined />}
          onClick={() => navigate('/news')}
        >
          View All News
        </Button>
      </Box>

      {/* Featured Articles */}
      {featuredArticles.items.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Featured Stories
          </Typography>
          <Grid container spacing={3}>
            {featuredArticles.loading
              ? Array.from(new Array(3)).map((_, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Skeleton variant="rectangular" height={300} />
                  </Grid>
                ))
              : featuredArticles.items.slice(0, 3).map((article) => (
                  <Grid item xs={12} md={4} key={article.id}>
                    <NewsCard article={article} featured />
                  </Grid>
                ))
            }
          </Grid>
        </Box>
      )}

      {/* Recent Articles */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Recent Articles
        </Typography>
        <Grid container spacing={3}>
          {articles.loading
            ? Array.from(new Array(4)).map((_, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Skeleton variant="rectangular" height={250} />
                </Grid>
              ))
            : articles.items.map((article) => (
                <Grid item xs={12} sm={6} md={3} key={article.id}>
                  <NewsCard article={article} />
                </Grid>
              ))
          }
        </Grid>
      </Box>

      {/* Error States */}
      {(featuredArticles.error || breakingNews.error || articles.error) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to load some news content. Please try again later.
        </Alert>
      )}
    </Container>
  );
};

export default NewsSection;