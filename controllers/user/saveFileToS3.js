const AWS = require('aws-sdk')
const S3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_SHAREIDE,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_SHAREIDE,
    region: process.env.AWS_REGION_SHAREIDE,
})
const bucket = process.env.BUCKET;
const logger = require('../../utils/logger')

const saveFileToS3 = (code, roomId) => {
    try {
        const data = {
            Bucket: bucket,
            Key: roomId,
            Body: code,
            ContentType: 'text/plain',
        }
        // eslint-disable-next-line no-unused-vars
        S3.putObject(data, (err, data) => {
            if (err) {
                logger.error("ERROR_SAVE_FILE_TO_S3",err)
            } else {
                logger.info('File saved to S3')
            }
        })
    } catch (err) {
        console.log(err)
    }
}

module.exports = saveFileToS3
