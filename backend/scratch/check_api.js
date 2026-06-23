const { connectPostgres, sequelize } = require('../Utils/Postgres');
const ChatRoomController = require('../Controllers/ChatRoom.controller');

async function test() {
    await connectPostgres();
    
    // Find the chatroom for user 9898989898
    const { ChatRoom, User } = require('../Utils/Postgres');
    const user = await User.findOne({ where: { phoneNumber: '9898989898' } });
    if (!user) {
        console.error("User 9898989898 not found!");
        process.exit(1);
    }
    const chatRoom = await ChatRoom.findOne({ where: { userId: user.id } });
    if (!chatRoom) {
        console.error("ChatRoom for user not found!");
        process.exit(1);
    }
    
    console.log("Using Integration ID:", chatRoom.integrationId);
    
    const req = {
        id: chatRoom.integrationId
    };
    
    const res = {
        send: function(data) {
            console.log("API Response Conversations:");
            console.log(JSON.stringify(data.conversations, null, 2));
            process.exit(0);
        },
        status: function(code) {
            console.log("Status code:", code);
            return this;
        }
    };
    
    const next = function(err) {
        console.error("Error:", err);
        process.exit(1);
    };
    
    await ChatRoomController.getAllChatRoomsForTheDashboard(req, res, next);
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
