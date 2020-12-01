import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from "typeorm";
import { MinLength, IsNotEmpty, IsEmail, Matches, MaxLength } from 'class-validator';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { Room } from "./Room";
import { Message } from "./Message";

@Entity()
@Unique(['email'])
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    username: string;

    @Column({ type: "varchar", length: 100 })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @Column({ type: 'varchar', length: 100 })
    @IsNotEmpty()
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])\w{6,}$/, {
        message: "At least one number, one lowercase and one uppercase letter, six characters that are letters, numbers or the underscore"
    })
    password: string;

    @Column({ type: 'longblob', nullable: true })
    profilePic: Buffer;

    @Column()
    @CreateDateColumn({ precision: null, type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @OneToMany(() => Room, room => room.owner, { eager: true })
    roomsOwned: Room[];

    @ManyToMany(() => Room, room => room.users, { eager: true, primary: false })
    roomsSubscribed: Room[];


    hashPassword(): void {
        const salt = genSaltSync(10);
        this.password = hashSync(this.password, salt);
    }

    chechPassword(password: string): boolean {
        return compareSync(password, this.password);
    }
}
