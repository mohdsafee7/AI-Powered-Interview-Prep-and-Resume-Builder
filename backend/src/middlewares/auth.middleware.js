const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blackllist.model");

async function authUser(req, res, next){

  const token = req.cookies.token;

  if(!token){
    return res.status(401).json({
      message: "Token not found, authorization denied"
    })
  }

  const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token });

  if(isTokenBlacklisted){
    return res.status(401).json({
      message: "Token is invalid"
    })
  }

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded; //attach the decoded token to the request object, so that we can access the user information in the next middleware or route handler
    next(); //call the next middleware or route handler

  }catch(err){
    return res.status(401).json({
      message: "Invalid token, authorization denied"
    })
  }
}

module.exports = authUser;