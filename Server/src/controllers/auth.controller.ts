import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { _id: userId },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRATION } as jwt.SignOptions,
  );
  const refreshToken = jwt.sign(
    { _id: userId },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION } as jwt.SignOptions,
  );
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      res
        .status(400)
        .json({ error: "Email, username, and password are required." });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "User with this email already exists." });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const profileImage = req.file
      ? `/uploads/${req.file.filename}`
      : undefined;

    const user = new User({
      email,
      username,
      password: hashedPassword,
      ...(profileImage && { profileImage }),
    });

    const savedUser = await user.save();
    const tokens = generateTokens((savedUser._id as any).toString());

    savedUser.refreshTokens = [tokens.refreshToken];
    await savedUser.save();

    res.status(201).json({
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        username: savedUser.username,
        profileImage: savedUser.profileImage,
      },
      ...tokens,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during registration." });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      res.status(400).json({ error: "Invalid email or password." });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(400).json({ error: "Invalid email or password." });
      return;
    }

    const tokens = generateTokens((user._id as any).toString());
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage,
      },
      ...tokens,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during login." });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ error: "Refresh token is required." });
      return;
    }

    let decoded: { _id: string };
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string,
      ) as { _id: string };
    } catch {
      res.status(401).json({ error: "Invalid refresh token." });
      return;
    }

    const user = await User.findById(decoded._id);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      if (user) {
        user.refreshTokens = [];
        await user.save();
      }
      res.status(401).json({ error: "Invalid refresh token." });
      return;
    }

    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    const tokens = generateTokens((user._id as any).toString());
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    res.status(200).json(tokens);
  } catch (err) {
    res.status(500).json({ error: "Server error during token refresh." });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token is required." });
      return;
    }

    let decoded: { _id: string };
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string,
      ) as { _id: string };
    } catch {
      res.status(200).json({ message: "Logged out." });
      return;
    }

    const user = await User.findById(decoded._id);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
      await user.save();
    }

    res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    res.status(500).json({ error: "Server error during logout." });
  }
};

export const googleLogin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({ error: "Google credential is required." });
      return;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ error: "Invalid Google token." });
      return;
    }

    const { email, name, sub: googleId, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        username: name || email.split("@")[0],
        googleId,
        profileImage: picture || "",
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (payload.picture && !user.profileImage) {
        user.profileImage = payload.picture;
      }
      await user.save();
    }

    const tokens = generateTokens((user._id as any).toString());
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage,
      },
      ...tokens,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during Google login." });
  }
};
