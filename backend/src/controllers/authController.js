import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUserByEmail, createUser } from "../model/userModel.js";

// Handles POST /auth/register
// Creates a new user account. Note: we identify users by EMAIL, not
// username — our schema (users table) has no username column, only email
// with a UNIQUE constraint. Password is never stored as-is; bcrypt turns
// it into a one-way hash before it touches the database.

export const userRegister = async (req, res) => {
    try {
        const { first_name, last_name, email, password, role } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        getUserByEmail(email, async (err, existingUser) => {
            if (err) return res.status(500).json({ message: "Server error" });
            if (existingUser) return res.status(409).json({ message: "Email already registered" });

            const password_hash = await bcrypt.hash(password, 10);

            createUser({ first_name, last_name, email, password_hash, role }, (err, newUser) => {
                if (err) return res.status(500).json({ message: "Failed to create user" });

                const token = jwt.sign(
                    { user_id: newUser.user_id, role: newUser.role },
                    process.env.JWT_SECRET,
                    { expiresIn: "7d" }
                );

                res.status(201).json({ user: newUser, token });
            });
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

export const userLogin = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    getUserByEmail(email, async (err, user) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const { password_hash, ...safeUser } = user;
        res.json({ user: safeUser, token });
    });
};

export const userForgotPassword = (req, res) => {
    const { email } = req.body;
    console.log("Received email for password reset:", email);
    // TODO: send reset link — Phase 4 territory, not blocking right now
};

export const userResetPassword = (req, res) => {
    const { email, newPassword } = req.body;
    console.log("Received password reset request:", { email, newPassword });
};