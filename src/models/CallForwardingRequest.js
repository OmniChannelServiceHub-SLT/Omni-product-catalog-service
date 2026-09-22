const mongoose = require('mongoose');

// This is a submitted request, not an activated TMF638 Service resource.
// Keep it separate from inventory until an actual provisioning integration exists.
const callForwardingRequestSchema = new mongoose.Schema(
  {
    telephoneNo: { type: String, required: true },
    mobileNo: { type: String, required: true },
    requestType: { type: String, required: true, enum: ['Y'] },
    requestedBy: { type: String, required: true },
    requestStatus: {
      type: String,
      required: true,
      enum: ['acknowledged'],
      default: 'acknowledged',
    },
  },
  { timestamps: true, collection: 'call_forwarding_requests' }
);

module.exports = mongoose.model('CallForwardingRequest', callForwardingRequestSchema);
