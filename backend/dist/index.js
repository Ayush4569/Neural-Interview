"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./env");
const db_1 = require("./database/db");
const interview_routes_1 = __importDefault(require("./routes/interview.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const apiError_1 = require("./utils/apiError");
const app = (0, express_1.default)();
(0, db_1.connectDB)()
    .then(() => {
    console.log("Database connected successfully");
})
    .catch((error) => {
    console.error(error.message || "Database connection failed");
    process.exit(1);
});
// Middleware to parse JSON
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use('/api/interview', interview_routes_1.default.webhookRouter);
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
// Basic route
app.get('/', (req, res) => {
    res.send('Neural Interview API is running!');
});
app.use("/api/user", user_routes_1.default);
app.use('/api/interview', interview_routes_1.default.router);
app.use(apiError_1.errorHandler);
// Start the server
app.listen(env_1.config.PORT, () => {
    console.log(`Server is running on http://localhost:${env_1.config.PORT}`);
});
