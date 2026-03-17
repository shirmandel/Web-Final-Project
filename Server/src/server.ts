import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import http from "http";
import https from "https";

import app from "./app";
import mongoose from "mongoose";

const PORT = process.env.PORT || 3000;
const DB_CONNECTION =
  process.env.DB_CONNECTION || "mongodb://localhost:27017/web-final-project";

mongoose
  .connect(DB_CONNECTION)
  .then(() => {
    console.log("Connected to MongoDB");

    if (process.env.NODE_ENV !== "production") {
      http.createServer(app).listen(PORT, () => {
        console.log("Development server running on port", PORT);
      });
    } else {
      const certOptions = {
        key: fs.readFileSync("./client-key.pem"),
        cert: fs.readFileSync("./client-cert.pem"),
      };
      https
        .createServer(certOptions, app)
        .listen(process.env.HTTPS_PORT, () => {
          console.log(
            "Production server running on port",
            process.env.HTTPS_PORT,
          );
        });
    }
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
