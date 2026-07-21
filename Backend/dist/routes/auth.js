"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.ts
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post("/signup", authController_1.signup);
router.post("/login", authController_1.login);
router.get("/me", authMiddleware_1.authMiddleware, authController_1.me);
router.patch("/me", authMiddleware_1.authMiddleware, authController_1.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.js.map