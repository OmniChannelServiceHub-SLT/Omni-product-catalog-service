"use strict";

const mongoose = require("mongoose");
const { randomUUID } = require("node:crypto");

// Voice-service inventory subset. This is not the complete TMF638 schema.
const serviceSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => randomUUID(), unique: true, required: true },
    "@type": { type: String, enum: ["Service"], default: "Service" },
    name: String,
    description: String,
    serviceType: String,
    state: {
      type: String,
      enum: [
        "feasibilityChecked", "designed", "reserved",
        "inactive", "active", "terminated", "suspended",
      ],
    },
    serviceCharacteristic: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Trusted provisioning data; never accepted from PATCH or serialized.
    binding: {
      type: new mongoose.Schema(
        {
          environment: { type: String, enum: ["mock", "legacy"], required: true },
          telephoneNo: { type: String, required: true, match: /^\d{9,15}$/ },
          ownerSubject: { type: String, required: true },
        },
        { _id: false },
      ),
      required: true,
      select: false,
    },

    // Durable submission gate. Do not clear this automatically on timeouts.
    forwardingRequest: {
      type: new mongoose.Schema(
        {
          fingerprint: { type: String, required: true },
          desiredEnabled: { type: Boolean, required: true },
          desiredNumber: { type: String, required: true },
          status: {
            type: String,
            enum: ["sending", "accepted", "unknown"],
            required: true,
          },
          requestedAt: { type: Date, required: true },
        },
        { _id: false },
      ),
      default: undefined,
      select: false,
    },
  },
  { timestamps: true, collection: "tmf638_services" },
);

module.exports =
  mongoose.models.TMF638_Service ||
  mongoose.model("TMF638_Service", serviceSchema);
