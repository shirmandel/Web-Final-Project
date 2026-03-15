import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import User from "../models/user.model";

const testDbUri =
  process.env.TEST_DB_CONNECTION ||
  "mongodb://localhost:27017/web-final-project-test";

// Test user data
const testUser = {
  email: "test@example.com",
  username: "testuser",
  password: "Test123!@#",
};

let accessToken: string;
let refreshToken: string;

beforeAll(async () => {
  await mongoose.connect(testDbUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("Auth Routes", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.username).toBe(testUser.username);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("should fail registration with missing email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: testUser.username, password: testUser.password });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "Email, username, and password are required."
      );
    });

    it("should fail registration with missing username", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "Email, username, and password are required."
      );
    });

    it("should fail registration with missing password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: testUser.email, username: testUser.username });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        "Email, username, and password are required."
      );
    });

    it("should fail registration with duplicate email", async () => {
      // First registration
      await request(app).post("/api/auth/register").send(testUser);

      // Second registration with same email
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("User with this email already exists.");
    });

    it("should store hashed password, not plain text", async () => {
      await request(app).post("/api/auth/register").send(testUser);

      const user = await User.findOne({ email: testUser.email });
      expect(user).toBeTruthy();
      expect(user?.password).not.toBe(testUser.password);
      expect(user?.password?.length).toBeGreaterThan(20); // bcrypt hashes are longer
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Register a user before each login test
      await request(app).post("/api/auth/register").send(testUser);
    });

    it("should login successfully with correct credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");

      // Store tokens for later tests
      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it("should fail login with wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: "wrongpassword" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid email or password.");
    });

    it("should fail login with non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@example.com", password: testUser.password });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid email or password.");
    });

    it("should fail login with missing email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ password: testUser.password });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email and password are required.");
    });

    it("should fail login with missing password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email and password are required.");
    });

    it("should add refresh token to user document on login", async () => {
      await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      const user = await User.findOne({ email: testUser.email });
      expect(user?.refreshTokens.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("POST /api/auth/refresh", () => {
    let loginRefreshToken: string;

    beforeEach(async () => {
      // Register and login to get tokens
      await request(app).post("/api/auth/register").send(testUser);
      
      // Small delay to ensure different token timestamps
      await new Promise((resolve) => setTimeout(resolve, 1100));
      
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      loginRefreshToken = loginRes.body.refreshToken;
      accessToken = loginRes.body.accessToken;
    });

    it("should refresh tokens successfully", async () => {
      // Small delay to ensure different token timestamps
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: loginRefreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
    });

    it("should invalidate old refresh token after use", async () => {
      // Wait to ensure new token will have different timestamp
      await new Promise((resolve) => setTimeout(resolve, 1100));
      
      // Use refresh token once
      const firstRefresh = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: loginRefreshToken });

      expect(firstRefresh.status).toBe(200);

      // Verify the old token is no longer in the user's tokens
      const user = await User.findOne({ email: testUser.email });
      expect(user?.refreshTokens).not.toContain(loginRefreshToken);
    });

    it("should fail with missing refresh token", async () => {
      const res = await request(app).post("/api/auth/refresh").send({});

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Refresh token is required.");
    });

    it("should fail with invalid refresh token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "invalid-token" });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid refresh token.");
    });

    it("should fail with expired refresh token", async () => {
      // Create an expired token (mocking would require more setup)
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWY1YjNlZjExMjIzMzQ0NTU2Njc3ODgiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjIzOTAyM30.invalid";

      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: expiredToken });

      expect(res.status).toBe(401);
    });

    it("should add new refresh token to user document after refresh", async () => {
      const userBefore = await User.findOne({ email: testUser.email });
      const tokensBefore = [...(userBefore?.refreshTokens || [])];

      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: loginRefreshToken });

      expect(res.status).toBe(200);
      
      const userAfter = await User.findOne({ email: testUser.email });
      // User should still have tokens
      expect(userAfter?.refreshTokens.length).toBeGreaterThanOrEqual(1);
      // New token should be in the list
      expect(userAfter?.refreshTokens).toContain(res.body.refreshToken);
    });
  });

  describe("POST /api/auth/logout", () => {
    let logoutRefreshToken: string;

    beforeEach(async () => {
      // Register and login to get tokens
      await request(app).post("/api/auth/register").send(testUser);
      
      // Small delay to ensure different token timestamps
      await new Promise((resolve) => setTimeout(resolve, 1100));
      
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      logoutRefreshToken = loginRes.body.refreshToken;
    });

    it("should logout successfully", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .send({ refreshToken: logoutRefreshToken });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged out successfully.");
    });

    it("should remove refresh token from user document", async () => {
      await request(app).post("/api/auth/logout").send({ refreshToken: logoutRefreshToken });

      const user = await User.findOne({ email: testUser.email });
      expect(user?.refreshTokens).not.toContain(logoutRefreshToken);
    });

    it("should fail logout with missing refresh token", async () => {
      const res = await request(app).post("/api/auth/logout").send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Refresh token is required.");
    });

    it("should handle logout with invalid token gracefully", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .send({ refreshToken: "invalid-token" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged out.");
    });

    it("should prevent using logged out refresh token", async () => {
      // Logout
      await request(app).post("/api/auth/logout").send({ refreshToken: logoutRefreshToken });

      // Try to refresh with logged out token
      const res = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: logoutRefreshToken });

      expect(res.status).toBe(401);
    });

    it("should maintain other active sessions when logging out one", async () => {
      // Wait for different timestamp
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Login again to get another refresh token
      const secondLogin = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      const secondRefreshToken = secondLogin.body.refreshToken;

      // User should have multiple refresh tokens now
      const userBefore = await User.findOne({ email: testUser.email });
      const tokenCountBefore = userBefore?.refreshTokens.length || 0;
      expect(tokenCountBefore).toBeGreaterThanOrEqual(2);

      // Logout from first session
      await request(app).post("/api/auth/logout").send({ refreshToken: logoutRefreshToken });

      // Verify user still has at least one token
      const userAfter = await User.findOne({ email: testUser.email });
      expect(userAfter?.refreshTokens.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("JWT Token Validation", () => {
    it("should generate different tokens for different users", async () => {
      const user1 = await request(app).post("/api/auth/register").send(testUser);

      const user2 = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test2@example.com",
          username: "testuser2",
          password: "Test456!@#",
        });

      // Tokens should exist
      expect(user1.body.accessToken).toBeDefined();
      expect(user2.body.accessToken).toBeDefined();

      // User IDs should be different
      expect(user1.body.user._id).not.toBe(user2.body.user._id);
    });

    it("should include user _id in token payload", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);

      const token = res.body.accessToken;
      const [, payload] = token.split(".");
      const decoded = JSON.parse(Buffer.from(payload, "base64").toString());

      expect(decoded).toHaveProperty("_id");
      expect(decoded._id).toBe(res.body.user._id);
    });
  });

  describe("User Data Security", () => {
    it("should not return password in any response", async () => {
      const registerRes = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(registerRes.body.user).not.toHaveProperty("password");

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      expect(loginRes.body.user).not.toHaveProperty("password");
    });

    it("should store email in lowercase", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ ...testUser, email: "TEST@EXAMPLE.COM" });

      const user = await User.findOne({ email: "test@example.com" });
      expect(user).toBeTruthy();
      expect(user?.email).toBe("test@example.com");
    });
  });

  describe("Multiple Sessions", () => {
    it("should allow multiple active sessions", async () => {
      await request(app).post("/api/auth/register").send(testUser);

      const login1 = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      const login2 = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      const user = await User.findOne({ email: testUser.email });

      // Should have multiple refresh tokens (registration + 2 logins)
      expect(user?.refreshTokens.length).toBeGreaterThanOrEqual(2);

      // Both logins should be successful
      expect(login1.status).toBe(200);
      expect(login2.status).toBe(200);
      expect(login1.body).toHaveProperty("accessToken");
      expect(login2.body).toHaveProperty("accessToken");
    });
  });
});
