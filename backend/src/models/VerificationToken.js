const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const verificationTokenSchema = new Schema({
  userId: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 3600 * 24,
  },
});

module.exports = mongoose.model("VerificationToken", verificationTokenSchema);
