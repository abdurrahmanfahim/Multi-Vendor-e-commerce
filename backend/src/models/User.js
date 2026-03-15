const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");
const { maxLength } = require("zod");

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
          type: Date,
        },
      },
    ],

    shopName: {
      type: String,
      unique: true,
      sparse: true,
    },

    shopDescription: {
      type: String,
      trim: true,
      maxLength: 1000,
    },

    shopAddress: {
      type: String,
      trim: true,
    },

    shopLogo: {
      type: String,
    },

    nidNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    bankInfo: {
      bankName: String,
      branchName: String,
      accountHolder: String,
      accountNumber: String,
      routingNumber: String,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "customer",
    },

    approvedAt: {
      type: Date,
    },

    rejectReason: {
      type: String,
      trim: true,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

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
  next();
});

userSchema.pre("save", function (next) {
  if (this.isModified("role") && this.role === "vendor" && !this.approvedAt) {
    this.status = "pending";
  }

  if (this.role !== "vendor") {
    this.status = "customer";
    this.approvedAt = null;
    this.rejectReason = null;
    this.shopName = null;
    this.shopDescription = null;
    this.shopAddress = null;
    this.shopLogo = null;
    this.nidNumber = null;
    this.bankInfo = null;
  }
});

// Compare Password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
