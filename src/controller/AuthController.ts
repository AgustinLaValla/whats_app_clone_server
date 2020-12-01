import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from '../entity/User';
import { generateJWT } from '../middlewares/jwt';


class AuthController {
    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ ok: false, message: 'Email and Password are required' });
        }

        console.log({email, password});

        const userRepository = getRepository(User);

        try {
            const user = await userRepository.findOne({ where: { email }, select:['id', 'username', 'email', 'profilePic', 'password'] });

            if (!user) return res.status(400).json({ message: 'User not found' });

            const isValid = user.chechPassword(password);

            if (!isValid) return res.status(400).json({ ok: false, message: 'Email or password is wrong' });

            const token = await generateJWT(user);

            delete user.password;

            return res.json({ user, token });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ ok: false, message: 'Internal Server Error' });
        }
    }

    static changePassword = async (req: Request, res: Response) => {
        const { id } = res.locals.user;
        const { password, newPassword } = req.body;

        const userRepository = getRepository(User);

        try {
            const user = await userRepository.findOne({ where: { id } });
            if (!user) return res.status(404).json({ ok: false, message: 'User not found' });

            const passwordIsValid = user.chechPassword(password);
            if (!passwordIsValid) return res.status(400).json({ ok: false, message: 'Password Is Wrong' });

            const newPasswordIsValid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])\w{6,}$/.test(newPassword);
            if (!newPasswordIsValid) return res.status(400).json({
                ok: false,
                message: 'At least one number, one lowercase and one uppercase letter, six characters that are letters, numbers or the underscore'
            })

            user.password = newPassword;
            user.hashPassword();

            await userRepository.save(user);

            return res.json({ ok: true, message: 'Password Successfully Changed' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ ok: false, message: 'Internal server Error' });
        }
    };
}

export default AuthController;