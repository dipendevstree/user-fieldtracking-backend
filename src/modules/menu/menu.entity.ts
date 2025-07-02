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
import { SuperAdmin } from "../superAdmin/superAdmin.entity";
import { OrganizationMenu } from "../organizationMenu/organizationMenu.entity";
@Entity({ name: "menu", schema: "public" })
export class Menu {
  @PrimaryGeneratedColumn("uuid")
  menuId: string;

  @Column()
  menuName: string;

  @Column({ default: null, nullable: true })
  parentMenuId: string;

  @Column()
  menuKey: string;

  @Column({ type: "boolean", default: true })
  isDependentOnOtherModule: boolean;

  @Column()
  createdBy: string;

  @Column({ default: null })
  updatedBy: string;

  @Column({ type: "boolean" })
  isActive: boolean;

  @DeleteDateColumn({ name: "deletedDate", nullable: true })
  deletedDate?: Date;

  @CreateDateColumn({ name: "createdDate" })
  createdDate: Date;

  @UpdateDateColumn({ name: "modifiedDate" })
  modifiedDate: Date;

  @ManyToOne(() => SuperAdmin, (superAdmin) => superAdmin.menu)
  @JoinColumn({ name: "createdBy" })
  createdByData: SuperAdmin;

  @ManyToOne(() => SuperAdmin, (superAdmin) => superAdmin.menuData)
  @JoinColumn({ name: "updatedBy" })
  updatedByData: SuperAdmin;

  @OneToMany(
    () => OrganizationMenu,
    (organizationMenu) => organizationMenu.masterMenu
  )
  orgMenu: OrganizationMenu[];
}
