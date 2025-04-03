# Event Locator App - Backend

A multi-user event locator application backend built with Node.js, Express, and MongoDB. This application allows users to discover events based on location and preferences, featuring geospatial search capabilities, multilingual support, and a notification system.

## Features

- **User Management**: Secure user registration and login with password hashing (bcrypt). Users can set their location and preferred event categories.
- **Event Management**: Complete CRUD operations for events, including details, location (latitude/longitude), date/time, and categories.
- **Location-Based Search**: Find events within a specified radius of any location using geospatial queries.
- **Category Filtering**: Filter events based on interests or categories.
- **Multilingual Support (i18n)**: The application supports both English and French languages for all responses.
- **Notification System**: Redis-based message queue to send notifications about upcoming events that match users' preferences.
- **Comprehensive Testing**: Unit and integration tests covering all core functionalities.

## Tech Stack

- **Backend Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM (utilizing geospatial indexes)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcrypt for password hashing
- **Message Queue**: Redis for notification system
- **Internationalization**: i18next for multilingual support
- **Testing**: Jest for unit and integration tests
- **Validation**: express-validator for input validation

## Database Schema

The application uses MongoDB with the following main data models:

- **User**: Stores user information, authentication details, preferences, and location
- **Event**: Stores event details including geospatial data and category information
- **Additional indexes**: Geospatial indexes for location-based queries and text indexes for search functionality

Detailed schema documentation can be found in [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Redis (for notifications system)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/bvilane/event-locator-app-backend.git
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
   Then update the environment variables with your values.

4. Start MongoDB and Redis servers

5. Start the development server
   ```bash
   npm run dev
   ```

6. Start the notification worker (in a separate terminal)
   ```bash
   npm run worker
   ```

## API Endpoints

The API provides the following main endpoints:

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get JWT token

### User Profile
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile

### Events
- `POST /api/events` - Create a new event
- `GET /api/events` - Get all events (with filtering and pagination)
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/search/location` - Search events by location

### Notifications
- `POST /api/notifications/events/:eventId` - Queue notification for an event
- `POST /api/notifications/upcoming` - Queue notifications for all upcoming events

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Code Structure

```
event-locator-app-backend/
├── src/                  # Source code
│   ├── app.js            # Express app setup
│   ├── server.js         # Server entry point
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── locales/          # i18n translations
│   └── workers/          # Background workers
└── tests/                # Tests
    ├── unit/             # Unit tests
    └── integration/      # Integration tests
```

## Implementation Details

### Geospatial Search
The application uses MongoDB's geospatial indexes and queries to efficiently find events within a specific radius of a given location.

### Internationalization
User interface messages are available in both English and French, controlled by the user's preference or the Accept-Language header.

### Notification System
The application uses Redis for a message queue system that handles notifications for upcoming events. It can send notifications about events that match a user's location and preferences.

## Future Improvements

- Implement event ratings and reviews
- Add a feature for users to save favorite events
- Integrate with a mapping service (e.g., Google Maps API) for visual display
- Add real-time updates for event changes

## License

MIT

## Author

Bavukile Birthwell Vilane - b.vilane@alustudent.com - https://github.com/bvilane