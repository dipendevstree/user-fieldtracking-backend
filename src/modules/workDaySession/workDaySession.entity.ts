import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from "typeorm";
import { User } from "../users/user.entity";
import { Organization } from "../organization/organization.entity";
import { WorkBreakSession } from "../workBreakSession/workBreakSession.entity";
import { WORK_STATUS } from "helper/constants";
import { VEHICLE_TYPE } from "helper/constants";
@Entity("workDaySession")
export class WorkDaySession {
  @PrimaryGeneratedColumn("uuid")
  workDaySessionId: string;

  @Column({ type: "timestamp", nullable: false })
  date: Date;

  @Column({ type: "timestamp", nullable: true })
  startTime: Date;

  @Column({ type: "timestamp", nullable: true })
  endTime: Date;

  @Column({ type: "varchar", nullable: true, enum: VEHICLE_TYPE })
  vehicleType: string;

  @Column({ type: "text", nullable: true })
  vehicleCategory: string;

  @Column({ type: "text", nullable: true })
  startOdometer: string;

  @Column({ type: "text", nullable: true })
  endOdometer: string;

  @Column({ default: WORK_STATUS.IN_PROGRESS, enum: WORK_STATUS })
  status: string;

  @Index()
  @Column()
  organizationId: string;

  @Column()
  userId: string;

  @Column()
  createdBy: string;

  @Column({ default: null, nullable: true })
  updatedBy: string;

  @DeleteDateColumn({ name: "deletedDate", nullable: true })
  deletedDate?: Date;

  @CreateDateColumn({ name: "createdDate" })
  createdDate: Date;

  @UpdateDateColumn({ name: "modifiedDate" })
  modifiedDate: Date;

  @ManyToOne(() => User, (user) => user.workDaySessionCreated)
  @JoinColumn({ name: "createdBy" })
  createdByData: User;

  @ManyToOne(() => User, (user) => user.workDaySessionUpdated)
  @JoinColumn({ name: "updatedBy" })
  updatedByData: User;

  @ManyToOne(() => Organization, (organization) => organization.workDaySessions)
  @JoinColumn({ name: "organizationId" })
  organization: Organization;

  @OneToMany(
    () => WorkBreakSession,
    (breakSession) => breakSession.workDaySession
  )
  breaks: WorkBreakSession[];

  @ManyToOne(() => User, (user) => user.workDaySessions)
  @JoinColumn({ name: "userId" })
  user: User;
}
