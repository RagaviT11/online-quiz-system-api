
const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// Add a question and its multiple-choice options
router.post("/:quizId/questions", async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const quizId = Number(req.params.quizId);
        const { question_text, options } = req.body;

        if (!Number.isInteger(quizId) || quizId < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID"
            });
        }

        if (
            typeof question_text !== "string" ||
            !question_text.trim() ||
            !Array.isArray(options) ||
            options.length < 2 ||
            options.some(o => typeof o.text !== "string" || !o.text.trim()) ||
            options.filter(o => o.is_correct === true).length !== 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Provide a question, at least two options, and exactly one correct option"
            });
        }

        const [quizzes] = await connection.query(
            "SELECT quiz_id FROM quizzes WHERE quiz_id = ?",
            [quizId]
        );

        if (quizzes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found"
            });
        }

        await connection.beginTransaction();

        const [questionResult] = await connection.query(
            "INSERT INTO questions (quiz_id, question_text) VALUES (?, ?)",
            [quizId, question_text.trim()]
        );

        for (const option of options) {
            await connection.query(
                "INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)",
                [questionResult.insertId, option.text.trim(), option.is_correct]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Question and options added successfully",
            question_id: questionResult.insertId
        });
    } catch (error) {
        await connection.rollback();
        console.error(error.message);

        res.status(500).json({
            success: false,
            message: "Failed to add question"
        });
    } finally {
        connection.release();
    }
});

module.exports = router;
