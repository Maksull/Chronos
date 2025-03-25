# Chronos

A brief description of your project, its purpose, and what it does.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [UI features](#ui-features)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Maksull/Chronos.git
   cd yourproject
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables. 
   ### Configuration

Before running the application, you need to create a `.env` file in the chronos-backend root directory of the project and configure the following fields:

- **EMAIL_HOST**: The SMTP host for your email provider (Gmail in this case).
- **EMAIL_PORT**: The port to use for SMTP (587 is typically used for secure connections).
- **EMAIL_USER**: Your email address.
- **EMAIL_PASSWORD**: Your email app password (not your regular email password, but an app-specific password).
- **EMAIL_FROM**: The email address that will appear as the sender.
- **EMAIL_SECURE**: Set to `false` if you're using TLS, otherwise set to `true`.
- **APP_URL**: The base URL for your application.
- **APP_NAME**: The name of your application.

Make sure to replace placeholders like `your email` and `your email app password` with actual values.

4. Start the database (PostgreSQL) and ensure it's running.

5. To run both the frontend and backend of the application, please execute the following command in each of the respective repositories:
   ```bash
   npm start
   ```

## Usage

Once the application is running, you can access it at `http://localhost:3000`. Use tools like Postman or curl to interact with the API endpoints.

## API Endpoints

### Authentication

- **POST** `/auth/register` - Register a new user  
- **POST** `/auth/login` - Log in a user  
- **POST** `/auth/logout` - Log out a user 
- **POST** `/auth/verify-email` - Verify the user's email address  
- **POST** `/auth/resend-verification-code` - Resend the email verification code  
- **POST** `/auth/verify-email-change` - Confirm email change request  
- **POST** `/auth/reset-password` - Initiate password reset  
- **POST** `/auth/resend-reset-password-token` - Resend reset password token  
- **POST** `/auth/reset-password-with-token` - Reset password using token  
- **POST** `/auth/check-reset-token` - Check the validity of the reset password token  
- **PUT** `/auth/change-password` - Change the user’s password 
- **POST** `/auth/change-email` - Initiate email change 
- **GET** `/auth/verify` - Verify the authenticity of a token 


### Calendars

- **GET** `/calendars` - Get user calendars 
- **GET** `/calendars/:id` - Get a calendar by ID 
- **GET** `/calendars/:id/events` - Get events for a specific calendar 
- **POST** `/calendars` - Create a new calendar 
- **PUT** `/calendars/:id` - Update a calendar by ID 
- **PUT** `/calendars/:id/visibility` - Toggle calendar visibility 
- **DELETE** `/calendars/:id` - Delete a calendar by ID 
- **POST** `/calendars/:id/invite-links` - Create an invite link for a calendar 
- **GET** `/calendars/:id/invite-links` - Get invite links for a calendar 
- **POST** `/calendar-invites/:id/accept` - Accept a calendar invite 
- **DELETE** `/calendars/:calendarId/invite-links/:linkId` - Delete an invite link for a calendar 
- **GET** `/calendar-invites/:id` - Get information on an invite link 
- **GET** `/calendars/:id/participants` - Get participants of a calendar 
- **PUT** `/calendars/:id/participants/:userId/role` - Update participant role in a calendar 
- **DELETE** `/calendars/:id/participants/:userId` - Remove a participant from a calendar 
- **DELETE** `/calendars/:id/leave` - Leave a calendar 
- **POST** `/calendars/:id/email-invites` - Invite a user by email to a calendar 
- **GET** `/calendars/:id/email-invites` - Get email invites for a calendar 
- **DELETE** `/calendars/:calendarId/email-invites/:inviteId` - Delete an email invite for a calendar 
- **GET** `/calendar-email-invites/:token` - Get information on an email invite (no token authentication required)  
- **POST** `/calendar-email-invites/:token/accept` - Accept an email invite to a calendar 


### Categories

- **GET** `/calendars/:calendarId/categories` - Get categories for a calendar 
- **GET** `/categories/:id` - Get a category by ID 
- **POST** `/calendars/:calendarId/categories` - Create a new category for a calendar 
- **PUT** `/categories/:id` - Update a category by ID 
- **DELETE** `/categories/:id` - Delete a category by ID 


### Events

- **POST** `/calendars/:calendarId/events` - Create a new event for a calendar 
- **PUT** `/events/:id` - Update an event by ID 
- **PUT** `/calendars/:calendarId/events/:id` - Update an event for a specific calendar 
- **DELETE** `/events/:id` - Delete an event by ID 
- **DELETE** `/calendars/:calendarId/events/:id` - Delete an event from a specific calendar 


### User Profile

- **GET** `/users/profile` - Get the profile of the authenticated user 
- **PUT** `/users/profile` - Update the profile of the authenticated user 

## UI features

### 📱 Responsive Design

The application is fully responsive using Tailwind CSS utility classes:
- Mobile-first approach
- Breakpoint system
- Dark mode support

### 🌍 Internationalization

- Language switching

### 🔒 Security Features

- Protected routes
- Role-based access control (Admin/Reader/Creator)
- Session management
- Secure password handling

### 🏗️ Build Optimization

The production build is optimized with:
- Code splitting
- Tree shaking
- Vendor chunk splitting
- Minification
- Source map generation (disabled in production)

### 🌐 API Integration

The application communicates with a backend API:
- Base URL configured through environment variables
- Type-safe API requests
- Error handling and response interceptors
- Request/response transformations
- Device Location and Region Setting

## Technologies Used for Backend

- Node.js
- Fastify
- TypeScript
- TypeOrm (for ORM)
- PostgreSQL
- Bcrypt (for password hashing)
- JWT (for authentication)

## Technologies Used for Frontend

- Next.js
- TypeScript
- Tailwind CSS

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
