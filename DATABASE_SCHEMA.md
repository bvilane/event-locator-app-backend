# Database Schema Documentation

## Overview

This document describes the database schema used in the Event Locator App. The application uses MongoDB with Mongoose as an ODM (Object Document Mapper) and implements geospatial indexing for location-based queries.

## Models

### User Model

The User model stores user information, authentication details, preferences, and location.

```javascript
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    preferredCategories: {
      type: [String],
      default: [],
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'fr'],
      default: 'en',
    },
  },
  { timestamps: true }
);

// Geospatial index for location-based queries
userSchema.index({ location: '2dsphere' });
```

### Event Model

The Event model stores event information including details, location, categories, and relationships to users.

```javascript
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        type: String,
        required: true,
        trim: true,
      },
    },
    date: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: false,
    },
    categories: {
      type: [String],
      required: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attendees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    maxAttendees: {
      type: Number,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Geospatial index for location-based queries
eventSchema.index({ 'location.coordinates': '2dsphere' });

// Text index for text search functionality
eventSchema.index({ title: 'text', description: 'text' });
```

## Indexes

### Geospatial Indexes

The application uses MongoDB's geospatial indexes (`2dsphere`) on location fields in both the User and Event models. This enables efficient location-based queries using operators like `$geoWithin` and `$centerSphere`.

### Text Indexes

The Event model includes a text index on the title and description fields, enabling text search functionality for finding events by keywords.

## Relationships

- **User to Event (Organizer)**: One-to-many relationship. A user can organize many events, but each event has only one organizer.
- **User to Event (Attendees)**: Many-to-many relationship. Users can attend multiple events, and events can have multiple attendees.

## Schema Normalization

The database schema follows normalization best practices:

1. **First Normal Form (1NF)**: All attributes contain atomic values
2. **Second Normal Form (2NF)**: All non-key attributes are fully functionally dependent on the primary key
3. **Third Normal Form (3NF)**: No transitive dependencies

## Data Validation

Validation is implemented at the schema level with:
- Required fields
- Data type constraints
- Enum validations for specific fields
- Custom validation logic for complex requirements

## Security Considerations

- Passwords are hashed using bcrypt before storage
- JWT tokens are used for authentication
- MongoDB's ObjectID is used for document references, ensuring unique identifiers
