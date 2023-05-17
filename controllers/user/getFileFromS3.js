const userServices = require('../../services/user')
const AWS = require('aws-sdk')
const S3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
})
const bucket = process.env.BUCKET
const ACTIONS = require('../../utils/Actions')
const logger = require('../../utils/logger')
const getFileFromS3 = async (socket, roomId, username) => {
    const room = await userServices.findRoom({ roomId, 'users.username': username })
    if (room) {
        const user = room.users.find((ele) => ele.username === username)
        if (user) {
            const params = {
                Bucket: bucket,
                Key: roomId,
            }
            S3.getObject(params, (err, data) => {
                if (err && err.code === 'NoSuchKey') {
                    logger.info(err)
                    console.log('No file found')
                    socket.emit(ACTIONS.CODE_CHANGE, { code: '' })
                } else {
                    const code = data.Body.toString()
                    socket.emit(ACTIONS.CODE_CHANGE, { code })
                }
            })
        }
    }
}

module.exports = getFileFromS3
