const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
/**
 * @name registerUserController
 * @description Register a new user, expects username, email and password in the request body
 * @access Public
 */


//register controller function to handle the registration of a new user, it will check if the user already exists, 
// if not it will hash the password and save the user to the database, then it will create a token for the user and send it back in the response
async function registerUserController(req, res){
    const { username, email, password } = req.body;

    if(!username || !email || !password){
      return res.status(400).json({ message: "Please provide username, email and password" });
    }

    const isUserAlreadyExists = await userModel.findOne({
      $or : [ {username}, {email} ]
    })

    if(userAlreadyExists){
      return res.status(400).json({
        message: "Account already exists with this email/username"
      })
    }

    // Hash the password before saving to the database, using bcryptjs with a salt round of 10
    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hash
    })

    //now create token for the user and send it back in the response, using jsonwebtoken with a secret key
    const token = jwt.sign(
      {id: user._id, username: user.username }, //payload of the token will contain the user id and username
      process.env.JWT_SECRET, //secret key for signing the token, should be stored in .env file
      {expiresIn: "1d"}
    )

    res.cookie("token", token) //set the token in a cookie

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    })
}



/**
 * @name loginUserController
 * @description login a user, expects email and password in body
 * @access Public
 */
async function loginUserController(req, res){
  
}



module.exports = {
  registerUserController,
}