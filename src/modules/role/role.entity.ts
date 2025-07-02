import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "../users/user.entity";
import { Permission } from "../permission/permission.entity";
import { SuperAdmin } from "../superAdmin/superAdmin.entity";
@Entity({ name: "role" })
export class Role {
  @PrimaryGeneratedColumn("uuid")
  roleId: string;

  @Column()
  roleName: string;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  superAdminCreatedBy: string;

  @Column({ default: null, nullable: true })
  updatedBy: string;

  @Column({ type: "boolean" })
  isActive: boolean;

  @Column()
  organizationID: string;

  @DeleteDateColumn({ name: "deletedDate", nullable: true })
  deletedDate?: Date;

  @CreateDateColumn({ name: "createdDate" })
  createdDate: Date;

  @UpdateDateColumn({ name: "modifiedDate" })
  modifiedDate: Date;

  @ManyToOne(() => User, (user) => user.roleData)
  @JoinColumn({ name: "createdBy" })
  createdByData: User;

  @ManyToOne(() => SuperAdmin, (superAdmin) => superAdmin.role)
  @JoinColumn({ name: "superAdminCreatedBy" })
  superAdminCreatedByData: SuperAdmin;

  @ManyToOne(() => User, (user) => user.roleDetails)
  @JoinColumn({ name: "updatedBy" })
  updatedByData: User;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @OneToMany(() => User, (user) => user.reportingToRole)
  reportingUsers: User[];

  @OneToMany(() => Permission, (permissions) => permissions.role)
  permissions: Permission[];
}
