import { Response } from "express";
import User from "../models/user.model";
import { AuthRequest } from "../middleware/auth.middleware";

export const getUserById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -refreshTokens",
    );
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (req.userId !== req.params.id) {
      res.status(403).json({ error: "You can only update your own profile." });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (req.body.username) {
      user.username = req.body.username;
    }

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      email: updatedUser.email,
      username: updatedUser.username,
      profileImage: updatedUser.profileImage,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};
