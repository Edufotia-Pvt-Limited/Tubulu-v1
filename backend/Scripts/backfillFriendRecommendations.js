const { connectPostgres, Review, FriendRecommendation } = require('../Utils/Postgres');
const { Op } = require('sequelize');

async function backfill() {
  try {
    console.log('Connecting to PostgreSQL...');
    await connectPostgres();

    console.log('Fetching reviews with rating >= 3...');
    const reviews = await Review.findAll({
      where: {
        rating: {
          [Op.gte]: 3
        }
      }
    });

    console.log(`Found ${reviews.length} qualifying reviews.`);

    let insertedCount = 0;
    for (const review of reviews) {
      const text = (review.reviewText && review.reviewText.trim().length > 0) ? review.reviewText.trim() : 'Recommended';

      // Avoid creating duplicates by checking if user already recommended this integration
      const [rec, created] = await FriendRecommendation.findOrCreate({
        where: {
          userId: review.userId,
          integrationId: review.integrationId,
        },
        defaults: {
          rating: review.rating,
          reviewText: text,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt
        }
      });

      if (created) {
        insertedCount++;
      }
    }

    console.log(`Backfill complete. Inserted ${insertedCount} new friend recommendations.`);
    process.exit(0);
  } catch (err) {
    console.error('Backfill failed:', err);
    process.exit(1);
  }
}

backfill();
