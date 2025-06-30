const bcrypt = require('bcryptjs');
let users = []; // For demo only; not persistent!

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = req.body;
  if (!body) {
    body = await new Promise(resolve => {
      let data = '';
      req.on('data', chunk => { data += chunk });
      req.on('end', () => resolve(JSON.parse(data)));
    });
  }

  const { username, password } = body;
  if (users.find(u => u.username === username)) {
    res.status(409).json({ error: 'User already exists' });
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });
  res.status(201).json({ message: 'User registered' });
};