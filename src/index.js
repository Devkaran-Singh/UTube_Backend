import dotenv from "dotenv/config";
import { app } from "./app.js";
import connectDB from "./database/index.js";

const PORT = process.env.PORT || 8001;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error");
  });
