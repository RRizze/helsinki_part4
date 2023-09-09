const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');
const middleware = require('../utils/middleware');

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1, id: 1 });

  res.json(blogs);
});

blogsRouter.get('/:id', async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (blog) {
    res.json(blog);
  } else {
    res.status(404).end();
  }
});

blogsRouter.post('/', middleware.userExtractor, async (req, res, next) => {
  const body = req.body; 

  if (!req.user) {
    return res.status(401).json({ error: 'token invalid' });
  }

  const user = await User.findById(req.user.toString());

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id,
  });

  try {
    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();

    res.status(201).json(savedBlog);
  } catch (exception) {
    next(exception);
  }
});

blogsRouter.delete('/:id', middleware.userExtractor, async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);

  if (blog.user.toString() === req.user.toString()) {
    await blog.deleteOne();
    res.status(204).end();
  } else {
    res.status(401).json({ error: 'invalid token for deleting blog' });
  }
});

blogsRouter.put('/:id', async (req, res, next) => {
  const body = req.body;

  const blog = { likes: body.likes };

  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    blog,
    { new: true, runValidators: true, context: 'query' },
  );

  try {
    res.json(updatedBlog);
  } catch (exception) {
    next(exception);
  }
});

module.exports = blogsRouter;
