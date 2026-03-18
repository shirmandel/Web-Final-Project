import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

jest.mock("../services/ai.service", () => ({
  generateTags: jest.fn().mockResolvedValue(["test", "mock"]),
}));
