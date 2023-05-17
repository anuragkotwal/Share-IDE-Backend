const router = require('express').Router()
const userControllers = require('../controllers/user')

router.post('/save', userControllers.saveUserDetails)
router.get('/getusers', userControllers.getUsers)

module.exports = router
