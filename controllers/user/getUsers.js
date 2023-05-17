const userServices = require('../../services/user')

const getUsers = async (req, res, next) => {
    const { roomId, username } = req.query
    const room = await userServices.findRoom({ roomId, 'users.username': username })

    if (!room) {
        return res.status(200).json({ success: false, message: 'Unable to get user details', data: null })
    }

    if (room.err) {
        const { err } = room
        return next(err)
    }

    const user = room.users.find((ele) => ele.username === username)

    return res.status(200).json({ success: true, message: 'User details fetched successfully', data: user })
}

module.exports = getUsers