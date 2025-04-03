const mongoose = require('mongoose');

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
        index: '2dsphere' // Add index directly on coordinates
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

// Create geospatial index on location.coordinates
eventSchema.index({ 'location.coordinates': '2dsphere' });

// Add text index for searching
eventSchema.index({ title: 'text', description: 'text' });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
