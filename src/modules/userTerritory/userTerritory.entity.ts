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
import { User } from "src/modules/users/user.entity";
import { Organization } from "src/modules/organization/organization.entity";

@Entity("userTerritory")
export class UserTerritory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization, (org) => org.organizationMenus, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "organizationId" })
  organization: Organization;

  @Column()
  createdBy: string;

  @ManyToOne(() => User, (user) => user.createdOrganizationMenus)
  @JoinColumn({ name: "createdBy" })
  createdByData: User;

  @Column({ default: null, nullable: true })
  updatedBy: string;

  @ManyToOne(() => User, (user) => user.updatedOrganizationMenus)
  @JoinColumn({ name: "updatedBy" })
  updatedByData: User;

  @DeleteDateColumn({ name: "deletedDate", nullable: true })
  deletedDate?: Date;

  @CreateDateColumn({ name: "createdDate" })
  createdDate: Date;

  @UpdateDateColumn({ name: "modifiedDate" })
  modifiedDate: Date;

  @OneToMany(() => User, (organization) => organization.territory)
  user: User[];
}
