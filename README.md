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
- MongoDB with Mongoose ODM
- PostgreSQL with PostGIS for geospatial data (optional)
- Redis for message queuing and notifications
- JWT for authentication
- i18next for internationalization
- Jest for testing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB or PostgreSQL
- Redis (optional, for notifications)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/bvilane/event-locator-app-backend.git
   cd event-locator-app-backend