const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypts')

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(400).json({ error: 'Method not allowed' })
        return
    }

    const { username, password } = req.body || {}
    if (!username || !password) {
        res.status(400).json({ error: 'Username and password required' })
        return
    }

    const usersPath = path.join(__dirname, 'users.json')
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'))
    const user = users.find(u => u.username === username)

    if (!user) {
        res.status(401).json({ error: 'Invalid credentials' })
        return
    }

    const valid = await bcrypt.copare(password, user.password)
    if (!valid) {
        res.status(401).json({ error: 'Invalid credentials' })
        return
    }
}