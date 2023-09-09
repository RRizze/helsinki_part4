const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (req, res) => {
  const users = await User
    .find({})
    .populate('blogs', {
      title: 1,
      author: 1,
      url: 1,
      likes: 1,
    });
  res.json(users);
});

usersRouter.post('/', async (req, res, next) => {
  const { username, name, password } = req.body;

  if (!(username && password)) {
    return res.status(403).json({
      error: 'username and password must be present'
    });
  }

  if (username.length < 3 || password.length < 3) {
    return res.status(403).json({
      error: 'username and password must have length >= 3',
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  try {
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (exception) {
    next(exception); 
  }
});

module.exports = usersRouter;
