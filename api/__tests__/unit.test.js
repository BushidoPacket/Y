const request = require('supertest');
const app = require('../server.js');
const mongoose = require('mongoose');

//Declaration of different console logs, to separate server logs from test logs
const originalLog = console.log;

console.log = function(message, test=false) {
  if (message.startsWith('[unit.test.js]: ')) {
    originalLog.apply(console, arguments);
  } else {
    originalLog.apply(console, ['[server]: ', ...arguments]);
  }
};

function testLog(...message) {
  console.log('[unit.test.js]: ', ...message);
}

//Test variables for imaginary account
let token = '';
const user = 'testuser';
const password = 'testpassword';
const email = 'test@email.cz';


describe('Test API Endpoints', () => {
  let server;

  beforeAll(() => {
    server = app.listen(3002);
  });

  afterAll(async () => {
    await server.close();

    const User = mongoose.model('User');
    await User.deleteOne({ username: user });
    testLog('User deleted after test.');

  });

  //Test #1 - ping server
  it('Server should be pinged', async () => {
    const response = await request(app).get('/ping'); 
    expect(response.status).toBe(200);
    expect(response.text).toBe('Server is running.');
  });

  //Test #2.1 - register new user
  it('Should register new user', async () => {
    const response = await request(app).post('/users/new').send({
      username: user,
      password: password,
      email: email
    });
    expect([400, 200, 201]).toContain(response.status);
    expect(['message', 'error']).toEqual(expect.arrayContaining(Object.keys(response.body)));
    if (response.body.error) {
        expect(["Profile already exists.", "This e-mail address is already being used."]).toContain(response.body.error);
    }
    if (response.body.message) {
        expect(response.body.message).toBe("User registered successfully.");
    }
  });

  //Test #2.2 - login user
  it('Should login user', async () => {
    const response = await request(app).put('/users/login').send({
      username: user,
      password: password
    });
    token = response.body.token;
    //testLog('Token:', token);
    expect(response.status).toBe(200);
  });

  //Test #2.3 - login user with wrong password
  it('Should not login user with wrong password', async () => {
    const response = await request(app).put('/users/login').send({
      username: user,
      password: 'wrongpassword'
    });
    expect(response.status).toBe(401);
  });

  //Test #2.4 - login user with non-existing username
  it('Should not login user with non-existing username', async () => {
    const response = await request(app).put('/users/login').send({
      username: 'nonexistinguser',
      password: 'randompassword'
    });
    expect(response.status).toBe(404);
  });

  //Test #3.1 - get user profile info
  it('Should get user profile info', async () => {
    const response = await request(app).put('/users/info').send({
      token: token
    });
    expect(response.status).toBe(200);
    expect(response.body.username).toBe(user);
    expect(response.body.email).toBe(email);
    expect(typeof response.body.creationDate).toBe('string');
    expect(Number(response.body.creationDate)).not.toBeNaN();
    expect(response.body.profilePicture).toBe("default.png");
  });

  //Test #3.2 - get user profile info with wrong token
  it('Should not get user profile info with wrong token', async () => {
    const response = await request(app).put('/users/info').send({
      token: 'nonsense'
    });

    expect(response.status).toBe(401);
  }); 

  
});

describe('Test API rate limits', () => {

  let server;

  beforeAll(() => {
    server = app.listen(3002);
  });

  afterAll(async () => {
    await server.close();

    const User = mongoose.model('User');
    await User.deleteMany({ username: /testUser/ });
    testLog('All test users deleted after test.');

    await mongoose.disconnect();
  });

  for (let i = 0; i < 5; i++) {
    it(`Should set rate limits after 4 requests now, request n.:${i+1}`, async () => {
        const response = await request(app).post('/users/new').send({
            username: `testUser${i}`,
            password: 'testPassword',
            email: `testUser${i}@email.cz`
        });

        if (i < 4) {
            expect([200, 201]).toContain(response.status);
        } else {
            testLog('Rate limit reached, status:', response.status);
            expect(response.status).toBe(429);
        }
    });
  }

  it('Should not allow more requests after rate limit is reached', async () => {
    const response = await request(app).post('/users/new').send({
        username: 'testUser99',
        password: 'testPassword',
        email: 'testUser99@email.cz'
    });
    expect(response.status).toBe(429);
  });

  it('Should allow different requests after rate limit is reacher', async () => {
    const response = await request(app).get('/ping');
    expect(response.status).toBe(200);
  })

  it('Pause before next testing to clear default rate limit', (done) => {
    setTimeout(done, 60000); // 1 minute
  }, 65000);

  it('Should allow 300 default requests per minute now', async () => {
    for (let i = 0; i < 300; i++) {
        const response = await request(app).get('/ping');
        expect(response.status).toBe(200);
    }
  })

  it('Should not allow more requests after default rate limit is reached', async () => {
    const response = await request(app).get('/ping');
    expect(response.status).toBe(429);
  });


});
