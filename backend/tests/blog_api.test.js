const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);

const Blog = require('../models/blog');
const User = require('../models/user');

describe('blog_api test', () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    for (let blog of helper.initialBlogs) {
      let blogObject = new Blog(blog);

      await blogObject.save();
    }

    const user = {
      username: 'root',
      name: 'root',
      password: '123',
    };

    await api
      .post('/api/users')
      .send(user);
  });
  describe('when there is initially some blogs saved', () => {
    test('all blogs are returned', async () => {
      const response = await api.get('/api/blogs');

      expect(response.body).toHaveLength(helper.initialBlogs.length);
    });

    test('blogs are returned as json', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/);
    }, 100000);
  });

  describe('viewing a specific blog', () => {

    test('succeeds with a valid id', async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blog = blogsAtStart[0];

      const resultBlog = await api
        .get(`/api/blogs/${blog.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      expect(resultBlog.body).toEqual(blog);
    }, 100000);

    test('id property exists in a blog post', async () => {
      const response = await api.get('/api/blogs');
      const blog = response.body[0];

      expect(response.body[0].id).toBeDefined();
    });
  });

  describe('addition of a new blog', () => {
    test('succeeds with a valid data', async () => {
      const blogsAtStart = await helper.blogsInDb();
      const usersAtStart = await helper.usersInDb();

      const userLogin = {
        username: 'root',
        name: 'root',
        password: '123',
      };

      const response = await api
        .post('/api/login')
        .send(userLogin)
        .expect(200)
        .expect('Content-Type', /json/);

      const userToken = response.body.token;

      const newBlog = {
        title: 'test title',
        author: 'Author 1',
        url: 'someurl',
        likes: 0,
      };

      await api
        .post('/api/blogs')
        .set('Accept', 'application/json')
        .set('Authorization', `bearer ${userToken}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(blogsAtStart.length + 1);

      const titles = blogsAtEnd.map(b => b.title);
      expect(titles).toContain(newBlog.title);
    });

    test('succeeds if likes is missing it will be 0 by default', async () => {
      const newBlog = {
        title: 'test title',
        author: 'Author 1',
        url: 'someurl',
      };

      const userLogin = {
        username: 'root',
        name: 'root',
        password: '123',
      };

      const response = await api
        .post('/api/login')
        .send(userLogin)
        .expect(200)
        .expect('Content-Type', /json/);

      const userToken = response.body.token;

      const savedBlog = await api
        .post('/api/blogs')
        .set('Accept', 'application/json')
        .set('Authorization', `bearer ${userToken}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      expect(savedBlog.body.likes).toEqual(0);
    });

    test('if title is missing the status will be 400', async () => {
      const newBlog = {
        author: 'Author 1',
        url: 'someurl',
        likes: 0,
      };

      const userLogin = {
        username: 'root',
        name: 'root',
        password: '123',
      };

      const response = await api
        .post('/api/login')
        .send(userLogin)
        .expect(200)
        .expect('Content-Type', /json/);

      const userToken = response.body.token;

      await api
        .post('/api/blogs')
        .set('Accept', 'application/json')
        .set('Authorization', `bearer ${userToken}`)
        .send(newBlog)
        .expect(400);
    });

    test('if url is missing the status will be 400', async () => {
      const newBlog = {
        title: 'some title',
        author: 'Author 1',
        likes: 0,
      };

      const userLogin = {
        username: 'root',
        name: 'root',
        password: '123',
      };

      const response = await api
        .post('/api/login')
        .send(userLogin)
        .expect(200)
        .expect('Content-Type', /json/);

      const userToken = response.body.token;

      await api
        .post('/api/blogs')
        .set('Accept', 'application/json')
        .set('Authorization', `bearer ${userToken}`)
        .send(newBlog)
        .expect(400);
    });
  });

  describe('deleting of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const userLogin = {
        username: 'root',
        name: 'root',
        password: '123',
      };

      const response = await api
        .post('/api/login')
        .send(userLogin)
        .expect(200)
        .expect('Content-Type', /json/);

      const userToken = response.body.token;
    
      const newBlog = {
        title: 'test title',
        author: 'Author 1',
        url: 'someurl',
      };

      const blogRes = await api
        .post('/api/blogs')
        .set('Accept', 'application/json')
        .set('Authorization', `bearer ${userToken}`)
        .send(newBlog);

      const blogId = blogRes.body.id;

      // 4
      const blogsAtStart = await helper.blogsInDb();

      await api
        .delete(`/api/blogs/${blogId}`)
        .set('Accept', 'application/json')
        .set('Authorization', `bearer ${userToken}`)
        .expect(204);
        
      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);

      const titles = blogsAtEnd.map(b => b.title);
      expect(titles).not.toContain(newBlog.title);
      
    }, 100000);
  });

  describe('updateing of a blog', () => {
    test('succeeds with new amount of likes of a blog', async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blog = blogsAtStart[0];

      const newBlogData = {
        likes: 100,
      };

      await api
        .put(`/api/blogs/${blog.id}`)
        .send(newBlogData)
        .expect(200)
        .expect('Content-Type', /application\/json/);


      const updatedBlog = await helper.blogsInDb();

      expect(updatedBlog[0].likes).toBe(100);

    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Blog.deleteMany({});
    await mongoose.connection.close();
  });
});

