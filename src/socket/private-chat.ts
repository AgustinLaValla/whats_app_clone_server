import { Socket, Server } from "socket.io";


interface UserSocketData {
    socketId: string;
    userId: string;
    username: string;
    room: string
}

interface Room {
    roomId: string;
    users: UserSocketData[];
}

let globalRoom: UserSocketData[] = [];
let rooms: { [key: string]: Room } = {};


export const privateChat = (io: Server) => {
    io.on('connect', (client: Socket) => {

        client.on('online', ({ userId, username }) => {
            client.join('global'); //Join to the global room

            globalRoom.push({ //Set user data in the global array
                socketId: client.id,
                userId,
                username: username.trim().toLowerCase(),
                room: 'gobal'
            });

            const onlineUsers = [... new Set(globalRoom.map(user => user.userId))];
            io.emit('usersOnline', { onlineUsers });
        });

        client.on('entered', ({ roomId, userId, username }) => {

            client.join(roomId);

            let userData: UserSocketData = {
                room: roomId,
                socketId: client.id,
                userId,
                username: username.trim().toLowerCase()
            }

            if (!rooms[roomId]) {
                rooms[roomId] = {
                    roomId,
                    users: [userData]
                };
            } else {
                const userExists = rooms[roomId].users.find(user => user.userId === userId);
                if (!userExists) {
                    rooms[roomId].users = [...rooms[roomId].users, userData];
                    io.to(roomId).emit('reload-room', { roomId })
                }
            }

            io.to(roomId).emit('room-data', { roomData: rooms[roomId] });

        })

        client.on('leave-room', ({ roomId, userId }) => {
            client.leave(roomId);
            if (rooms[roomId]) {
                rooms[roomId].users = rooms[roomId].users.filter(user => user.userId !== userId);
            }
            client.broadcast.to(roomId).emit('room-data', { roomData: rooms[roomId] });
            console.log('LEAVED', { roomId, userId });
            if (rooms[roomId] && !rooms[roomId].users.length) {
                delete rooms[roomId];
            }
        });

        client.on('reload-rooms', () => io.emit('reload-rooms'));

        client.on('reload-room', ({ roomId }) => io.to(roomId).emit('reload-room', { roomId }));

        client.on('reload-messages', ({ roomId }: { [k: string]: string }) =>
            io.to(roomId).emit('reload-messages', { roomId }));


        client.on('reload-userData', ({ userId }) => {
            client.emit('reload-userData', { userId })
        })

        client.on('logout', () => {
            const index = globalRoom.findIndex(userData => userData.socketId === client.id);
            globalRoom.splice(index, 1)[0];
            const onlineUsers = [... new Set(globalRoom.map(user => user.userId))];
            io.emit('usersOnline', { onlineUsers });
        });

        client.on('disconnect', () => {
            const index = globalRoom.findIndex(userData => userData.socketId === client.id);
            const user = globalRoom.find(userData => userData.socketId === client.id);
            globalRoom.splice(index, 1)[0];
            const onlineUsers = [... new Set(globalRoom.map(user => user.userId))];
            io.emit('usersOnline', { onlineUsers });

            if (user) {
                io.emit('user-is-disconnected', { userId: user.userId });
            }

        });
    });



}