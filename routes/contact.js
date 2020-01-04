const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');
const Contact = require('../models/Contact');

// @route   GET api/contacts
// @desc    Get all users contacts
// @access  Private
router.get('/', isAuth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort({ date: -1});

    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/contacts
// @desc    Add new contacts
// @access  Private
router.post(
  '/', 
  [
    isAuth,
    [ check('name', 'Name is required').not().isEmpty() ]
  ], 
  async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array()});
    }  

    const { name, email, phone, type } = req.body;

    try {
      const newContact = new Contact({name, email, phone, type, user: req.user.id });

      const contact = await newContact.save();
      res.json(contact);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// @route   PUT api/contacts/:id
// @desc    Update contact
// @access  Private
router.put('/:id', isAuth, async (req, res) => {
  const { name, email, phone, type } = req.body;

  // Build contact object
  const contactFields = {};
  if(name) contactFields.name = name;
  if(email) contactFields.email = email;
  if(phone) contactFields.phone = phone;
  if(type) contactFields.type= type;

  try {
    let contact = await Contact.findById(req.params.id);

    if(!contact){
      return res.status(404).json({ msg: 'Contact not found'});
    }

    // Make sure user own contact
    if(contact.user.toString() !== req.user.id){
      res.status(401).json({ msg: 'Not authorized'});
    }

    contact = await Contact.findByIdAndUpdate(req.params.id,
      { $set: contactFields },
      { new: true },
    );

    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/contacts/:id
// @desc    Delete contact
// @access  Private
router.delete('/:id', isAuth, async (req, res) => {
  try {
  const contact = await Contact.findById(req.params.id);

  if(!contact){
    return res.status(404).json({ msg: 'No contact found!'});
  }

  // Make sure user own contact
  if(contact.user.toString() !== req.user.id){
    return res.status(401).json({ msg: 'Not authorized'});
  }

  await contact.delete()
  res.status(200).json({ msg: 'Successfully delete contact'});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;