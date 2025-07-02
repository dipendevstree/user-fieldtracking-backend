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
import { Organization } from "../organization/organization.entity";
import { User } from "../users/user.entity";
import { Menu } from "../menu/menu.entity";
import { Permission } from "../permission/permission.entity";

@Entity("organizationMenu")
export class OrganizationMenu {
  @PrimaryGeneratedColumn("uuid")
  organizationMenuId: string;

  @Column()
  menuName: string;

  @Column()
  menuKey: string;

  @Column({ default: null, nullable: true })
  parentMenuId: string;

  @Column()
  organizationId: string;

  @Column()
  masterMenuId: string;

  @Column()
  createdBy: string;

  @Column({ default: null, nullable: true })
  updatedBy: string;

  @Column({ type: "boolean" })
  isActive: boolean;

  @DeleteDateColumn({ name: "deletedDate", nullable: true })
  deletedDate?: Date;

  @CreateDateColumn({ name: "createdDate" })
  createdDate: Date;

  @UpdateDateColumn({ name: "modifiedDate" })
  modifiedDate: Date;

  @ManyToOne(
    () => Organization,
    (organization) => organization.organizationMenu
  )
  @JoinColumn({ name: "organizationId" })
  organization: Organization;

  @ManyToOne(() => User, (user) => user.organizationMenu)
  @JoinColumn({ name: "createdBy" })
  createdByData: User;

  @ManyToOne(() => User, (user) => user.organizationMenuData)
  @JoinColumn({ name: "updatedBy" })
  updatedByData: User;

  @ManyToOne(() => Menu, (menu) => menu.orgMenu)
  @JoinColumn({ name: "masterMenuId" })
  masterMenu: Menu;

  @OneToMany(
    () => Permission,
    (organizationMenu) => organizationMenu.organizationMenu
  )
  permissions: Permission[];
}
