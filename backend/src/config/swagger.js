const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: process.env.SHOP_NAME || "Multi-Vendor E-Commerce API",
      version: "1.0.0",
      description:
        "REST API for a large-scale multi-vendor e-commerce platform (MERN Stack). " +
        "Authentication uses JWT access tokens (Bearer) and HTTP-only refresh token cookies.",
      contact: {
        name: "Abdur Rahman Fahim",
        email: "ar.fahim.dev@gmail.com",
      },
    },
    security: [
      { bearerAuth: [] },
    ],
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Access token obtained from /auth/login or /auth/refresh-token",
        },
      },
      schemas: {
        // ── Shared success/error wrappers ──────────────────────────────
        SuccessMessage: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },

        // ── Auth ───────────────────────────────────────────────────────
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", minLength: 2, maxLength: 50, example: "John Doe" },
            email: { type: "string", format: "email", example: "john@example.com" },
            password: {
              type: "string",
              minLength: 8,
              description: "Min 8 chars, must include uppercase, lowercase, number and special character",
              example: "Secret@123",
            },
            phone: {
              type: "string",
              description: "Bangladeshi phone number (+8801XXXXXXXXX)",
              example: "+8801712345678",
            },
            role: {
              type: "string",
              enum: ["customer"],
              default: "customer",
              description: "Only 'customer' is accepted here. Use /register-vendor for vendor accounts.",
            },
          },
        },
        RegisterResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Registration Successful, Please Login!" },
            user: { $ref: "#/components/schemas/UserPublic" },
          },
        },

        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "john@example.com" },
            password: { type: "string", example: "Secret@123" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Login Successful!" },
            accessToken: {
              type: "string",
              description: "Short-lived JWT — use this as Bearer token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            user: { $ref: "#/components/schemas/UserPublic" },
          },
        },

        RefreshTokenResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            accessToken: {
              type: "string",
              description: "New short-lived JWT access token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },

        // ── User ───────────────────────────────────────────────────────
        UserPublic: {
          type: "object",
          properties: {
            id: { type: "string", example: "664f1a2b3c4d5e6f7a8b9c0d" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", format: "email", example: "john@example.com" },
            role: { type: "string", enum: ["customer", "vendor", "admin"] },
            isEmailVerified: { type: "boolean", example: false },
          },
        },
        UserListItem: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            role: { type: "string", enum: ["customer", "vendor", "admin"] },
            status: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        // ── Vendor ─────────────────────────────────────────────────────
        BankInfo: {
          type: "object",
          properties: {
            bankName: { type: "string", example: "Dutch-Bangla Bank" },
            branchName: { type: "string", example: "Gulshan Branch" },
            accountHolder: { type: "string", example: "John Doe" },
            accountNumber: { type: "string", example: "1234567890" },
            routingNumber: { type: "string", example: "090261234" },
          },
        },
        VendorRegistrationRequest: {
          type: "object",
          required: ["name", "email", "password", "shopName", "shopDescription", "shopAddress", "nidNumber", "bankInfo"],
          properties: {
            name: { type: "string", minLength: 2, maxLength: 50, example: "Jane Smith" },
            email: { type: "string", format: "email", example: "jane@shop.com" },
            password: {
              type: "string",
              minLength: 8,
              description: "Min 8 chars, must include uppercase, lowercase, number and special character",
              example: "Vendor@456",
            },
            phone: { type: "string", example: "+8801812345678" },
            shopName: { type: "string", minLength: 3, maxLength: 100, example: "Jane's Boutique" },
            shopDescription: { type: "string", maxLength: 1000, example: "Trendy fashion for everyone." },
            shopAddress: { type: "string", maxLength: 200, example: "123 Market Street, Dhaka" },
            nidNumber: {
              type: "string",
              pattern: "^\\d{17}$",
              description: "17-digit Bangladeshi NID number",
              example: "12345678901234567",
            },
            bankInfo: { $ref: "#/components/schemas/BankInfo" },
          },
        },
        VendorRegistrationResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: {
              type: "string",
              example: "Vendor registration successful! Your account is pending for approval.",
            },
            user: { $ref: "#/components/schemas/VendorPublic" },
          },
        },
        VendorPublic: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            role: { type: "string", example: "vendor" },
            shopName: { type: "string" },
            shopDescription: { type: "string" },
            shopAddress: { type: "string" },
            nidNumber: { type: "string" },
            bankInfo: { $ref: "#/components/schemas/BankInfo" },
            status: { type: "string", enum: ["pending", "approved", "rejected", "suspended"], example: "pending" },
          },
        },
        VendorListItem: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            shopName: { type: "string" },
            shopAddress: { type: "string" },
            nidNumber: { type: "string" },
            status: { type: "string", enum: ["pending", "approved", "rejected", "suspended"] },
            approvedAt: { type: "string", format: "date-time", nullable: true },
            rejectReason: { type: "string", nullable: true },
            rejectedAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        RejectVendorRequest: {
          type: "object",
          required: ["reason"],
          properties: {
            reason: {
              type: "string",
              description: "Reason for rejecting the vendor application",
              example: "Incomplete or invalid NID document provided.",
            },
          },
        },

        // ── Admin Stats ────────────────────────────────────────────────
        AdminStats: {
          type: "object",
          properties: {
            overview: {
              type: "object",
              properties: {
                totalUsers: { type: "integer", example: 120 },
                totalCustomers: { type: "integer", example: 95 },
                totalVendors: { type: "integer", example: 25 },
              },
            },
            vendorStats: {
              type: "object",
              properties: {
                approved: { type: "integer", example: 18 },
                pending: { type: "integer", example: 4 },
                rejected: { type: "integer", example: 2 },
                suspended: { type: "integer", example: 1 },
              },
            },
            newRegistrationsToday: { type: "integer", example: 3 },
            timeStamp: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const specs = swaggerJsDoc(options);

module.exports = specs;
