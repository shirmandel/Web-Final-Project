import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import User from "../models/user.model";
import Post from "../models/post.model";

const testDbUri =
    process.env.TEST_DB_CONNECTION ||
    "mongodb://localhost:27017/web-final-project-test";

const testUser = {
    email: "test_post@example.com",
    username: "testuser_post",
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
    await Post.deleteMany({});

    const res = await request(app).post("/api/auth/register").send(testUser);
    accessToken = res.body.accessToken;
    userId = res.body.user._id;
});

describe("Post Routes", () => {
    describe("POST /api/posts", () => {
        it("should create a new post successfully", async () => {
            const res = await request(app)
                .post("/api/posts")
                .set("Authorization", `Bearer ${accessToken}`)
                .field("title", "Test Post")
                .field("content", "This is a test post.");

            expect(res.status).toBe(201);
            expect(res.body.title).toBe("Test Post");
            expect(res.body.content).toBe("This is a test post.");
            expect(res.body.owner._id).toBe(userId);
        });

        it("should fail to create a post without authentication", async () => {
            const res = await request(app)
                .post("/api/posts")
                .field("title", "Test Post")
                .field("content", "This is a test post.");

            expect(res.status).toBe(401);
        });

        it("should fail to create a post missing title or content", async () => {
            const res = await request(app)
                .post("/api/posts")
                .set("Authorization", `Bearer ${accessToken}`)
                .field("title", "Test Post");

            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Title and content are required.");
        });
    });

    describe("GET /api/posts", () => {
        beforeEach(async () => {
            await Post.create({
                title: "Post 1",
                content: "Content 1",
                owner: userId,
            });
            await Post.create({
                title: "Post 2",
                content: "Content 2",
                owner: userId,
            });
        });

        it("should get all posts with pagination", async () => {
            const res = await request(app).get("/api/posts");

            expect(res.status).toBe(200);
            expect(res.body.posts.length).toBe(2);
            expect(res.body.totalPosts).toBe(2);
        });
    });

    describe("GET /api/posts/:id", () => {
        let postId: string;

        beforeEach(async () => {
            const post = await Post.create({
                title: "Test Post",
                content: "Test Content",
                owner: userId,
            });
            postId = post._id.toString();
        });

        it("should get a single post by id", async () => {
            const res = await request(app).get(`/api/posts/${postId}`);

            expect(res.status).toBe(200);
            expect(res.body.title).toBe("Test Post");
        });

        it("should return 404 for non-existent post", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/api/posts/${fakeId}`);

            expect(res.status).toBe(404);
        });
    });

    describe("PUT /api/posts/:id", () => {
        let postId: string;

        beforeEach(async () => {
            const post = await Post.create({
                title: "Original Title",
                content: "Original Content",
                owner: userId,
            });
            postId = post._id.toString();
        });

        it("should update a post successfully", async () => {
            const res = await request(app)
                .put(`/api/posts/${postId}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .field("title", "Updated Title")
                .field("content", "Updated Content");

            expect(res.status).toBe(200);
            expect(res.body.title).toBe("Updated Title");
            expect(res.body.content).toBe("Updated Content");
        });

        it("should fail to update a post owned by someone else", async () => {
            const otherUser = {
                email: "other@example.com",
                username: "otheruser",
                password: "Test123!@#",
            };
            const otherUserRes = await request(app).post("/api/auth/register").send(otherUser);
            const otherAccessToken = otherUserRes.body.accessToken;

            const res = await request(app)
                .put(`/api/posts/${postId}`)
                .set("Authorization", `Bearer ${otherAccessToken}`)
                .field("title", "Updated Title")
                .field("content", "Updated Content");

            expect(res.status).toBe(403);
        });
    });

    describe("DELETE /api/posts/:id", () => {
        let postId: string;

        beforeEach(async () => {
            const post = await Post.create({
                title: "To be deleted",
                content: "Will be deleted",
                owner: userId,
            });
            postId = post._id.toString();
        });

        it("should delete a post successfully", async () => {
            const res = await request(app)
                .delete(`/api/posts/${postId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Post deleted successfully.");

            const checkPost = await Post.findById(postId);
            expect(checkPost).toBeNull();
        });
    });
});
