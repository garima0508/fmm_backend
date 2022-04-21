const app = require("./app");

const dotenv = require("dotenv");
const connectDatabase = require("./config/database");

// config
dotenv.config({ path: "backend/config/config.env" });

// Connecting to database
connectDatabase();
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

// Unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to unhandled promise rejection`);

  server.close(() => {
    process.exit(1);
  });
});
