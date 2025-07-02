import { registerAs } from "@nestjs/config";
export default registerAs("app", () => ({
    env: process.env.APP_ENV,
    name: process.env.APP_NAME,
    url: process.env.APP_URL,
    port: process.env.DB_PORT,
    JWT_SECRET: process.env.JWT_SECRET,
}));
