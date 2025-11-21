const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

async function fixIndex() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI not found in environment');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);

    const db = mongoose.connection.db;
    const collection = db.collection('whatsappsessions');

    // Get current indexes
    console.log('\nCurrent indexes:');
    const indexes = await collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Drop the problematic sessionId_1 index if it exists
    try {
      await collection.dropIndex('sessionId_1');
      console.log('\n✓ Dropped sessionId_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('\n✓ Index sessionId_1 does not exist (already removed)');
      } else {
        throw error;
      }
    }

    // Verify the compound index exists
    const newIndexes = await collection.indexes();
    const hasCompoundIndex = newIndexes.some(idx =>
      idx.key && idx.key.sessionId === 1 && idx.key.key === 1
    );

    if (!hasCompoundIndex) {
      console.log('\nCreating compound index...');
      await collection.createIndex({ sessionId: 1, key: 1 }, { unique: true });
      console.log('✓ Created compound index { sessionId: 1, key: 1 }');
    } else {
      console.log('\n✓ Compound index { sessionId: 1, key: 1 } already exists');
    }

    console.log('\nFinal indexes:');
    const finalIndexes = await collection.indexes();
    console.log(JSON.stringify(finalIndexes, null, 2));

    await mongoose.disconnect();
    console.log('\n✓ Done! WhatsApp index fixed successfully.');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixIndex();
