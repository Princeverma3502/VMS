const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

global.__MONGO_SETUP__ = (async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  global.__MONGO_URI__ = uri;
  return { mongoServer, uri };
})();

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

