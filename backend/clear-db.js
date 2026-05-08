const mongoose = require('mongoose');

const uri = "mongodb+srv://studybuddyofficial37_db_user:jAJJc1HUR4LyXrXL@studybuddy.kgv07hn.mongodb.net/studybuddy_career_copilot?appName=StudyBuddy";

async function clearDb() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(uri);
    console.log('Connected to DB successfully.');
    
    const collections = await mongoose.connection.db.collections();
    
    if (collections.length === 0) {
        console.log('No collections found in the database.');
    }
    
    for (let collection of collections) {
      // Don't drop system collections
      if (!collection.collectionName.startsWith('system.')) {
        await collection.deleteMany({});
        console.log(`Cleared collection: ${collection.collectionName}`);
      }
    }
    
    console.log('All user data cleared from the database successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to clear database:', error);
    process.exit(1);
  }
}

clearDb();
