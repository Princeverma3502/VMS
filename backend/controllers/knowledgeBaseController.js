import asyncHandler from 'express-async-handler';
import KnowledgeBase from '../models/KnowledgeBase.js';

// @desc    Create a KB article
// @route   POST /api/knowledge-base
// @access  Private (Secretary/Domain Head only)
export const createArticle = asyncHandler(async (req, res) => {
  const { title, slug, content, category, description, videoUrl, tags, attachments } = req.body;
  const userId = req.user.id;
  const collegeId = req.user.collegeId; // Multi-tenancy enforcement

  // Check if slug already exists within THIS college
  const existingArticle = await KnowledgeBase.findOne({ 
    slug: slug.toLowerCase(),
    collegeId 
  });
  
  if (existingArticle) {
    return res.status(400).json({ message: 'Article with this slug already exists in your unit.' });
  }

  const article = await KnowledgeBase.create({
    title,
    slug: slug.toLowerCase(),
    content,
    category,
    description,
    videoUrl,
    tags: tags || [],
    attachments: attachments || [],
    author: userId,
    collegeId, // Link to college
    isPublished: true,
  });

  res.status(201).json({
    success: true,
    message: 'Article created successfully',
    data: article,
  });
});

// @desc    Get all KB articles (Scoped to College)
// @route   GET /api/knowledge-base
// @access  Public
export const getArticles = asyncHandler(async (req, res) => {
  const { category, search, tags, limit = 20, skip = 0 } = req.query;
  const collegeId = req.user.collegeId;

  const filters = { 
    isPublished: true,
    collegeId // Strict Filter
  };

  if (category) filters.category = category;
  if (tags) filters.tags = { $in: tags.split(',') };
  
  if (search) {
    filters.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  const articles = await KnowledgeBase.find(filters)
    .populate('author', 'name profileImage')
    .select('-content') // Optimization: Don't load full content for list
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .lean();

  const total = await KnowledgeBase.countDocuments(filters);

  res.status(200).json({
    success: true,
    count: articles.length,
    total,
    hasMore: parseInt(skip) + parseInt(limit) < total,
    data: articles,
  });
});

// @desc    Get article by slug
// @route   GET /api/knowledge-base/:slug
// @access  Public
export const getArticleBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const collegeId = req.user.collegeId;

  const article = await KnowledgeBase.findOne({ 
    slug: slug.toLowerCase(), 
    isPublished: true,
    collegeId 
  })
    .populate('author', 'name profileImage')
    .populate('relatedArticles', 'title slug description');

  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }

  // Increment view count
  article.views += 1;
  await article.save();

  res.status(200).json({
    success: true,
    data: article,
  });
});

// @desc    Get articles by category
// @route   GET /api/knowledge-base/category/:category
// @access  Public
export const getArticlesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { limit = 10, skip = 0 } = req.query;
  const collegeId = req.user.collegeId;

  const articles = await KnowledgeBase.find({ 
    category, 
    isPublished: true,
    collegeId 
  })
    .populate('author', 'name profileImage')
    .select('-content')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .lean();

  const total = await KnowledgeBase.countDocuments({ category, isPublished: true, collegeId });

  res.status(200).json({
    success: true,
    count: articles.length,
    total,
    data: articles,
  });
});

// @desc    Search KB articles (Full Text)
// @route   GET /api/knowledge-base/search/:query
// @access  Public
export const searchArticles = asyncHandler(async (req, res) => {
  const { query } = req.params;
  const collegeId = req.user.collegeId;

  // Use Text Index if available, otherwise Regex
  const articles = await KnowledgeBase.find(
    {
      isPublished: true,
      collegeId,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }, // Search body content too
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
    }
  )
    .sort({ createdAt: -1 }) // Simple sort by date for regex search
    .limit(20)
    .lean();

  res.status(200).json({
    success: true,
    count: articles.length,
    data: articles,
  });
});

// @desc    Mark article as helpful/unhelpful
// @route   PUT /api/knowledge-base/:slug/helpful
// @access  Public
export const markAsHelpful = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { helpful } = req.body;
  const collegeId = req.user.collegeId;

  if (typeof helpful !== 'boolean') {
    return res.status(400).json({ message: 'helpful must be a boolean' });
  }

  const article = await KnowledgeBase.findOne({ slug: slug.toLowerCase(), collegeId });

  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }

  if (helpful) {
    article.helpful.yes += 1;
  } else {
    article.helpful.no += 1;
  }

  await article.save();

  res.status(200).json({
    success: true,
    message: `Marked as ${helpful ? 'helpful' : 'unhelpful'}`,
    data: article.helpful,
  });
});

// @desc    Update KB article
// @route   PUT /api/knowledge-base/:id
// @access  Private (Author/Admin only)
export const updateArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, description, videoUrl, tags, category } = req.body;
  const userId = req.user.id;
  const collegeId = req.user.collegeId;

  const article = await KnowledgeBase.findOne({ _id: id, collegeId });

  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }

  // Access Control: Author, Secretary, or Admin
  const isAuthorized = 
    article.author.toString() === userId || 
    req.user.role === 'Secretary' || 
    req.user.role === 'Admin';

  if (!isAuthorized) {
    return res.status(403).json({ message: 'Not authorized to update this article' });
  }

  article.title = title || article.title;
  article.content = content || article.content;
  article.description = description || article.description;
  article.videoUrl = videoUrl || article.videoUrl;
  article.tags = tags || article.tags;
  article.category = category || article.category;

  await article.save();

  res.status(200).json({
    success: true,
    message: 'Article updated successfully',
    data: article,
  });
});

// @desc    Delete KB article
// @route   DELETE /api/knowledge-base/:id
// @access  Private (Author/Admin only)
export const deleteArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const collegeId = req.user.collegeId;

  const article = await KnowledgeBase.findOne({ _id: id, collegeId });

  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }

  const isAuthorized = 
    article.author.toString() === userId || 
    req.user.role === 'Secretary' || 
    req.user.role === 'Admin';

  if (!isAuthorized) {
    return res.status(403).json({ message: 'Not authorized to delete this article' });
  }

  await KnowledgeBase.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Article deleted successfully',
  });
});