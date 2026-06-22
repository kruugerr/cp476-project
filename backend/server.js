import dotenv from "dotenv";
import express from "express";
import path from "path";
import cors from "./src/config/cors.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.static(path.join(process.cwd(), "../frontend")));
app.use(express.json());
app.use(cors);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
