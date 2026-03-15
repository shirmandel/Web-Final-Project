import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import User from "../models/user.model";

const testDbUri =
  process.env.TEST_DB_CONNECTION ||
  "mongodb://localhost:27017/web-final-project-test";

const testUser = {
  email: "test_user@example.com",
  username: "testuser",
  password: "Test123!@#",
};

let accessToken: string;
let userId: string;

beforeAll(async () => {
  await mongoose.connect(testDbUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});

  const res = await request(app).post("/api/auth/register").send(testUser);
  accessToken = res.body.accessToken;
  userId = res.body.user._id;
});

describe("User Routes", () => {
  describe("GET /api/users/:id", () => {
    it("should get a user by id", async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(userId);
      expect(res.body.email).toBe(testUser.email);
      expect(res.body.username).toBe(testUser.username);
      expect(res.body.password).toBeUndefined();
      expect(res.body.refreshTokens).toBeUndefined();
    });

    it("should fail if user does not exist", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`/api/users/${fakeId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("User not found.");
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update own user profile", async () => {
      const payload = { username: "updated_user" };

      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(userId);
      expect(res.body.username).toBe(payload.username);

      const updatedUser = await User.findById(userId);
      expect(updatedUser?.username).toBe(payload.username);
    });

    it("should fail when trying to update another user's profile", async () => {
      const otherUser = {
        email: "other_user@example.com",
        username: "otheruser",
        password: "Test123!@#",
      };

      const otherRes = await request(app)
        .post("/api/auth/register")
        .send(otherUser);

      const otherUserId = otherRes.body.user._id;

      const res = await request(app)
        .put(`/api/users/${otherUserId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ username: "hacked_name" });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("You can only update your own profile.");
    });

    it("should fail without token", async () => {
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .send({ username: "no_auth_update" });

      expect(res.status).toBe(401);
    });
  });
});
