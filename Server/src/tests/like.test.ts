import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import User from "../models/user.model";
import Post from "../models/post.model";
import Like from "../models/like.model";

const testDbUri =
    process.env.TEST_DB_CONNECTION ||
    "mongodb://localhost:27017/web-final-project-test";

const testUser = {
    email: "test_like@example.com",
    username: "testuser_like",
    password: "Test123!@#",
};

let accessToken: string;
let userId: string;
let postId: string;

beforeAll(async () => {
    await mongoose.connect(testDbUri);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Like.deleteMany({});

    const res = await request(app).post("/api/auth/register").send(testUser);
    accessToken = res.body.accessToken;
    userId = res.body.user._id;

    const post = await Post.create({
        title: "Test Post for Likes",
        content: "Content",
        owner: userId,
    });
    postId = post._id.toString();
});

describe("Like Routes", () => {
    describe("POST /api/likes/:postId", () => {
        it("should toggle like on a post (like)", async () => {
            const res = await request(app)
                .post(`/api/likes/${postId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.liked).toBe(true);
            expect(res.body.likesCount).toBe(1);

            const post = await Post.findById(postId);
            expect(post?.likesCount).toBe(1);
        });

        it("should toggle like on a post (unlike)", async () => {
            await request(app)
                .post(`/api/likes/${postId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            const res = await request(app)
                .post(`/api/likes/${postId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.liked).toBe(false);
            expect(res.body.likesCount).toBe(0);

            const post = await Post.findById(postId);
            expect(post?.likesCount).toBe(0);
        });

        it("should return 404 if post is not found", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post(`/api/likes/${fakeId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.status).toBe(404);
        });
    });

    describe("GET /api/likes/:postId/status", () => {
        it("should return false if post is not liked", async () => {
            const res = await request(app)
                .get(`/api/likes/${postId}/status`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.liked).toBe(false);
        });

        it("should return true if post is liked", async () => {
            await Like.create({ postId, userId });

            const res = await request(app)
                .get(`/api/likes/${postId}/status`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.liked).toBe(true);
        });
    });
});
