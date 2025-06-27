const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { username, password } = req.body || {};
    if (!username || !password) {
        res.status(400).json({ error: 'Username and password required' });
        return;
    }

    const usersPath = path.join(__dirname, 'users.json');
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

    if (users.find(u => u.username === username)) {
        res.status(409).json({ error: 'User already exists' });
        return;
    }

    const hashed = await bcrypt.hash(password, 10);
    users.push({ username, password: hashed });
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    res.status(201).json({ message: 'User registered' });
};