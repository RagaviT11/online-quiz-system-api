
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || password.length < 8
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password of at least 8 characters are required"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES (?, ?, ?, 'participant')`,
            [name.trim(), email.trim(), passwordHash]
        );

        res.status(201).json({
            success: true,
            message: "Participant registered successfully",
            user_id: result.insertId
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        console.error(error.message);
        res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
});

module.exports = router;
