import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../users/user.entity";
import { SuperAdmin } from "../superAdmin/superAdmin.entity";

@Entity({ name: "organization", schema: "public" })
export class Organization {
  @PrimaryGeneratedColumn("uuid")
  organizationID: string;

  @Column({ name: "name" })
  organizationName: string;

  @Column({ name: "schema", default: "public" })
  organizationSchema: string;

  @Column({ name: "industryId" })
  industryId: string;

  @Column({ name: "adminUserId", nullable: true })
  adminUserId: string;

  @Column({ name: "employeeRangeId" })
  employeeRangeId: string;

  @Column({ name: "organizationTypeId", nullable: true })
  organizationTypeId: string;

  @Column({ name: "isSeparateSchema", default: false })
  isSeparateSchema: boolean;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column("text", { array: true, nullable: true, default: [] })
  menuIds: string[];

  @Column({ name: "website", nullable: true })
  website: string;

  @Column({ name: "description", nullable: true })
  description: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  state: string;

  @Column({ default: "Asia/Calcutta" })
  time_zone: string;

  @Column()
  createdBy: string;

  @Column({ default: null })
  updatedBy: string;

  @CreateDateColumn({ name: "createdDate" })
  createdDate: Date;

  @UpdateDateColumn({ name: "modifiedDate" })
  modifiedDate: Date;

  @DeleteDateColumn({ name: "deletedDate", nullable: true })
  deletedDate?: Date;

  @ManyToOne(() => SuperAdmin, (superAdmin) => superAdmin.organization)
  @JoinColumn({ name: "createdBy" })
  createdByData: SuperAdmin;

  @ManyToOne(() => SuperAdmin, (superAdmin) => superAdmin.organizationData)
  @JoinColumn({ name: "updatedBy" })
  updatedByData: SuperAdmin;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];
}
