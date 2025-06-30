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
  const user = users.find(u => u.username === username);
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  res.status(200).json({ message: 'Login successful' });
};