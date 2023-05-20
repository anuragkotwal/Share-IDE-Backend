const express = require('express')
const app = express()
const http = require('http')
const { connect, default: mongoose } = require('mongoose')
mongoose.set('strictQuery', false)
require('dotenv').config()
const router = require('./routes')
const { Server } = require('socket.io')
const errorHandler = require('./utils/errorHandler')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const logger = require('./utils/logger')
const socket = require('./socket/socket')

const server = http.createServer(app)
const io = new Server(server)
socket(io)

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
})

process.on('uncaughtException', (err) => {
    logger.error(`Unhandled Exception - ${err.message}`, { err: err.stack })
})

const whitelist = [/http:\/\/localhost:[0-9]{4}/,process.env.FRONTEND_URL]
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.some((el) => origin?.match(el)) || origin === undefined) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
}

connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(logger.info('> Mongodb connected.'))
    .catch((err) => {
        logger.error('> Failed to connect to Mongodb', err)
    })

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/health-check', (req, res) => {
    return res.status(200).json({ success: true, message: 'Working', data: null })
})

app.use('/api/v1/', router)
app.all('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'request not found',
        data: null,
    })
})
app.use(errorHandler)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => logger.info(`> Server running on port ${PORT}`))

process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection - ${err.message}`, { err: err.stack })
})
