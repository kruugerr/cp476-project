import dotenv from "dotenv";
import express from "express";
import cors from "./src/config/cors.js";

import { initDB } from "./src/config/db.js";

import adminRouter from "./src/routes/adminRoute.js";
import authRouter from "./src/routes/authRoute.js";
import userRouter from "./src/routes/userRoute.js";
// import activityRouter from "./src/routes/activityRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Port
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Setting
// app.use(express.static(path.join(process.cwd(), "../frontend")));
app.use(express.json());
app.use(cors);
await initDB();

// Routes
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);
