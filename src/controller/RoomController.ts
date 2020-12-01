import { validate } from "class-validator";
import { Request, Response } from "express";
import { getRepository, Like } from "typeorm";
import { Room } from "../entity/Room";
import { User } from "../entity/User";
import { throwInternalServerError } from '../utils/utils';
import * as fs from 'fs';
import * as path from 'path';

export class RoomController {
    static createRoom = async (req: Request, res: Response): Promise<Response> => {

        const { name } = req.body
        const { id } = res.locals.user;

        try {

            const roomRepository = await getRepository(Room);

            const exists = await roomRepository.findOne({ where: { name } });
            if (exists) return res.status(400).json({ ok: false, message: 'Room Name Already exists' });

            const owner = await getRepository(User).findOne(id);

            const room = await getRepository(Room).create({ name, owner });

            const errors = await validate(room);
            if (errors.length) return res.status(400).json({ ok: false, errors });


            //Set owner as memeber of the room
            await getRepository(Room).save(room);

            await getRepository(Room)
                .createQueryBuilder()
                .relation(Room, "users")
                .of(room.id)
                .add(id)


            return res.json({ ok: true, message: 'Room Successfully created', room });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ ok: false, message: 'Internal Server Error' });
        }
    }

    static getRooms = async (req: Request, res: Response) => {
        try {

            const rooms = await Room.createQueryBuilder()
                .select([
                    'user.email',
                    'user.username',
                    'user.profilePic',
                    'user.id',
                    'r.id',
                    'r.name',
                    'r.roomPicture',
                    'r.createdAt',
                    'r.ownerId'
                ])
                .from(Room, 'r')
                .leftJoin('r.users', 'user')
                .getMany()
            return res.json({ ok: true, rooms });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ ok: false, message: 'Internal Server Error' });
        }
    };

    static getRoom = async (req: Request, res: Response) => {
        const { roomId } = req.params;
        try {
            const room = await Room.createQueryBuilder()
                .select(['user.username', 'user.id', 'user.profilePic', 'r.id', 'r.name', 'r.roomPicture', 'r.createdAt', 'r.ownerId'])
                .from(Room, 'r')
                .leftJoin('r.users', 'user')
                .where({ id: roomId })
                .getOne();


            if (!room) return res.json({ ok: false, message: 'Room Not Found' });

            return res.json({ ok: true, room });

        } catch (error) {
            console.log(error);
            return res.status
        }
    }

    static enterRoom = async (req: Request, res: Response) => {
        const { roomId } = req.params;
        const { id } = res.locals.user;

        try {

            await getRepository(Room)
                .createQueryBuilder()
                .relation(Room, "users")
                .of(roomId)
                .add(id);

            return res.json({ ok: true, message: 'You have entered to the room' });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(200).json({ ok: false, message: 'User is already subscribed to the room' });
            }
            return throwInternalServerError(res, error);
        }
    };

    static leaveRoom = async (req: Request, res: Response) => {
        const { roomId } = req.params;
        const { id } = res.locals.user;

        try {
            await getRepository(Room)
                .createQueryBuilder()
                .relation(Room, 'users')
                .of(roomId)
                .remove(id)

            return res.json({ ok: true, message: 'you have left the room' });
        } catch (error) {
            console.log(error);
            return throwInternalServerError(res, error);
        }
    };

    static changeRoomPic = async (req: Request, res: Response) => {
        const file = req.file;
        const { roomId } = req.params;

        if (!file) return res.status(400).json({ ok: false, message: 'You must select a file' });

        try {
            const room = await getRepository(Room).findOne(roomId);

            room.roomPicture = fs.readFileSync(path.join(__dirname, '..', '..', 'uploads', file.filename));

            await getRepository(Room).save(room);

            fs.unlinkSync(path.join(__dirname, '..', '..', 'uploads', file.filename));

            return res.json({ ok: true, message: 'Room Picture Successfully updated' });
        } catch (error) {
            return throwInternalServerError(res, error);
        }
    }


    static searchRoom = async (req: Request, res: Response) => {
        const { roomName } = req.body;

        try {

            const rooms = await Room.createQueryBuilder()
                .select([
                    'user.email',
                    'user.username',
                    'user.profilePic',
                    'user.id',
                    'r.id',
                    'r.name',
                    'r.roomPicture',
                    'r.createdAt',
                    'r.ownerId'
                ])
                .from(Room, 'r')
                .leftJoin('r.users', 'user')
                .where({name: Like(`%${roomName}%`)})
                .getMany()

            return res.json({ ok: false, rooms })
        } catch (error) {
            return throwInternalServerError(res, error);
        }
    }
}