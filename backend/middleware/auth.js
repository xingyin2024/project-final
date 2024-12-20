import { User } from "../models/userModel";

//Authenticate user as middleware
export const authenticateUser = async (req, res, next) => {
  // Authenticate accessToken existing
  const accessToken = req.header("Authorization")
  if (!accessToken) {
    return res.status(401).json({ error: "Unauthorized: Missing access token" })
  }

  // find user with right accessToken
  const user = await User.findOne({ accessToken })
  if (user) {
    console.info("User is found", user)
    req.user = user
    next()
  } else {
    return res.status(403).json({ error: "Forbidden: Invalid access token" })
  }
}

// Add authentication middleware to restrict access to admins
export const authenticateAdmin = async (req, res, next) => {
  const user = req.user;
  if (user && user.role === "admin") {
    return next();
  }
  res.status(403).json({ error: "Access denied" });
};