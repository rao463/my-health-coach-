const express = require('express');
const { registerUser, getUser } = require('../controllers/userController');

const router = express.Router();

// Routes
router.post('/register', registerUser);  // POST /api/users/register
router.get('/:id', getUser);             // GET /api/users/:id

module.exports = router;


