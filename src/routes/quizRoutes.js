
const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// GET all quizzes
router.get("/", async (req, res) => {
    try {
        const [quizzes] = await pool.query(
            `SELECT quiz_id, title, description, created_at
             FROM quizzes
             ORDER BY quiz_id DESC`
        );

        res.status(200).json({
            success: true,
            count: quizzes.length,
            quizzes
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve quizzes"
        });
    }
});

// GET one quiz with its questions and options
router.get("/:id", async (req, res) => {
    try {
        const quizId = Number(req.params.id);

        if (!Number.isInteger(quizId) || quizId < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID"
            });
        }

        const [quizzes] = await pool.query(
            `SELECT quiz_id, title, description
             FROM quizzes
             WHERE quiz_id = ?`,
            [quizId]
        );

        if (quizzes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            });
        }

        const [questions] = await pool.query(
            `SELECT question_id, question_text
             FROM questions
             WHERE quiz_id = ?`,
            [quizId]
        );

        for (const question of questions) {
            const [options] = await pool.query(
                `SELECT option_id, option_text
                 FROM options
                 WHERE question_id = ?`,
                [question.question_id]
            );

            question.options = options;
        }

        res.status(200).json({
            success: true,
            quiz: {
                ...quizzes[0],
                questions
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve quiz"
        });
    }
});

// CREATE a quiz
router.post("/", async (req, res) => {
    try {
        const { title, description, created_by } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Quiz title is required"
            });
        }

        const [result] = await pool.query(
            `INSERT INTO quizzes (title, description, created_by)
             VALUES (?, ?, ?)`,
            [
                title.trim(),
                description || null,
                created_by || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Quiz created successfully",
            quiz_id: result.insertId
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: "Failed to create quiz"
        });
    }
});

module.exports = router;
