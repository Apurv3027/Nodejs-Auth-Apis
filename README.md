# Node.js Authentication API

A complete authentication API built with Node.js, Express, MongoDB Atlas, and Swagger UI documentation.

## Features

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Joi
- MongoDB Atlas integration with Mongoose
- Swagger UI documentation
- MVC architecture
- Error handling
- CORS support

## Project Structure

```
nodejs-auth-api/
├── controllers/
│   └── authController.js
├── db/
│   └── connection.js
├── middleware/
│   ├── auth.js
│   └── validation.js
├── models/
│   └── BlacklistedToken.js
│   └── User.js
├── routes/
│   └── authRoutes.js
├── swagger/
│   └── swagger.js
├── views/
│   └── home-screen.html
├── .env
├── .gitignore
├── app.js
├── package.json
└── README.md
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   MONGODB_URI = mongodb://localhost:27017/auth_api
   JWT_SECRET = your-super-secret-jwt-key
   JWT_EXPIRES_IN = 1d
   PORT = 3000
   ```

4. Run the application:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Documentation

Interactive API documentation is available via Swagger UI. Use the following links to explore and test all authentication APIs directly from your browser:
- Development URL: http://localhost:3000
- Production URL: https://nodejs-auth-apis-i66p.onrender.com

Once the server is running locally or deployed, open the respective URL in your browser to access the full API reference.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user and invalidate the token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password using token
- `GET /api/auth/me` - Get current user profile (requires authentication)

## Usage Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login User
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Logout User
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Forgot Password
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

### Reset Password
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN_FROM_EMAIL",
    "newPassword": "newpassword123"
  }'
```

### Get User Profile
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Technologies Used

- Node.js
- Express.js
- MongoDB Atlas & Mongoose
- JWT (JSON Web Tokens)
- bcryptjs
- Joi (validation)
- Swagger UI Express
- CORS

## Security Features

- Password hashing with bcrypt
- JWT token authentication with blacklisting
- Token invalidation on logout  
- Password reset with secure tokens (10-minute expiry)
- Input validation with comprehensive error messages
- Email uniqueness validation
- Account status verification
- Automatic cleanup of expired tokens
