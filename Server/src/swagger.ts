import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Web Final Project API",
      version: "1.0.0",
      description:
        "REST API for a social media application with authentication, posts, comments, and likes.",
    },
    servers: [
      {
        url: "http://localhost:3000",
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
            _id: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            email: { type: "string", example: "user@example.com" },
            username: { type: "string", example: "johndoe" },
            profileImage: { type: "string", example: "/uploads/avatar.jpg" },
          },
        },
        Post: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            text: { type: "string", example: "My first post!" },
            image: { type: "string", example: "/uploads/photo.jpg" },
            owner: { $ref: "#/components/schemas/User" },
            likesCount: { type: "integer", example: 5 },
            commentsCount: { type: "integer", example: 3 },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-01T12:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-01T12:00:00.000Z",
            },
          },
        },
        Comment: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            content: { type: "string", example: "Great post!" },
            postId: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            owner: { $ref: "#/components/schemas/User" },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-01T12:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-06-01T12:00:00.000Z",
            },
          },
        },
        Like: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            postId: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
            userId: { type: "string", example: "665a1b2c3d4e5f6a7b8c9d0e" },
          },
        },
        Tokens: {
          type: "object",
          properties: {
            accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIs...",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            user: { $ref: "#/components/schemas/User" },
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Error message" },
          },
        },
        PaginatedPosts: {
          type: "object",
          properties: {
            posts: {
              type: "array",
              items: { $ref: "#/components/schemas/Post" },
            },
            currentPage: { type: "integer", example: 1 },
            totalPages: { type: "integer", example: 5 },
            totalPosts: { type: "integer", example: 50 },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
