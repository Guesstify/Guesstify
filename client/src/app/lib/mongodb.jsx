import { MongoClient } from 'mongodb';

const mongoPassword = process.env.MONGO_DB_PASSWORD;
const uri = `mongodb+srv://brinco:${mongoPassword}@spotifydatabase.oko5zw0.mongodb.net/?retryWrites=true&w=majority&appName=SpotifyDatabase`;

let client;
let clientPromise;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so we can preserve the value across module reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;