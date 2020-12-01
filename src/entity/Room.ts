import { IsNotEmpty, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique, JoinTable, ManyToMany, BaseEntity } from "typeorm";
import { Message } from "./Message";
import { User } from "./User";

@Entity()
@Unique(['name'])
export class Room extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column({ type: 'varchar', length: 100, nullable: false })
    @IsNotEmpty()
    @IsString()
    name: string;

    @CreateDateColumn({ precision: null, type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: string;

    @Column({ type: 'longblob', nullable: true })
    roomPicture: Buffer

    @Column()
    ownerId: number;
    @ManyToOne(() => User, user => user.roomsOwned)
    @JoinTable({ name: 'ownerId' })
    owner: User;


    @ManyToMany(() => User, user => user.roomsSubscribed, { cascade: false, primary: false })
    @JoinTable({ name: 'room_members' })
    users: User[];

    @OneToMany(() => Message, message => message.room, { cascade: true })
    messages: Message[];
}