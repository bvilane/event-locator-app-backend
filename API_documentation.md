# Event Locator API Documentation

This document provides information about the Event Locator API endpoints.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using JWT tokens.

Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Endpoints

### User Management

#### Register a new user

```
POST /users/register
```

**Request Body:**
```json
{
  "username": "example",
  "email": "user@example.com",
  "password": "password123",
  "name": "Example User",
  "preferredCategories": ["music", "sports"],
  "preferredLanguage": "en"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "user_id",
    "username": "example",
    "email": "user@example.com",
    "name": "Example User"
  },
  "token": "jwt_token"
}
```

#### Login user

```
POST /users/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User logged in successfully",
  "user": {
    "_id": "user_id",
    "username": "example",
    "email": "user@example.com",
    "name": "Example User"
  },
  "token": "jwt_token"
}
```

#### Get user profile

```
GET /users/profile
```

**Response:**
```json
{
  "_id": "user_id",
  "username": "example",
  "email": "user@example.com",
  "name": "Example User",
  "location": {
    "type": "Point",
    "coordinates": [0, 0]
  },
  "preferredCategories": ["music", "sports"],
  "preferredLanguage": "en",
  "createdAt": "timestamp"
}
```

#### Update user profile

```
PUT /users/profile
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "preferredCategories": ["music", "arts"],
  "preferredLanguage": "fr",
  "location": {
    "coordinates": [10.5, 40.5]
  }
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "user_id",
    "username": "example",
    "email": "user@example.com",
    "name": "Updated Name",
    "location": {
      "type": "Point",
      "coordinates": [10.5, 40.5]
    },
    "preferredCategories": ["music", "arts"],
    "preferredLanguage": "fr",
    "updatedAt": "timestamp"
  }
}
```

### Event Management

#### Create a new event

```
POST /events
```

**Request Body:**
```json
{
  "title": "Sample Event",
  "description": "This is a sample event",
  "location": {
    "coordinates": [10.5, 40.5],
    "address": "123 Event St, City, Country"
  },
  "date": "2023-12-31T18:00:00Z",
  "endDate": "2023-12-31T22:00:00Z",
  "categories": ["music", "festival"],
  "maxAttendees": 100,
  "image": "http://example.com/image.jpg"
}
```

**Response:**
```json
{
  "message": "Event created successfully",
  "event": {
    "_id": "event_id",
    "title": "Sample Event",
    "description": "This is a sample event",
    "location": {
      "type": "Point",
      "coordinates": [10.5, 40.5],
      "address": "123 Event St, City, Country"
    },
    "date": "2023-12-31T18:00:00Z",
    "endDate": "2023-12-31T22:00:00Z",
    "categories": ["music", "festival"],
    "organizer": "user_id",
    "maxAttendees": 100,
    "image": "http://example.com/image.jpg",
    "status": "active",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

#### Get all events

```
GET /events
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Text search term
- `category` (optional): Filter by category
- `startDate` (optional): Filter events starting from this date (ISO format)
- `endDate` (optional): Filter events ending at this date (ISO format)

**Response:**
```json
{
  "events": [
    {
      "_id": "event_id",
      "title": "Sample Event",
      "description": "This is a sample event",
      "location": {
        "type": "Point",
        "coordinates": [10.5, 40.5],
        "address": "123 Event St, City, Country"
      },
      "date": "2023-12-31T18:00:00Z",
      "categories": ["music", "festival"],
      "organizer": {
        "_id": "user_id",
        "name": "Example User",
        "username": "example"
      },
      "status": "active"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 50
}
```

#### Get event by ID

```
GET /events/:id
```

