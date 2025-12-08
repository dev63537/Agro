const express = require('express');
const router = express.Router();

const { login, registerMaster } = require('../controllers/auth.controller');

// Public: First-time master registration
router.post('/register-master', registerMaster);

// Login (master or shop admin)
router.post('/login', login);

module.exports = router;
