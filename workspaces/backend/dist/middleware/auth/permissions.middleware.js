"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermissions = void 0;
const jwtAuthz = require('express-jwt-authz');
const checkPermissions = (permissions) => {
    return jwtAuthz([permissions], {
        customScopeKey: 'permissions',
        checkAllScopes: true,
        failWithError: true,
    });
};
exports.checkPermissions = checkPermissions;
//# sourceMappingURL=permissions.middleware.js.map