const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');
const api = supertest(app);
const bcrypt = require('bcrypt');

const User = require('../models/user');


describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('123', 10);
    const user = new User({ username: 'bob', name: 'bob', passwordHash });

    await user.save();
  });

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb();
    console.log('START', usersAtStart);

    const newUser = {
      username: 'kok',
      name: 'kok',
      password: '123',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    console.log('END USERS', usersAtEnd);
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map(u => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('creation failed with short password and username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'cr',
      name: 'cr',
      password: 'cr',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(403)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  test('creation failed if user already exists', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'bob',
      name: 'bob',
      password: '123',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);
    
    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });
});

