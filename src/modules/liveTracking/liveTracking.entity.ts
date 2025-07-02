import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../users/user.entity";

@Entity("liveTracking")
export class LiveTracking {
  @PrimaryGeneratedColumn("uuid")
  liveTrackingId: string;

  @Column("decimal", { nullable: true })
  lat: number;

  @Column("decimal", { nullable: true })
  long: number;

  @Column({ default: null, nullable: true })
  userId: string;

  @Column()
  createdBy: string;

  @Column({ default: null })
  updatedBy: string;

  @DeleteDateColumn({ name: "deletedDate", nullable: true })
  deletedDate?: Date;

  @CreateDateColumn({ name: "createdDate" })
  createdDate: Date;

  @UpdateDateColumn({ name: "modifiedDate" })
  modifiedDate: Date;

  @ManyToOne(() => User, (user) => user.liveTrackingCreated)
  @JoinColumn({ name: "createdBy" })
  createdByData: User;

  @ManyToOne(() => User, (user) => user.liveTrackingUpdated)
  @JoinColumn({ name: "updatedBy" })
  updatedByData: User;

  @ManyToOne(() => User, (user) => user.liveTrackingUser)
  @JoinColumn({ name: "userId" })
  user: User;
}
