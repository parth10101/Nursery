const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = "mongodb://parthdahekar90:parth123@ac-fuc7dvt-shard-00-00.5ceeisf.mongodb.net:27017/matoshree?ssl=true&authSource=admin";

async function run() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    tls: true,
    tlsAllowInvalidCertificates: true,
  });

  try {
    console.log("Attempting connection to single shard...");
    await client.connect();
    console.log("✅ Connected to single shard!");
    const db = client.db("matoshree");
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
  } catch (err) {
    console.error("❌ Connection failed:", err);
  } finally {
    await client.close();
  }
}

run();
