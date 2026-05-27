const userModel = require('../models/user.model');
const tokenBlacklistModel = require('../models/blackllist.model');
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

    const UserAlreadyExists = await userModel.findOne({
      $or : [ {username}, {email} ]
    })

    if(UserAlreadyExists){
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
//login controller function to handle the login of a user, it will check if the user exists, if yes it will compare the password with the hashed password in the database
async function loginUserController(req, res){
    const { email, password } = req.body;

    if(!email || !password){
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await userModel.findOne({ email });

    if(!user){
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password); //compare the password with the hashed password in the database

    if(!isPasswordValid){
      return res.status(400).json({ message: "Invalid email or password" });
    }

    //now create token for the user and send it back in the response, using jsonwebtoken with a secret key
    const token = jwt.sign(
      {id: user._id, username: user.username }, //payload of the token will contain the user id and username
      process.env.JWT_SECRET, //secret key for signing the token, should be stored in .env file
      {expiresIn: "1d"}
    )

    res.cookie("token", token) //set the token in a cookie

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    })

}



/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist, expects a valid token in the cookie
 * @access Public
 */
//logout controller function to handle the logout of a user, it will clear the token from the user cookie and add the token in blacklist, so that it cannot be used again for authentication
async function logoutUserController(req, res){
  const token = req.cookies.token;

  if(token){
    await tokenBlacklistModel.create({token})
  }

  res.clearCookie("token")

  res.status(200).json({
    message: "User logged out successfully"
  })
}


/**
 * @name getMeController
 * @description Get the currently logged in user's information
 * @access Private
 */
async function getMeController(req, res){
  const user = await userModel.findById(req.user.id)

  res.status(200).json({
    message: "User information retrieved successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    }
  })
}



module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController
}