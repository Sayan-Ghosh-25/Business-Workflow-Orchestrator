"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
// src/services/storageService.ts
const supabase_js_1 = require("@supabase/supabase-js");
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const BUCKET = process.env.SUPABASE_BUCKET;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !BUCKET) {
    throw new Error("Supabase env vars not set");
}
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
async function uploadFile(buffer, destPath, contentType = "application/pdf") {
    const { data, error } = await supabase.storage.from(BUCKET).upload(destPath, buffer, {
        contentType,
        upsert: false
    });
    if (error)
        throw error;
    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(destPath);
    return { data, publicUrl: publicData.publicUrl };
}
//# sourceMappingURL=storageService.js.map