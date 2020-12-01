import { Router } from 'express';
import UserController from '../controller/UserController';
import { chechToken } from '../middlewares/jwt';

const router = Router();

//Get all Users
router.get('/', [chechToken], UserController.getAll);

//Get user By Id
router.get('/:id', [chechToken], UserController.getById);

//Create User
router.post('/', UserController.newUser);

//Edit User
router.patch('/:id', [chechToken], UserController.editUser);

//Change profile picture
router.put('/change-profile-pic', [chechToken], UserController.changeProfilePic);

//Delete User
router.delete('/:id', [chechToken], UserController.deleteUser);

export default router;