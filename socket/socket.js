const ACTIONS = require('../utils/Actions')
const fs = require('fs')
const saveFileToS3 = require('../controllers/user/saveFileToS3')
const getFileFromS3 = require('../controllers/user/getFileFromS3')
const { generatedMsg } = require('../utils/msg')
const socketController = (io) => {
    const userSocketMap = {}
    function getAllConnectedClients(roomId) {
        // Map
        return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
            return {
                socketId,
                roomId,
                username: userSocketMap[socketId],
            }
        })
    }

    io.on('connection', (socket) => {
        console.log('socket connected', socket.id)

        socket.on(ACTIONS.JOIN, async ({ roomId, username }) => {
            getFileFromS3(socket, roomId, username)
            userSocketMap[socket.id] = username
            socket.join(roomId)
            const clients = getAllConnectedClients(roomId)
            clients.forEach(({ socketId }) => {
                io.to(socketId).emit(ACTIONS.JOINED, {
                    clients,
                    username,
                    socketId: socket.id,
                })
            })
        })
        socket.on(ACTIONS.SENDMESSAGE, async (msgObj) => {
            msgObj.username = msgObj.username.charAt(0).toUpperCase() + msgObj.username.slice(1)
            const msg = generatedMsg(msgObj.msg, msgObj.username)
            io.to(msgObj.roomId).emit(ACTIONS.MESSAGE, msg)
        })

        socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
            socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code })
        })

        socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
            io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code })
        })
        socket.on(ACTIONS.SAVE, ({ code, roomId }) => {
            if (!code) code = ''
            fs.writeFile(`../backend/code/${roomId}.txt`, code, (err) => {
                if (err) throw err
                console.log('The file has been saved!')
            })
            saveFileToS3(code, roomId)
        })

        socket.on('disconnecting', () => {
            const rooms = [...socket.rooms]
            rooms.forEach((roomId) => {
                socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                    socketId: socket.id,
                    username: userSocketMap[socket.id],
                })
            })
            delete userSocketMap[socket.id]
            socket.leave()
        })
    })
}

module.exports = socketController
