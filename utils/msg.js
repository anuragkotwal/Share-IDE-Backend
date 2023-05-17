const generatedMsg = (text, username) => {
    return {
        username,
        msg: text,
        createdAt: new Date(),
    }
}

module.exports = { generatedMsg }
