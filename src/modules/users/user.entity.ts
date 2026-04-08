import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  DeleteDateColumn,
} from "typeorm";
// import { Organization } from "../organization/organization.entity";
import { USER_STATUS } from "helper/constants";
// import { SuperAdmin } from "../superAdmin/superAdmin.entity";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  otp: string;

  @Column({ length: 255 })
  firstName: string;

  @Column({ length: 255 })
  lastName: string;

  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  @Column({ nullable: true, default: "+91" })
  countryCode: string;

  @Column({ length: 255, nullable: true })
  jobTitle: string;

  @Column({ length: 255, nullable: true, default: "tier_1" })
  tierkey: string;

  @Column()
  schemaName: string;

  @Column({ nullable: true })
  departmentId: string;

  @Column({
    nullable: true,
    length: 255,
    default: USER_STATUS.CREATED,
    enum: USER_STATUS,
  })
  status: string;

  @Column({ nullable: true })
  active_token: string;

  @Column({ type: "timestamp", nullable: true })
  resetTokenExpires: Date;

  @Column({ name: "roleId", nullable: false })
  roleId: string;

  @Column({ name: "reportingToRoleId", nullable: true })
  reportingToRoleId: string;

  @Column()
  organizationID: string;

  @Column({ nullable: true })
  territoryId: string;

  @Column({ default: true })
  isWebUser: boolean;

  @Column({ default: false })
  isPasswordChanged: boolean;

  @Column({ nullable: true })
  superAdminCreatedBy: string;

  @DeleteDateColumn({ name: "deletedDate", nullable: true })
  deletedDate?: Date;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  // Relations

  // @ManyToOne(() => Organization, (organization) => organization.users)
  // @JoinColumn({ name: "organizationID" })
  // organization: Organization;

  @ManyToMany(() => User, (user) => user.reportingUsers)
  @JoinTable({
    name: "userReporting",
    joinColumn: {
      name: "userId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "reportingToId",
      referencedColumnName: "id",
    },
  })
  reportingTo: User[];

  @ManyToMany(() => User, (user) => user.reportingTo)
  reportingUsers: User[];

  // @ManyToOne(() => SuperAdmin, (superAdmin) => superAdmin.user)
  // @JoinColumn({ name: "superAdminCreatedBy" })
  // superAdminCreatedByData: SuperAdmin;
}
