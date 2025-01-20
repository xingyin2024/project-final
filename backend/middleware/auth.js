import User from '../models/userModel.js';

//Authenticate user as middleware
export const authenticateUser = async (req, res, next) => {
  try {
    const accessToken = req.header('Authorization');
    if (!accessToken) {
      return res
        .status(401)
        .json({
          success: false,
          message: 'Unauthorized: Missing access token',
        });
    }

    const user = await User.findOne({ accessToken });
    if (user) {
      req.user = user;
      next();
    } else {
      return res
        .status(403)
        .json({ success: false, message: 'Forbidden: Invalid access token' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
