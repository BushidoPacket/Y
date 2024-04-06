const request = require('supertest');
const app = require('../server.js');
const mongoose = require('mongoose');
const auth = require('../auth.js');

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

//Set #1 - Test API Endpoints
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

    //await mongoose.disconnect(); //Needs to be commented if testing 2nd set
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

//Set #2 - Test API rate limits
//Comment out the last line of afterAll function in Set #1 to run this set properly
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

//Set #3 - Test auth.js functions
describe('Test auth.js functions', () => {

  /*afterAll(async () => {
    await mongoose.disconnect(); //For some reason needs to be here so jest doesn't throw open handles error, if you run just this test
  });*/

  //Test #1 - hashPassword function
  it('Should hash password', () => {
    const hashedPassword = auth.hashPassword(password);
    expect(hashedPassword.passwordValue).not.toBe(password);
    expect(hashedPassword.passwordValue).not.toContain(password);
    expect(hashedPassword.passwordValue.length).toBe(64);
  });

  //Test #2.1 - compare function
  it('Should flag true for valid hashed password', () => {
    const hashedPassword = auth.hashPassword(password);
    expect(auth.compare(password, hashedPassword.saltValue, hashedPassword.passwordValue)).toBe(true);
  });

  //Test #2.2 - compare function with wrong salt
  it('Should flag false for invalid hashed password', () => {
    const hashedPassword = auth.hashPassword(password);
    expect(auth.compare(password, 'wrongSalt', hashedPassword.passwordValue)).toBe(false);
  });

  //Test #2.3 - compare function with wrong password
  it('Should flag false for invalid hashed password', () => {
    const hashedPassword = auth.hashPassword(password);
    expect(auth.compare('wrongPassword', hashedPassword.saltValue, hashedPassword.passwordValue)).toBe(false);
  });

  //Test #3 - createToken function
  it('Should create token', () => {
    token = auth.createToken(user, '1h');
    expect(token).not.toBe('');
    expect(token).not.toContain(user);
    expect(token.length).toBeGreaterThan(100);
    expect(token.split('.').length).toBeGreaterThan(0);
  });

  //Test #4.1 - verifyToken function
  it('Should verify token', async () => {
    const decoded = await auth.verifyToken(token);
    expect(decoded.user).toBe(user);
  });

  //Test #4.2 - verifyToken function with wrong token
  it('Should not verify wrong token', async () => {
    await expect(auth.verifyToken(token + "0")).rejects.toThrow();
  });

  //Test #5 - validateRequest function
  it('Should validate request', async () => {
    const response = await auth.validateRequest(token);
    expect(response.additionals.user).toBe(user);
    expect(response.status).toBe(200);
    expect(response.message).toBe('Token verified.');
  });


});