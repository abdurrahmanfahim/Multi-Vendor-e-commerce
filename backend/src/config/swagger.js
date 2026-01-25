const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: `${process.env.SHOP_NAME}`,
      version: "1.0.0",
      description: "API for large scale multi-vendor e-commerce [MERN Stack]",
      contact: {
        name: "Abdur Rahman Fahim",
        email: "ar.fahim.dev@gmail.com",
      },
      server: [
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
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const specs = swaggerJsDoc(options);

module.exports = specs;
