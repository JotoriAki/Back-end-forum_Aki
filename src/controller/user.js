import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Fs from "node:fs/promises";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAll = async (req, res) => {
  try {
    const users = await User.find().select("-hash_password");

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err });
    console.log(err);
  }
};

export const getByToken = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id);
    const { _id, username, email, avt, notification } = user;
    res.status(200).json({ _id, username, email, avt, notification });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
export const getById = async (req, res) => {
  try {
    const user = await User.findById(req.body.id);
    const { _id, username, email, avt, notification } = user;
    res.status(200).json({ _id, username, email, avt, notification });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const update = async (req, res) => {
  try {
    const updateData = {
      username: req.body.username,
    };
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const updated = await User.findByIdAndUpdate(decoded._id, updateData, {
      new: true,
    });
    if (updated) {
      return res.status(200).json({
        success: true,
        user: updated,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Ban chưa điền đầy đủ thông tin",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "server có vẫn đề soryy",
    });
  }
};

export const updatePassword = async (req, res) => {

};

export const uploadAvatar = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Bạn chưa đăng nhập hoặc chưa đăng ký",
      });
    }
    const avatar = user.avt;
    const filePath = path.resolve(__dirname, "../" + avatar);

    user.avt = "/public/image/" + req.file.filename;
    await user.save();

    if (
      avatar !=
      "https://a0.anyrgb.com/pngimg/1658/1292/little-boy-icon-little-girl-avatar-ico-icon-design-boy-cartoon-cartoon-character-sitting-cool.png"
    ) {
      await Fs.unlink(filePath);
    }

    res.status(200).json({
      success: true,
      message: "Đã thay avatar thành công",
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "server có vẫn đề soryy",
    });
  }
};
