
require("dotenv").config();

const express = require("express");
const pool = require("./config/db");
const questionRoutes = require("./routes/questionRoutes");
const submitRoutes = require("./routes/submitRoutes");
const userRoutes = require("./routes/userRoutes");
const app = express();

const quizRoutes = require("./routes/quizRoutes");
app.use(express.json());
app.use("/api/quizzes", questionRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/quizzes", submitRoutes);
app.use("/api/users", userRoutes);
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Online Quiz System API is running"
    });
});

app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.status(200).json({
            status: "OK",
            database: "connected"
        });
    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            status: "ERROR",
            database: "disconnected"
        });
    }
});

const PORT = process.env.PORT || 5002;

async function startServer() {
    try {
        await pool.query("SELECT 1");
        console.log("MySQL database connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
}

startServer();
