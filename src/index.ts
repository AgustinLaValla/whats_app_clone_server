import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as http from 'http';
import userRoutes from './routes/user';
import authRoutes from './routes/auth';
import messageRoutes from './routes/message.routes';
import roomRoutes from './routes/rooms.routes'
import { Server } from "socket.io";
import { privateChat } from './socket/private-chat';
import upload from './middlewares//upload';
import { DB_CREDENTIALS } from './config/db_credentials';

const PORT = process.env.PORT || 4000;

createConnection(DB_CREDENTIALS).then(async () => {

    // create express app
    const app = express();
    //Create http server
    const server = http.createServer(app);
    const io: Server = require('socket.io')(server, {
        cors: {
            origin: '*',
            methods: '*'
        }
    });

    console.log(process.env.NODE_ENV);

    //Middleware
    app.use(cors());
    app.use(helmet());
    app.use(express.json({ limit: '50mb' }))
    app.use(express.urlencoded({ limit: '50mb', extended: false }));
    app.use(upload.single('file'))


    //Routes
    app.get('/', async (req, res) => res.send('Hello world'))
    app.use('/user', userRoutes);
    app.use('/auth', authRoutes);
    app.use('/messages', messageRoutes);
    app.use('/rooms', roomRoutes);

    //Socket
    privateChat(io);

    // start express server
    server.listen(PORT, () => console.log(`Server on port: ${PORT}`));


}).catch(error => console.log(error));
