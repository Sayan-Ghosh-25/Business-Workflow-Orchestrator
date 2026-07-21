"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = roleMiddleware;
function roleMiddleware(allowed = []) {
    return (req, res, next) => {
        const user = req.user;
        if (!user)
            return res.status(401).json({ error: "unauthorized" });
        const role = user.role;
        if (!allowed.length || allowed.includes(role))
            return next();
        return res.status(403).json({ error: "forbidden" });
    };
}
//# sourceMappingURL=roleMiddleware.js.map