import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from "./models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    const adminEmail = "yashuproject08@gmail.com";
    const adminPassword = "Admin@123";

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("⚠️ Admin account already exists");

      // Make sure the existing account is admin
      existingAdmin.role = "admin";
      existingAdmin.isVerified = true;

      await existingAdmin.save();

      console.log("✅ Existing account updated to admin");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      adminPassword,
      10
    );

    // Create admin
    const admin = await User.create({
      name: "PizzaVerse Admin",
      email: adminEmail,
      password: hashedPassword,

      role: "admin",

      isVerified: true,
    });

    console.log("==================================");
    console.log("✅ ADMIN ACCOUNT CREATED");
    console.log("==================================");
    console.log("Email:", admin.email);
    console.log("Password:", adminPassword);
    console.log("Role:", admin.role);
    console.log("==================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Admin Creation Error:", error);
    process.exit(1);
  }
};

createAdmin();