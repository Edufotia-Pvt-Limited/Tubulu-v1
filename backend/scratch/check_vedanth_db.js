const mongoose = require('/Users/pradeep/Desktop/Vedanth/server/node_modules/mongoose');

async function run() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/vedanth');
        console.log("Connected to MongoDB vedanth");

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));

        const MasterKey = mongoose.model('MasterKey', new mongoose.Schema({}, { strict: false }), 'masterkeys');
        const keys = await MasterKey.find({});
        console.log("MasterKeys:", JSON.stringify(keys, null, 2));

        const Node = mongoose.model('Node', new mongoose.Schema({}, { strict: false }), 'nodes');
        const nodes = await Node.find({});
        console.log("Nodes:", JSON.stringify(nodes.map(n => ({ id: n.id, name: n.name, vedaConfig: n.vedaConfig })), null, 2));

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.connection.close();
    }
}

run();
