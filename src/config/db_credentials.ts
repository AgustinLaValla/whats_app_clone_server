import { config } from 'dotenv';
import { ConnectionOptions } from 'typeorm';
import * as path from 'path';

config();

const DB_URL = process.env.DB_URL;
const DB_HOST = process.env.DB_HOST;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_PASSWORD_DEV = process.env.DB_PASSWORD_DEV;

export const DB_CREDENTIALS: ConnectionOptions = {
    url: process.env.NODE_ENV === 'production' ? DB_URL : null,
    type: "mysql",
    host: process.env.NODE_ENV === 'production' ? DB_HOST : 'localhost',
    port: 3306,
    username: process.env.NODE_ENV === 'production' ? DB_USERNAME : 'root',
    password: process.env.NODE_ENV === 'production' ? DB_PASSWORD : DB_PASSWORD_DEV,
    database: process.env.NODE_ENV === 'production' ? DB_DATABASE : 'whats_app_clone',
    synchronize: false,
    logging: false,
    charset: 'utf8mb4',
    entities: [
        process.env.NODE_ENV === 'production'
            ? path.join(__dirname, "../entity/**/*.js")
            : "src/entity/**/*.ts"
    ],
    migrations: [
        process.env.NODE_ENV === 'production'
            ? path.join(__dirname, "/migration/**/*.js")
            : "src/migration/**/*.ts"
    ],
    subscribers: [
        process.env.NODE_ENV === 'production'
            ? path.join(__dirname, "/subscriber/**/*.js")
            : "src/subscriber/**/*.ts"
    ],
    cli: {
        entitiesDir: "src/entity",
        migrationsDir: "src/migration",
        subscribersDir: "src/subscriber"
    }
}