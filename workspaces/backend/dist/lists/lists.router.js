"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listsRouter = void 0;
const express_1 = require("express");
exports.listsRouter = express_1.default.Router();
exports.listsRouter.get('/', async (req, res) => {
    try {
        res.status(200).send();
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
//# sourceMappingURL=lists.router.js.map