const logger = require('./logger')

const handleCastErrorDB = (err) => {
    err.message = `Invalid ${err.path}: ${err.value}.`
    err.isOperational = true
    return err
}

const handleDuplicateFieldsDB = (err) => {
    const value = Object.entries(err.keyValue)[0]
    err.message = `${value[0]}: ${value[1]} already exists.`
    err.isOperational = true
    return err
}

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el['message'])
    err.message = `${errors.join('. ')}`
    err.isOperational = true
    return err
}

const handleExpressValidatorErr = (err) => {
    err.message = Object.entries(err.errors)
        .map((el) => `${el[1]}`)
        .join('. ')
    err.isOperational = true
    return err
}

const sendError = (err, req, res, next) => {
    if (err.isOperational) {
        logger.error('Res - 400', {
            req: {
                url: req.url,
                method: req.method,
                body: req.body,
                query: req.query,
                headers: req.headers,
                cookies: req.cookies,
            },
            res: {
                status: 400,
                msg: err.message,
                err: err.stack,
            },
        })

        return res.status(400).json({ success: false, message: err.message, data: null })
    } else {
        logger.error('Res - 500', {
            req: {
                url: req.url,
                method: req.method,
                body: req.body,
                query: req.query,
                headers: req.headers,
                cookies: req.cookies,
            },
            res: {
                status: 500,
                msg: err.message,
                err: err.stack,
            },
        })
        return res.status(500).json({ success: false, message: 'Internal server error', data: null })
    }
}

module.exports = (err, req, res, next) => {
    let error = { ...err }
    error.message = err.message

    if (err.name === 'CastError') error = handleCastErrorDB(error)
    else if (err.code === 11000) error = handleDuplicateFieldsDB(error)
    else if (err.name === 'ValidationError') error = handleValidationErrorDB(error)
    else if (err.name === 'ExpressValidatorErr') error = handleExpressValidatorErr(error)

    sendError(error, req, res, next)
}
