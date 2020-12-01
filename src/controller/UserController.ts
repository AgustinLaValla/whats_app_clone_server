import { getRepository } from "typeorm";
import { Request, Response } from "express";
import { User } from "../entity/User";
import { validate } from 'class-validator';
import { generateJWT } from '../middlewares/jwt';
import { throwInternalServerError } from '../utils/utils';
import * as fs from 'fs';
import * as path from 'path';

export class UserController {

    static getAll = async (req: Request, res: Response) => {
        const userRepository = getRepository(User);
        try {
            const users = await userRepository.find({ select: ['username', 'email', 'id', 'profilePic'] });
            return res.json({ ok: true, users });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ ok: false, message: 'internal Server Error' });
        }
    };

    static getById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const userRepository = getRepository(User);
        try {
            const user = await userRepository.findOne({ where: { id }, select: ['username', 'email', 'id', 'profilePic'] });
            if (!user) return res.status(404).json({ ok: false, message: 'User not found' });

            const token = await generateJWT(user);

            return res.json({ ok: true, user, token });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ ok: false, message: 'internal Server Error' });
        }
    }

    static newUser = async (req: Request, res: Response) => {
        const { username, email, password } = req.body;
        const userRepository = getRepository(User);
        try {
            //Check if user already exists
            const user = await userRepository.findOne({ where: { email } });
            if (user) return res.status(400).json({ ok: false, message: 'User Already exists' });

            //Create user
            const newUser = await userRepository.create({ username, email, password });

            //Validate fields
            const errors = await validate(newUser);

            if (errors.length > 0) {
                return res.status(400).json({ ok: false, errors });
            }

            //Encrypt password
            newUser.hashPassword();
            await userRepository.save(newUser);

            delete newUser.password

            //Generate token
            const token = await generateJWT(newUser);

            const createdUser = await userRepository.findOne({
                where: { email },
                select: ['id', 'email', 'username', 'profilePic']
            });

            return res.json({
                ok: true,
                message: 'User Successfully  created',
                user: createdUser,
                token
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ ok: false, message: 'internal Server Error' });
        }
    }

    static editUser = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { username } = req.body
        const userRepository = getRepository(User);

        try {
            const user = await userRepository.findOne({ where: { id } });
            if (!user) return res.status(400).json({ ok: false, message: 'User not found' });

            user.username = username;

            await userRepository.save(user);

            return res.status(201).json({ ok: true, message: 'User successfully updated' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ ok: false, message: 'internal Server Error' });
        }
    }

    static changeProfilePic = async (req: Request, res: Response) => {
        const file = req.file;

        if (!file) return res.status(400).json({ ok: false, message: 'You must select a file' });


        try {
            const user = await getRepository(User).findOne({
                where: { id: res.locals.user.id },
                select: ['id', 'email', 'username', 'profilePic']
            })
            user.profilePic = fs.readFileSync(path.join(__dirname, '..', '..', 'uploads', file.filename));
            await getRepository(User).save(user);

            fs.unlinkSync(path.join(__dirname, '..', '..', 'uploads', file.filename));

            return res.json({ ok: true, message: 'File successfully uploaded', user });

        } catch (error) {
            return throwInternalServerError(res, error);
        }
    }

    static deleteUser = async (req: Request, res: Response) => {
        const { id } = req.params;
        const userRepository = getRepository(User);

        try {
            await userRepository.delete({ id: parseInt(id) });
            return res.json({ ok: true, message: 'User successfully deleted' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ ok: false, message: 'Internal server Error' });
        }
    }

}

export default UserController;