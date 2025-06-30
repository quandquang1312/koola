const bcrypt = require('bcryptjs')
const { Pool } = require('pg')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' })
        return
    }

    let body = req.body
    if (!body) {
        body = await new Promise(resolve => {
            let data = ''
            req.on('data', chunk => { data += chunk })
            req.on('end', () => resolve(JSON.parse(data)))
        })
    }

    const { username, password } = body
    if (!username || !password) {
        res.status(400).json({ error: 'Username and password required' })
        return
    }

    let client
    try {
        client = await pool.connect()
        const userCheck = await client.query('SELECT * FROM users WHERE username = $1', [username])
        if (userCheck.rows.length === 0) {
            res.status(409).json({ error: 'Username does not exist' })
            return
        }

        const user = userCheck.rows[0]
        const valid = await bcrypt.compare(password, user.password)
        if (valid) {
            res.status(200).json({ message: 'Login SUCCESSFULLY' })
        } else {
            res.status(401).json({ error: 'Password is invalid' })
        }
    } catch (err) {
        console.log('Login error: ', err)
        res.status(500).json({ error: 'Database error' })
    } finally {
        if (client) client.release()
    }
}