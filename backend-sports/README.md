Project Overview

This project implements the backend of a web application using Node.js, Express.js, and MongoDB. The backend is responsible for handling API requests, managing application logic, and interacting with the database.

Tech Stack:
-Node.js
-Express.js
-MongoDB
-Mongoose
-REST APIs
-Insomnia / Postman (API testing )

backend/
│
├── controllers/     # Handles request logic and responses
├── middleware/      # Custom middleware (authentication, admin verification)
├── models/          # Mongoose schemas and database models
├── routes/          # API route definitions
├── utils/           # Utility/helper functions (error creation)
│
├── index.js         # Entry point of the backend server
└── package.json

Installation & Setup

-git clone https://github.com/sumi-devs/federated-socmed.git
-cd backend

Install Dependencies:

-npm install

Setup .env file:

.env.example

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=number_of_days
SERVER_NAME=server_name

Development Mode:

-npm run dev

Server runs at: http://localhost:5000