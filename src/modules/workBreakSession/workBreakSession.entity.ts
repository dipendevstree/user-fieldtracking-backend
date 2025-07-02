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
} from "typeorm";
import { User } from "../users/user.entity";
import { Organization } from "../organization/organization.entity";
import { WorkDaySession } from "../workDaySession/workDaySession.entity";
import { WORK_STATUS } from "helper/constants";
@Entity("workBreakSession")
export class WorkBreakSession {
  @PrimaryGeneratedColumn("uuid")
  workBreakSessionId: string;

  @Column()
  breakType: string;

  @Column({ type: "timestamp" })
  breakStartTime: Date;

  @Column({ type: "timestamp", nullable: true })
  breakEndTime: Date;

  @Column({ type: "text", nullable: true })
  notes: string;

  @Index()
  @Column()
  organizationId: string;

  @Column()
  userId: string;

  @Column({ default: WORK_STATUS.IN_PROGRESS, enum: WORK_STATUS })
  status: string;

  @Column()
  workDaySessionId: string;

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

  @ManyToOne(() => WorkDaySession, (session) => session.breaks, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "workDaySessionId" })
  workDaySession: WorkDaySession;

  @ManyToOne(() => User, (user) => user.workBreakSessionCreated)
  @JoinColumn({ name: "createdBy" })
  createdByData: User;

  @ManyToOne(() => User, (user) => user.workBreakSessionUpdated)
  @JoinColumn({ name: "updatedBy" })
  updatedByData: User;

  @ManyToOne(() => User, (user) => user.workBreakSessions)
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(
    () => Organization,
    (organization) => organization.workBreakSessions
  )
  @JoinColumn({ name: "organizationId" })
  organization: Organization;
}
