// src/index.ts
import dotenv from "dotenv";
dotenv.config();

import app from "./app";

const port = process.env.BACKEND_PORT;

app.listen(port, () => {
  console.log(`Backend Is Live On - http://localhost:${port}`);
});
