const { z } = require("zod");

// Registration Schema
const registrationSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters!" })
    .max(50, { message: "Name is too long!" })
    .trim(),

  email: z.string().email({ message: "Invalid email!" }).toLowerCase().trim(),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters!" })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter!" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter!" })
    .regex(/[0-9]/, { message: "Must contain at least one number!" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Must contain at least one spacial character!",
    }),

  phone: z
    .string()
    .regex(/^\+?8801[3-9]\d{8}$/, {
      message: "Invalid Bangladeshi phone number!",
    })
    .optional(),

  role: z
    .enum(["customer", "vender"], { message: "Invalid role!" })
    .optional()
    .default("customer"),
});

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email!" }).toLowerCase().trim(),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters!" }),
});

// Vendor Validation Schema
const vendorValidationSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters!" })
    .max(50, { message: "Name is too long!" })
    .trim(),
  
  email: z.string().email({ message: "Invalid email!" }).toLowerCase().trim(),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters!" })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter!" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter!" })
    .regex(/[0-9]/, { message: "Must contain at least one number!" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Must contain at least one special character!",
    }),

  phone: z
    .string()
    .regex(/^\+?8801[3-9]\d{8}$/, {
      message: "Invalid Bangladeshi phone number!",
    })
    .optional(),

  // Vendor-specific fields
  shopName: z
    .string()
    .min(3, { message: "Shop name must be at least 3 characters!" })
    .max(100, { message: "Shop name is too long!" })
    .trim(),

  shopDescription: z
    .string()
    .max(1000, { message: "Shop description is too long!" })
    .trim(),

  shopAddress: z
    .string()
    .max(200, { message: "Shop address is too long!" })
    .trim(),

  nidNumber: z
    .string()
    .regex(/^\d{17}$/, { message: "Invalid NID number!" })
    .optional(),

  bankInfo: z.object({
    bankName: z.string().max(300, { message: "Bank name is too long!" }).trim(),
    branchName: z.string().max(100, { message: "Branch name is too long!" }).trim(),
    accountHolder: z.string().max(100, { message: "Account holder name is too long!" }).trim(),
    accountNumber: z.string().max(20, { message: "Account number is too long!" }).trim(),
    routingNumber: z.string().max(20, { message: "Routing number is too long!" }).trim(),
  }).optional(),
});

module.exports = { registrationSchema, loginSchema, vendorValidationSchema };
