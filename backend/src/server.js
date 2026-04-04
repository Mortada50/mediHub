import express from "express"
import { ENV } from "./config/env.js"
import { corsMiddleware } from "./config/cors.js";
const app = express();

app.use(express.json());

app.use(corsMiddleware);

app.get("/api/health", (req, res) => {
    res.status(200).json({success: true, message: "Hello mediHub"})
})



app.listen(ENV.PORT, () => {
    console.log(`Server start on port: ${ENV.PORT}`);
    
})