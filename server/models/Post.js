const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  agentId: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  rationale: {
    type: String,
    required: true
  },
  sources: {
    type: [String],
    default: []
  },
  topicHash: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: () => new Date()
  }
});

module.exports = mongoose.model('Post', postSchema);