**Response:**
```json
{
  "_id": "event_id",
  "title": "Sample Event",
  "description": "This is a sample event",
  "location": {
    "type": "Point",
    "coordinates": [10.5, 40.5],
    "address": "123 Event St, City, Country"
  },
  "date": "2023-12-31T18:00:00Z",
  "endDate": "2023-12-31T22:00:00Z",
  "categories": ["music", "festival"],
  "organizer": {
    "_id": "user_id",
    "name": "Example User",
    "username": "example"
  },
  "attendees": [],
  "maxAttendees": 100,
  "image": "http://example.com/image.jpg",
  "status": "active",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### Update event

```
PUT /events/:id
```

**Request Body:**
```json
{
  "title": "Updated Event",
  "description": "This is an updated event",
  "categories": ["music", "arts", "festival"]
}
```

**Response:**
```json
{
  "message": "Event updated successfully",
  "event": {
    "_id": "event_id",
    "title": "Updated Event",
    "description": "This is an updated event",
    "location": {
      "type": "Point",
      "coordinates": [10.5, 40.5],
      "address": "123 Event St, City, Country"
    },
    "date": "2023-12-31T18:00:00Z",
    "categories": ["music", "arts", "festival"],
    "organizer": "user_id",
    "status": "active",
    "updatedAt": "timestamp"
  }
}
```

#### Delete event

```
DELETE /events/:id
```

**Response:**
```json
{
  "message": "Event deleted successfully"
}
```

#### Search events by location

```
GET /events/search/location
```

**Query Parameters:**
- `longitude` (required): Longitude of the search center
- `latitude` (required): Latitude of the search center
- `radius` (optional): Search radius in kilometers (default: 10)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category

**Response:**
```json
{
  "events": [
    {
      "_id": "event_id",
      "title": "Nearby Event",
      "description": "This is a nearby event",
      "location": {
        "type": "Point",
        "coordinates": [10.51, 40.51],
        "address": "456 Nearby St, City, Country"
      },
      "date": "2023-11-15T19:00:00Z",
      "categories": ["music"],
      "organizer": {
        "_id": "user_id",
        "name": "Example User",
        "username": "example"
      },
      "status": "active"
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "total": 1
}
```

### Notifications

#### Queue notification for an event

```
POST /notifications/events/:eventId
```

**Query Parameters:**
- `delay` (optional): Delay in minutes before sending notification

**Response:**
```json
{
  "message": "Notification queued successfully",
  "notificationData": {
    "eventId": "event_id",
    "title": "Sample Event",
    "description": "This is a sample event",
    "location": {
      "coordinates": [10.5, 40.5],
      "address": "123 Event St, City, Country"
    },
    "date": "2023-12-31T18:00:00Z",
    "organizer": "Example User",
    "recipients": [
      {
        "userId": "user_id",
        "preferredLanguage": "en"
      }
    ],
    "createdAt": "timestamp",
    "scheduledFor": "timestamp"
  }
}
```

#### Queue notifications for all upcoming events

```
POST /notifications/upcoming
```

**Query Parameters:**
- `daysAhead` (optional): Number of days ahead to look for events (default: 1)

**Response:**
```json
{
  "message": "Queued 5 notifications for upcoming events",
  "count": 5
}
```

## Error Responses

**Authentication Error:**
```json
{
  "message": "Authentication required"
}
```

**Validation Error:**
```json
{
  "errors": [
    {
      "value": "",
      "msg": "Username is required",
      "param": "username",
      "location": "body"
    }
  ]
}
```

**Not Found Error:**
```json
{
  "message": "Event not found"
}
```

**Authorization Error:**
```json
{
  "message": "Not authorized to update this event"
}
```

**Server Error:**
```json
{
  "message": "Internal server error"
}
```
```

## Step 8: Create a README.md Update

Now, let's update the README.md file to include instructions for running tests and other relevant information:

```markdown
# Event Locator App - Backend

A multi-user event locator application backend built with Node.js, Express, and MongoDB. This application allows users to discover events based on location and preferences.

## Features

- User management with secure authentication
- Event creation and management
- Location-based event search
- Category filtering
- Multilingual support (i18n)
- Notification system for upcoming events

## Tech Stack

- Node.js & Express.js
- MongoDB with Mongoose ODM (geospatial queries)
- Redis for message queuing and notifications
- JWT for authentication
- i18next for internationalization
- Jest for testing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis (optional, for notifications)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/event-locator-app-backend.git
   cd event-locator-app-backend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`
   ```bash
   cp .env.example .env
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

5. Start the notification worker (optional, requires Redis)
   ```bash
   npm run worker
   ```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate test coverage report:
```bash
npm run test:coverage
```

## API Documentation

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for detailed information about all available endpoints.

## Project Structure

```
event-locator-app-backend/
├── src/                  # Source code directory
│   ├── app.js            # Express application setup
│   ├── server.js         # Server entry point
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── locales/          # Internationalization files
│   └── workers/          # Background workers (e.g., notification worker)
└── tests/                # Test files
    ├── unit/             # Unit tests
    └── integration/      # Integration tests
```

## Key Features Implementation

### User Authentication

- Secure user registration and login with JWT tokens
- Password hashing with bcrypt
- User profile management

### Event Management

- CRUD operations for events
- Geospatial indexing for location-based queries
- Category and text search functionality

### Multilingual Support

- Internationalization for English and French
- User language preference

### Notification System

- Redis-based message queue for notifications
- Scheduled notifications for upcoming events
- Language-specific notifications based on user preferences

## License

This project is licensed under the ISC License
```