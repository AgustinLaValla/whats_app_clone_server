import { Router } from 'express';
import { RoomController } from '../controller/RoomController';
import { chechToken } from '../middlewares/jwt';

const router = Router();

router.get('/', RoomController.getRooms);
router.get('/:roomId',RoomController.getRoom);
router.post('/', [chechToken], RoomController.createRoom);
router.put('/:roomId', [chechToken], RoomController.enterRoom);
router.put('/:roomId/change-image', [chechToken], RoomController.changeRoomPic);
router.put('/leave/:roomId', [chechToken], RoomController.leaveRoom);
router.post('/search-room', RoomController.searchRoom);
export default router;