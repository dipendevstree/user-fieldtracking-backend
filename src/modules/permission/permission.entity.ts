import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { User } from "../users/user.entity";
import { Role } from "../role/role.entity";
import { Organization } from "../organization/organization.entity";
import { OrganizationMenu } from "../organizationMenu/organizationMenu.entity";

@Entity("permission")
export class Permission {
  @PrimaryGeneratedColumn("uuid")
  permissionId: string;

  @Column()
  roleId: string;

  @Column()
  organizationId: string;

  @Column()
  organizationMenuId: string;

  @Column({ type: "boolean", default: true })
  viewOwn: boolean;

  @Column({ type: "boolean", default: true })
  viewGlobal: boolean;

  @Column({ type: "boolean" })
  add: boolean;

  @Column({ type: "boolean" })
  edit: boolean;

  @Column({ type: "boolean" })
  delete: boolean;

  @CreateDateColumn({ name: "createdDate" })
  createdDate: Date;

  @UpdateDateColumn({ name: "modifiedDate" })
  modifiedDate: Date;

  @DeleteDateColumn({ name: "deletedDate", nullable: true })
  deletedDate?: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ default: null, nullable: true })
  updatedBy: string;

  @ManyToOne(() => User, (user) => user.permissions)
  @JoinColumn({ name: "createdBy" })
  createdByData: User;

  @ManyToOne(() => User, (user) => user.permissionsData)
  @JoinColumn({ name: "updatedBy" })
  updatedByData: User;

  @ManyToOne(() => Role, (role) => role.permissions)
  @JoinColumn({ name: "roleId" })
  role: Role;

  @ManyToOne(() => Organization, (role) => role.permissions)
  @JoinColumn({ name: "organizationId" })
  organization: Organization;

  @ManyToOne(() => OrganizationMenu, (role) => role.permissions)
  @JoinColumn({ name: "organizationMenuId" })
  organizationMenu: OrganizationMenu;
}
