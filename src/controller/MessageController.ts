import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Message } from '../entity/Message';
import { validate } from 'class-validator'
import { Room } from "../entity/Room";
import { User } from "../entity/User";

export class MessageController {

    static sendMessage = async (req: Request, res: Response): Promise<Response> => {
        const { senderId, roomId, message } = req.body;

        try {
            const room = await getRepository(Room).findOne({ where: { id: roomId } });
            if (!room) return res.status(400).json({ ok: false, message: 'Room Not Found' });

            const user = await getRepository(User).findOne(senderId);
            if(!user) return res.status(404).json({ok: false, message: 'User does not exist'});

            const newMessage = await getRepository(Message).create({ room, sender:user, message });

            const errors = await validate(newMessage);
            if (errors.length) return res.status(400).json({ ok: false, errors });

            await getRepository(Message).save(newMessage);

            await getRepository(Room)
                .createQueryBuilder()
                .relation(Room, "messages")
                .of(roomId)
                .add(newMessage.id);

            return res.json({ ok: true, message: 'Message Successfully Sent' });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ ok: false, message: 'Internal Server Error' });
        }
    };

    static getConversation = async (req: Request, res: Response): Promise<Response> => {

        const { roomId, limit } = req.params;

        try {
             const messages = await getRepository(Message)
                .createQueryBuilder()
                .select(['msg.id', 'msg.message', 'msg.createdAt', 'msg.roomId', 'sender.username', 'sender.email', 'sender.id'])
                .from(Message, 'msg')
                .innerJoin('msg.sender', 'sender')
                .where({ roomId })
                .take(parseInt(limit))
                .orderBy('msg.createdAt', 'DESC')
                .getMany()

                const total = await getRepository(Message).count({where: {roomId}});

            return res.json({ ok: true, messages, total });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ ok: false, message: 'Internal Server Error' });
        }
    }
}