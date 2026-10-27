
const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// Submit quiz answers and calculate score
router.post("/:quizId/submit", async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const quizId = Number(req.params.quizId);
        const { user_id, answers } = req.body;

        if (
            !Number.isInteger(quizId) ||
            quizId < 1 ||
            !Number.isInteger(Number(user_id)) ||
            Number(user_id) < 1 ||
            !Array.isArray(answers)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid quiz ID, user_id, and answers array are required"
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

        const [questions] = await connection.query(
            "SELECT question_id FROM questions WHERE quiz_id = ?",
            [quizId]
        );

        if (questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "This quiz has no questions"
            });
        }

        const questionIds = questions.map(q => q.question_id);

        if (
            answers.length !== questionIds.length ||
            answers.some(a =>
                !Number.isInteger(Number(a.question_id)) ||
                !Number.isInteger(Number(a.option_id)) ||
                !questionIds.includes(Number(a.question_id))
            ) ||
            new Set(answers.map(a => Number(a.question_id))).size !== answers.length
        ) {
            return res.status(400).json({
                success: false,
                message: "Submit exactly one valid answer for every quiz question"
            });
        }

        const [users] = await connection.query(
            "SELECT user_id FROM users WHERE user_id = ?",
            [Number(user_id)]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found. Register a participant first."
            });
        }

        let score = 0;

        for (const answer of answers) {
            const [options] = await connection.query(
                `SELECT option_id, is_correct
                 FROM options
                 WHERE option_id = ? AND question_id = ?`,
                [Number(answer.option_id), Number(answer.question_id)]
            );

            if (options.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "An option does not belong to its question"
                });
            }

            if (Boolean(options[0].is_correct)) {
                score++;
            }
        }

        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO results (user_id, quiz_id, score, total_questions)
             VALUES (?, ?, ?, ?)`,
            [Number(user_id), quizId, score, questions.length]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Quiz submitted successfully",
            result_id: result.insertId,
            score,
            total_questions: questions.length,
            percentage: Math.round((score / questions.length) * 100)
        });
    } catch (error) {
        await connection.rollback();
        console.error(error.message);

        res.status(500).json({
            success: false,
            message: "Failed to submit quiz"
        });
    } finally {
        connection.release();
    }
});

module.exports = router;
