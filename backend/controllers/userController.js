const User = require('../models/User');
const bcrypt = require('bcrypt');

// Register a new user (hash password)
const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, gender } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);

    const newUser = new User({ name, email, password: hashed, age, gender });
    const savedUser = await newUser.save();

    // Do NOT return password
    const { password: _, ...userWithoutPassword } = savedUser.toObject();
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get user by ID (public or protected depending on route)
const getUser = async (req, res) => {
  try {
    const userId = req.params.id.trim();
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { registerUser, getUser };
