import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Chip,
  Avatar,
  Skeleton,
  Alert,
  Divider,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  IconButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  CalendarTodayOutlined,
  VisibilityOutlined,
  CommentOutlined,
  ShareOutlined,
  BookmarkBorderOutlined,
  PersonOutlined,
  ArrowBackOutlined,
  HomeOutlined,
  NewspaperOutlined,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { format } from 'date-fns';
import { RootState, AppDispatch } from '../store';
import {
  fetchArticleBySlug,
  fetchArticleComments,
  clearCurrentArticle,
  createComment,
  NewsComment,
} from '../store/slices/newsSlice';

const ArticlePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  
  // Simple, direct state selection with explicit fallbacks
  const { isAuthenticated, user } = useSelector((state: RootState) => ({
    isAuthenticated: state.auth?.isAuthenticated || false,
    user: state.auth?.user || null
  }));
  
  const currentArticle = useSelector((state: RootState) => ({
    data: state.news?.currentArticle?.data || null,
    loading: state.news?.currentArticle?.loading || false,
    error: state.news?.currentArticle?.error || null
  }));
  
  const commentsState = useSelector((state: RootState) => ({
    items: state.news?.comments?.items || [],
    loading: state.news?.comments?.loading || false,
    error: state.news?.comments?.error || null
  }));

  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(fetchArticleBySlug(slug));
    }
    return () => {
      dispatch(clearCurrentArticle());
    };
  }, [dispatch, slug]);

  // Fetch comments when article is loaded
  useEffect(() => {
    if (currentArticle.data?.id) {
      dispatch(fetchArticleComments(currentArticle.data.id));
    }
  }, [dispatch, currentArticle.data?.id]);

  const handleCommentSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!comment.trim() || !currentArticle.data) return;

    setIsSubmittingComment(true);
    try {
      await dispatch(createComment({
        content: comment.trim(),
        articleId: currentArticle.data.id,
        parentId,
      }));
      setComment('');
      // Refresh comments to show the new comment
      if (currentArticle.data?.id) {
        dispatch(fetchArticleComments(currentArticle.data.id));
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const CommentComponent: React.FC<{ comment: NewsComment; depth?: number }> = ({ 
    comment: commentData, 
    depth = 0 
  }) => (
    <Box sx={{ ml: depth * 2 }}>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
              {commentData.author.firstName[0]}
            </Avatar>
            <Typography variant="subtitle2" fontWeight="bold">
              {commentData.author.firstName} {commentData.author.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(commentData.createdAt), 'MMM dd, yyyy')}
            </Typography>
            {commentData.status === 'PENDING' && (
              <Chip label="Pending Approval" size="small" color="warning" />
            )}
          </Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {commentData.content}
          </Typography>
        </CardContent>
      </Card>
      
      {commentData.replies && commentData.replies.map((reply) => (
        <CommentComponent key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </Box>
  );

  if (currentArticle.loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="text" width="60%" height={60} />
        <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
        <Skeleton variant="text" height={20} />
        <Skeleton variant="text" height={20} />
        <Skeleton variant="text" height={20} width="80%" />
      </Container>
    );
  }

  if (currentArticle.error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {currentArticle.error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackOutlined />}
          onClick={() => navigate('/news')}
        >
          Back to News
        </Button>
      </Container>
    );
  }

  if (!currentArticle.data) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">
          Article not found.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackOutlined />}
          onClick={() => navigate('/news')}
          sx={{ mt: 2 }}
        >
          Back to News
        </Button>
      </Container>
    );
  }

  const article = currentArticle.data;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <HomeOutlined fontSize="small" />
          Home
        </Link>
        <Link component={RouterLink} to="/news" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <NewspaperOutlined fontSize="small" />
          News
        </Link>
        <Typography color="text.primary">{article.category.name}</Typography>
      </Breadcrumbs>

      {/* Article Header */}
      <Box sx={{ mb: 4 }}>
        {/* Category and badges */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={article.category.name}
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
          {article.isBreaking && (
            <Chip label="Breaking News" color="error" sx={{ fontWeight: 'bold' }} />
          )}
          {article.isFeatured && (
            <Chip label="Featured" color="primary" />
          )}
        </Box>

        {/* Title */}
        <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mb: 2 }}>
          {article.title}
        </Typography>

        {/* Meta information */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {article.author.firstName[0]}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {article.author.firstName} {article.author.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Author
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayOutlined fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {format(new Date(article.publishedAt || article.createdAt), 'MMMM dd, yyyy')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VisibilityOutlined fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {article.viewCount} views
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CommentOutlined fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {(article._count?.comments ?? commentsState.items.length ?? 0)} comments
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <IconButton size="small">
            <ShareOutlined />
          </IconButton>
          <IconButton size="small">
            <BookmarkBorderOutlined />
          </IconButton>
        </Box>

        {/* Excerpt */}
        {article.excerpt && (
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontStyle: 'italic', mb: 3, lineHeight: 1.6 }}
          >
            {article.excerpt}
          </Typography>
        )}
      </Box>

      {/* Featured Image */}
      {article.featuredImage && (
        <Box sx={{ mb: 4 }}>
          <img
            src={article.featuredImage}
            alt={article.title}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />
        </Box>
      )}

      {/* Article Content */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            fontSize: '1.125rem',
            '& p': { mb: 2 },
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              fontWeight: 'bold',
              mt: 3,
              mb: 2,
            },
            '& ul, & ol': { pl: 3, mb: 2 },
            '& li': { mb: 1 },
            '& blockquote': {
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              pl: 2,
              fontStyle: 'italic',
              my: 2,
            },
          }}
          dangerouslySetInnerHTML={{
            __html: article.content.replace(/\n/g, '<br>'),
          }}
        />
      </Box>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Tags
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {article.tags.map((tag) => (
              <Chip
                key={tag.id}
                label={tag.name}
                variant="outlined"
                size="small"
                clickable
                onClick={() => navigate(`/news?tag=${tag.slug}`)}
              />
            ))}
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 4 }} />

      {/* Comments Section */}
      <Box>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CommentOutlined />
          Comments ({article._count?.comments ?? commentsState.items.length ?? 0})
        </Typography>

        {/* Comment Form */}
        {isAuthenticated ? (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Leave a Comment
            </Typography>
            <form onSubmit={handleCommentSubmit}>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Share your thoughts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!comment.trim() || isSubmittingComment}
              >
                {isSubmittingComment ? 'Submitting...' : 'Submit Comment'}
              </Button>
            </form>
          </Paper>
        ) : (
          <Paper sx={{ p: 3, mb: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Please sign in to leave a comment
            </Typography>
            <Button variant="contained" component={RouterLink} to="/login">
              Sign In
            </Button>
          </Paper>
        )}

        {/* Comments List */}
        {commentsState.loading ? (
          <Box sx={{ py: 4 }}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={60} width="80%" />
          </Box>
        ) : commentsState.items && commentsState.items.length > 0 ? (
          <Box>
            {commentsState.items.map((comment) => (
              <CommentComponent key={comment.id} comment={comment} />
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No comments yet. Be the first to comment!
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ArticlePage;