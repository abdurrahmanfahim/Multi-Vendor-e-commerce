const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minLength: 2,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: 8,
      select: false, // This query will not return the 'password' field
    },

    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now(),
        },
        expiresAt: {
          type: Date
        }
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true },
);

// Password Hash
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

});

// Compare Password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
