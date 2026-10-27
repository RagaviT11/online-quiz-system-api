# Online Quiz System API

## Overview
The Online Quiz System is a backend REST API developed using Node.js, Express.js, and MySQL. It allows users to register as participants, create quizzes, add multiple-choice questions, submit answers, and receive automatically calculated scores.

## Features
- Create and retrieve quizzes
- Add multiple-choice questions with answer options
- Register participants
- Securely hash participant passwords using bcrypt
- Submit quiz answers and calculate scores automatically
- Store quiz results in MySQL
- Validate quiz submissions and option selections
- RESTful API endpoints with JSON responses

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Database Driver:** mysql2
- **Password Hashing:** bcryptjs
- **Configuration:** dotenv
- **API Testing:** PowerShell REST API requests

## Project Structure
```text
Task5-Online-Quiz-System/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── routes/
│   │   ├── quizRoutes.js
│   │   ├── questionRoutes.js
│   │   ├── userRoutes.js
│   │   └── submitRoutes.js
│   └── app.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Database
Database name: `online_quiz_db`

Tables:
- `users` — participant details and password hashes
- `quizzes` — quiz information
- `questions` — questions belonging to quizzes
- `options` — multiple-choice options and correct-answer flags
- `results` — participant scores and submission details

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Create a `.env` file in the project root:

```env
PORT=5002
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=online_quiz_db
DB_PORT=3306
JWT_SECRET=your_secret_value
```

Replace the example values with your local configuration. Do not commit `.env` to GitHub.

### 3. Start the server
```bash
node src/app.js
```

The server runs on port `5002` when configured as above.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/quizzes` | Retrieve all quizzes |
| GET | `/api/quizzes/:id` | Retrieve a quiz and its questions |
| POST | `/api/quizzes` | Create a quiz |
| POST | `/api/quizzes/:quizId/questions` | Add questions and options |
| POST | `/api/users/register` | Register a participant |
| POST | `/api/quizzes/:quizId/submit` | Submit answers and calculate the score |

## Example: Create a Quiz

```json
{
  "title": "Java Fundamentals",
  "description": "Basic Java programming quiz"
}
```

Send a `POST` request to `/api/quizzes` with the JSON body.

## Example: Register a Participant

```json
{
  "name": "Test Participant",
  "email": "participant1@example.com",
  "password": "TestPass123!"
}
```

Send a `POST` request to `/api/users/register`.

## Example: Submit a Quiz

```json
{
  "user_id": 1,
  "answers": [
    {
      "question_id": 1,
      "option_id": 1
    }
  ]
}
```

Send a `POST` request to `/api/quizzes/1/submit`. Use valid IDs from your database.

## Test Result
The quiz submission API was tested successfully with a sample quiz. It returned a score of `1/1` and a percentage of `100%`.

## Security Notes
- Store credentials in environment variables.
- Keep `.env` and `node_modules` out of version control.
- Participant passwords are hashed before storage.
- Authentication and authorization should be added before using the API in production.

## Author
CodSoft Backend Development Internship — Task 5
