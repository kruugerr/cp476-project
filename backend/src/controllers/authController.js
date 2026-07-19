import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { createToken, getJWTSecret } from "../middleware/auth.js";
import { createUser, getUserByEmail } from "../model/userModel.js";

const JWT_SECRET = getJWTSecret();

// Handles POST /auth/register
// Creates a new user account. Note: we identify users by EMAIL, not
// username — our schema (users table) has no username column, only email
// with a UNIQUE constraint. Password is never stored as-is; bcrypt turns
// it into a one-way hash before it touches the database.

export const userRegister = async (req, res) => {
    console.log("Received registration request:", req.body);
    try {
        const { first_name, last_name, email, password, role } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        getUserByEmail(email, async (err, existingUser) => {
            if (err) return res.status(500).json({ message: "Server error" });
            if (existingUser)
                return res
                    .status(409)
                    .json({ message: "Email already registered" });

            const password_hash = await bcrypt.hash(password, 10);

            createUser(
                { first_name, last_name, email, password_hash, role },
                (err, newUser) => {
                    if (err)
                        return res
                            .status(500)
                            .json({ message: "Failed to create user" });

                    const token = createToken(newUser);

                    res.status(201).json({
                        message: "User registered successfully",
                    });
                },
            );
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

export const userLogin = (req, res) => {
    console.log("Received login request:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    getUserByEmail(email, async (err, user) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (!user)
            return res.status(401).json({ message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match)
            return res.status(401).json({ message: "Invalid credentials" });

        const token = createToken(user);

        const { password_hash, ...safeUser } = user;
        res.json({ user: safeUser, token });
    });
};

async function getGoogleUserInfo(accessToken) {
    const client = new OAuth2Client();

    client.setCredentials({ access_token: accessToken });

    console.log(accessToken);
    const response = await client.request({
        url: "https://www.googleapis.com/oauth2/v3/userinfo",
    });

    return response.data;
}

export const userLoginOAuth = async (req, res) => {
    const accessToken = req.body.access_token;

    try {
        const googleUser = await getGoogleUserInfo(accessToken);
        if (!googleUser || !googleUser.email || !googleUser.email_verified) {
            throw new Error();
        }

        getUserByEmail(googleUser.email, async (err, user) => {
            if (err) return res.status(500).json({ message: "Server error" });
            if (!user) {
                return res
                    .status(401)
                    .json({ message: "Invalid Google credentials" });
            }

            const token = createToken(user);
            const { password_hash, ...safeUser } = user;
            res.json({ user: safeUser, token });
        });
    } catch (error) {
        res.status(401).json({ message: "Invalid Google credentials" });
    }
};

export const userResetPassword = (req, res) => {
    const { email, newPassword } = req.body;
    console.log("Received password reset request for:", email);
    newPassword = bcrypt.hash(newPassword, 10);
};

export const userForgotPassword = (req, res) => {
    const { email } = req.body;
    console.log("Received email for password reset:", email);
    // TODO: send reset link — Phase 4 territory, not blocking right now
};
