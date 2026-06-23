const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tubulu API",
      version: "1.0.0",
      description: "API documentation for Tubulu application",
      contact: {
        name: "Tubulu Support",
        url: "https://support.tubulu.in/"
      }
    },
    servers: [
      { url: "http://localhost:3008/api/v1", description: "Local Development Server" },
      { url: "https://staging.tubulu.com/api/v1", description: "Staging Server" },
      { url: "https://api.tubulu.com/v1", description: "Production Server" }
    ],
    components: {
      securitySchemes: {
        BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
      }
    }
  },
  apis: ["./Routes/*.js"], // 👈 scan route files for JSDoc
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
