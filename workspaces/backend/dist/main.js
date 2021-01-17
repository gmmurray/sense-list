"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const helmet = require("helmet");
const cors = require("cors");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(helmet());
    app.use(cors());
    await app.listen(process.env.API_PORT);
}
bootstrap();
//# sourceMappingURL=main.js.map