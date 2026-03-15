import request from "supertest";
import mongoose from "mongoose";
import app from "../app";
import User from "../models/user.model";
import Post from "../models/post.model";
import Comment from "../models/comment.model";

const testDbUri =
    process.env.TEST_DB_CONNECTION ||
    "mongodb://localhost:27017/web-final-project-test";

const testUser = {
    email: "test_comment@example.com",
    username: "testuser_comment",
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
    await Comment.deleteMany({});

    const res = await request(app).post("/api/auth/register").send(testUser);
    accessToken = res.body.accessToken;
    userId = res.body.user._id;

    const post = await Post.create({
        title: "Test Post for Comments",
        content: "Content",
        owner: userId,
    });
    postId = post._id.toString();
});

describe("Comment Routes", () => {
    describe("POST /api/comments", () => {
        it("should add a comment to a post", async () => {
            const res = await request(app)
                .post("/api/comments")
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ content: "Test Comment", postId });

            expect(res.status).toBe(201);
            expect(res.body.content).toBe("Test Comment");
            expect(res.body.postId).toBe(postId);
            expect(res.body.owner._id).toBe(userId);

            const post = await Post.findById(postId);
            expect(post?.commentsCount).toBe(1);
        });

        it("should fail if content or postId is missing", async () => {
            const res = await request(app)
                .post("/api/comments")
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ content: "Test Comment" });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Content and postId are required.");
        });

        it("should fail if post doesn't exist", async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post("/api/comments")
                .set("Authorization", `Bearer ${accessToken}`)
                .send({ content: "Test Comment", postId: fakeId });

            expect(res.status).toBe(404);
        });
    });

    describe("GET /api/comments/:postId", () => {
        beforeEach(async () => {
            await Comment.create({
                content: "Comment 1",
                postId,
                owner: userId,
            });
            await Comment.create({
                content: "Comment 2",
                postId,
                owner: userId,
            });
        });

        it("should get all comments for a post", async () => {
            const res = await request(app).get(`/api/comments/${postId}`).set("Authorization", `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
        });
    });

    describe("DELETE /api/comments/:id", () => {
        let commentId: string;

        beforeEach(async () => {
            const comment = await Comment.create({
                content: "To be deleted",
                postId,
                owner: userId,
            });
            commentId = comment._id.toString();

            await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
        });

        it("should delete a comment successfully", async () => {
            const res = await request(app)
                .delete(`/api/comments/${commentId}`)
                .set("Authorization", `Bearer ${accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Comment deleted successfully.");

            const postAfter = await Post.findById(postId);
            expect(postAfter?.commentsCount).toBe(0);
        });

        it("should fail to delete comment owned by someone else", async () => {
            const otherUser = {
                email: "otherc@example.com",
                username: "otheruserc",
                password: "Test123!@#",
            };
            const otherUserRes = await request(app).post("/api/auth/register").send(otherUser);
            const otherAccessToken = otherUserRes.body.accessToken;

            const res = await request(app)
                .delete(`/api/comments/${commentId}`)
                .set("Authorization", `Bearer ${otherAccessToken}`);

            expect(res.status).toBe(403);
        });
    });
});
