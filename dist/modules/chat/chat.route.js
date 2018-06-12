console.log('   /...Loading [ChatRoutes]');
/**
* SETUP A CHAT SERVER BESIDE TO PRC/REST SERVER
* Websocket together with Webservices
*/
// EXTERNAL
var express = require("express");
var chatApp = express();
var chatServer = require('http').createServer(chatApp);
var io = require('socket.io')(chatServer);
var router = express.Router();
// INTERNAL
var ChatController = require('./chat.controller');
var response = require('../../services/response.service');
chatServer.listen(5000, () => {
    console.log('Chat server is listening on port 5000');
});
// SOCKET IO CONFIGURATION
var chatData = [];
io.on('connection', (socket) => {
    // console.log(socket);
    console.log(`User ${socket.id} connect`);
    socket.on('message', (message) => {
        console.log("Message Received: " + message);
        var msg = JSON.parse(message);
        switch (msg.type) {
            case 'i':
                // Create a new room and invite others to join via addIntoRoom or chatWith
                console.log(`User ${socket.id} / ${msg.id} invite joining a room`);
                socket.join(msg.r, () => {
                    let rooms = Object.keys(socket.rooms);
                    console.log(rooms);
                });
                io.emit('message', { type: 'new-message', text: message });
                // addRoomForUser(msg);
                break;
            case 'a':
                // Accept to join the room
                console.log(`User ${socket.id} / ${msg.id} accept invitation`);
                socket.join(msg.r, () => {
                    let rooms = Object.keys(socket.rooms);
                    console.log(rooms);
                });
                io.to(msg.r).emit('message', { type: 'new-message', text: message });
                // addRoomForUser(msg);
                break;
            case 'm':
                // Normal message
                io.to(msg.r).emit('message', { type: 'new-message', text: message });
                break;
            case 'l':
                // Leave the room
                console.log(`User ${socket.id} / ${msg.id} leave a room`);
                socket.leave(msg.r, () => {
                    let rooms = Object.keys(socket.rooms);
                    console.log(rooms);
                });
                io.to(msg.r).emit('message', { type: 'new-message', text: message });
                // removeRoomOfUser(msg);
                break;
            case 'q':
                console.log(`User ${socket.id} / ${msg.id} leave chat`);
                chatData.splice(msg.id, 1);
                io.to(msg.r).emit('message', { type: 'new-message', text: message });
                break;
            default:
                console.log('Unrecognized message');
                break;
        }
        // console.log(chatData);
    });
    socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected`);
    });
});
function addRoomForUser(msg) {
    if (chatData[msg.id]) {
        if (!chatData[msg.id].includes(msg.r)) {
            chatData[msg.id].push(msg.r);
        }
    }
    else {
        chatData[msg.id] = [msg.r];
    }
}
function removeRoomOfUser(msg) {
    if (chatData[msg.id]) {
        var i = chatData[msg.id].indexOf(msg.r);
        console.log(i);
        chatData[msg.id].splice(i, 1);
    }
}
// ROUTES
router.get("/register", ChatController.registerRoom);
router.get("/getRoom/:id", (req, res) => {
    var result = {
        data: chatData[req.params._id],
    };
    return response.ok(res, result);
});
module.exports = router;
