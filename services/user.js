const User = require('../models/user')
const logger = require('../utils/logger')

const createUser = async (body) => {
    try {
        const user = await User.create(body)
        if (user) return user
        return null
    } catch (err) {
        logger.error(`Error in creating user - ${JSON.stringify(body)}`, err)
        return { err }
    }
}

const findRoom = async (query) => {
    try {
        const user = await User.findOne(query).lean()
        if (user) return user
        return null
    } catch (err) {
        logger.error(`Error in finding user - ${JSON.stringify(query)}`, err)
        return { err }
    }
}

const updateUser = async (query, body) => {
    try {
        const udpate = await User.findOneAndUpdate(query, body, {
            new: true,
            runValidators: true,
        }).lean()
        if (udpate) return udpate
        return null
    } catch (err) {
        logger.error(`Error in updating user - ${JSON.stringify(query)}`, err)
        return { err }
    }
}

module.exports = { createUser, findRoom, updateUser }
