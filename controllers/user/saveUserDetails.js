const userServices = require('../../services/user')

const saveUserDetails = async (req, res, next) => {
    const { username, roomId } = req.body

    const roomExists = await userServices.findRoom({ roomId })

    if (!roomExists) {
        await userServices.createUser({
            active: true,
            roomId: roomId,
            users: { username: username.toLowerCase(), role: '0' },
        })
    } else {
        const user = roomExists.users.find((ele) => ele.username.toLowerCase() === username.toLowerCase())
        if (!user) {
            await userServices.updateUser(
                { roomId },
                {
                    $push: {
                        users: {
                            username: username,
                            role: '1',
                        },
                    },
                }
            )
        }
    }

    return res.status(200).json({ success: true, message: 'User details saved successfully', data: null })
}

module.exports = saveUserDetails
