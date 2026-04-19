"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const interview_controller_1 = require("../controllers/interview.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const webhookRouter = (0, express_1.Router)();
webhookRouter.post('/webhook', (0, express_1.raw)({ type: "application/json" }), interview_controller_1.vapiWebhook);
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.authMiddleware, interview_controller_1.getInterviews);
router.get("/:interviewId", auth_middleware_1.authMiddleware, interview_controller_1.getInterviewById);
router.post("/", auth_middleware_1.authMiddleware, interview_controller_1.createInterview);
router.post("/start/:interviewId", auth_middleware_1.authMiddleware, interview_controller_1.startInterview);
exports.default = {
    router,
    webhookRouter
};
