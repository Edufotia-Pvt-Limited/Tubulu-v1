const { User, Review, MessageNote, Order } = require('./Utils/Postgres');

async function check() {
  try {
    const user98 = await User.findOne({ where: { phoneNumber: '9898989898' } });
    if (!user98) {
      console.log("User 9898989898 not found.");
      process.exit(1);
    }
    console.log(`User 98 ID: ${user98.id}`);

    const reviews = await Review.findAll({ where: { userId: user98.id } });
    console.log(`\nReviews by 9898989898 (Count: ${reviews.length}):`);
    reviews.forEach(r => {
      console.log(`- ID: ${r.id}, Rating: ${r.rating}, Public: ${r.isPublicToContacts}, Text: "${r.reviewText}", Integration: ${r.integrationId}`);
    });

    const notes = await MessageNote.findAll({ where: { userId: user98.id } });
    console.log(`\nMessageNotes by 9898989898 (Count: ${notes.length}):`);
    notes.forEach(n => {
      console.log(`- ID: ${n.id}, Text: "${n.noteMessage}", ChatRoom: ${n.chatRoomId}`);
    });

    const orders = await Order.findAll({ where: { userId: user98.id } });
    console.log(`\nOrders by 9898989898 (Count: ${orders.length}):`);
    orders.forEach(o => {
      console.log(`- ID: ${o.id}, PersonalNote: "${o.personalNote}", Integration: ${o.integrationId}`);
    });

  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}
check();
