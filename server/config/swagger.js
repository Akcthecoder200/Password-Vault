import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Password Vault API",
      version: "1.0.0",
      description: "API documentation for Password Vault application",
      contact: {
        name: "Developer",
      },
    },
    servers: [
      {
        url: "http://localhost:4000",
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
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "60d21b4667d0d8992e610c85",
            },
            email: {
              type: "string",
              example: "user@example.com",
            },
            encSalt: {
              type: "string",
              example: "a1b2c3d4e5f6g7h8",
            },
          },
        },
        VaultItem: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "60d21b4667d0d8992e610c85",
            },
            userId: {
              type: "string",
              example: "60d21b4667d0d8992e610c85",
            },
            ciphertext: {
              type: "string",
              example: "encrypted-data",
            },
            nonce: {
              type: "string",
              example: "encryption-nonce",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Error message",
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js", "./models/*.js", "./index.js"],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Setup swagger middleware
const setupSwagger = (app) => {
  // Swagger page
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log("Swagger documentation available at /api-docs");
};

export default setupSwagger;
