# Store Rating Application

A full-stack web application built to allow users to sign up, explore registered businesses, and submit store ratings based on explicit platform user roles.

## Tech Stack
- **Backend**: Node.js / Express.js
- **Database**: MySQL
- **Frontend**: React.js

## Project Setup & Local Installation

### 1. Database Configuration
- Open your local MySQL database client (e.g., MySQL Workbench).
- Create the schema by executing the SQL script found in `backend/schema.sql`.

### 2. Backend Server Configuration
- Open your terminal and navigate to the `backend/` directory.
- Create a `.env` file containing your database credentials:
  ```env
  PORT=5000
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=your_mysql_password
  DB_NAME=store_rating_db
  JWT_SECRET=super_secret_key_12345

- Install dependencies and start the application server:

  Bash

  npm install
  node server.js

### 3. Frontend Client Configuration
- Open a second terminal window and navigate to the client/ directory.
- Install the frontend node module components and start the Vite development ecosystem:

  Bash

  npm install
  npm run dev

###  Default Testing Accounts
- System Administrator Account: admin@platform.com / Admin@123



  
