const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  agentId: {
    type: String,
    required: true,
    unique: true
  },
  persona: {
    name: { type: String, required: true },
    domain: { type: String, required: true }
  },
  nextPublishAt: {
    type: Date,
    default: () => new Date()
  },
  createdAt: {
    type: Date,
    default: () => new Date()
  }
});

module.exports = mongoose.model('Agent', agentSchema);