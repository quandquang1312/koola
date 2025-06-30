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

    let client;
    try {
        client = await pool.connect()
        const userCheck = await client.query('SELECT id FROM users WHERE username = $1', [username])
        if (userCheck.rows.length > 0) {
            res.status(409).json({ error: 'User already exists' })
            return
        }

        const hashed = await bcrypt.hash(password, 10)
        await client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashed])
        res.status(201).json({ message: 'User registered' })
    } catch (err) {
        console.error('Register error:', err)
        res.status(500).json({ error: 'Database error' })
    } finally {
        if (client) client.release()
    }
}