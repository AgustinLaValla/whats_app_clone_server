import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "./Room";
import { User } from "./User";

@Entity()
export class Message {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User)
    @JoinColumn({ name: 'senderId', referencedColumnName: 'id' })
    sender: User;

    @Column({ type: "text", nullable: false, charset: "utf8mb4" })
    @IsString()
    @IsNotEmpty()
    message: string;

    @CreateDateColumn({ precision: null, type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: string;

    @Column()
    roomId: number;
    @ManyToOne(() => Room, room => room.messages)
    @JoinTable({ name: 'roomId' })
    room: Room;

}