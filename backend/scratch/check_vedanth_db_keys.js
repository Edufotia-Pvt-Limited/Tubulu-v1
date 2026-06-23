const mongoose = require('/Users/pradeep/Desktop/Vedanth/server/node_modules/mongoose');

async function run() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/vedanth');
        console.log("Connected to MongoDB vedanth");

        const MasterKey = mongoose.model('MasterKey', new mongoose.Schema({}, { strict: false }), 'masterkeys');
        const keys = await MasterKey.find({});
        console.log("MasterKeys:", JSON.stringify(keys, null, 2));

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.connection.close();
    }
}

run();
