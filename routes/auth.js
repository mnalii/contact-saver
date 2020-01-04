const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const config = require('config');
const isAuth = require('../middleware/auth');

// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', isAuth,async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.send('Server Error');
  }
});

// @route   POST api/auth
// @desc    Auth user & get token
// @access  Public
router.post(
  '/', 
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array()});
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if(!user){
        return res.status(400).json({ msg: 'Invalid credentials'});
      }

      const isMatch = await bycrypt.compare(password, user.password);

      if(!isMatch){
        return res.status(400).json({ msg: 'Invalid credentials'});
      }

      const payload = {
        user: {
          id: user.id
        }
      }
  
      jwt.sign(payload, config.get('jwtSecret'), {
        expiresIn: 3600
      }, (err, token) => {
        if(err) throw err;
        res.json({ token });
      });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

module.exports = router;