var express = require('express');
var router = express.Router();

const UserModel = require('../models/user.models');
const { registerValidation, loginValidation } = require('../validation/validation');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', async function (req, res) {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const emailExitsts = await UserModel.findOne({ email: req.body.email});
  if (emailExitsts) return res.status(400).send('Email exitsts in database. Please choose other email');

  const salt = await bcryptjs.genSalt(10);
  const hassPassword = await bcryptjs.hash(req.body.password, salt);

  const newUser = new UserModel();
  newUser.name = req.body.name;
  newUser.email = req.body.email;
  newUser.password = hassPassword;

  try {
    const user = await newUser.save();
    res.send(user);
  } catch (error) {
    res.status(404).send(404)
  }

});

router.post('/login', async function (req, res){
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const userLogin = await UserModel.findOne({ email: req.body.email });
  if(!userLogin) return res.status(400).send('User not found');

  const isPasswordLogin = await bcryptjs.compare(req.body.password, userLogin.password)
  if(!isPasswordLogin) return res.status(400).send('Password incorrect');

  const token = jwt.sign({_id: userLogin._id}, 'token');

  res.header('auth-token', token).send(token);
});

router.get('/', authMiddleware, function (req, res) {
  res.send('My Profile');
});

module.exports = router;
