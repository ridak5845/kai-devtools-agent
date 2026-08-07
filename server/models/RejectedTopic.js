const mongoose = require('mongoose');

const rejectedTopicSchema = new mongoose.Schema({
  agentId: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
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

module.exports = mongoose.model('RejectedTopic', rejectedTopicSchema);