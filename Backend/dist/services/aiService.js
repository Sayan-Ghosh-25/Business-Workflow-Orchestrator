"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processFileByUrl = processFileByUrl;
// src/services/aiService.ts
const axios_1 = __importDefault(require("axios"));
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;
if (!AI_SERVICE_URL)
    throw new Error("AI_SERVICE_URL not set");
// Accept either a public file URL or Buffer path depending on usage
async function processFileByUrl(fileUrl) {
    const res = await axios_1.default.post(`${AI_SERVICE_URL}/process`, { file_url: fileUrl }, { timeout: 60000 });
    return res.data;
}
//# sourceMappingURL=aiService.js.map