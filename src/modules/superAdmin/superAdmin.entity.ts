import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from "typeorm";
import { Organization } from "../organization/organization.entity";
import { User } from "../users/user.entity";
@Entity({ name: "superAdmin", schema: "public" })
export class SuperAdmin {
  @PrimaryGeneratedColumn("uuid")
  superAdminId: string;

  @Column()
  userName: string;

  @Column()
  password: string;

  @Column({ type: "boolean" })
  isActive: boolean;

  @DeleteDateColumn({ name: "deletedDate", nullable: true })
  deletedDate?: Date;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ type: "timestamp", nullable: true })
  resetTokenExpires: Date;

  @CreateDateColumn({ name: "createdDate" })
  createdDate: Date;

  @UpdateDateColumn({ name: "modifiedDate" })
  modifiedDate: Date;

  @OneToMany(() => Organization, (organization) => organization.createdByData)
  organization: Organization[];

  @OneToMany(() => User, (organization) => organization.superAdminCreatedByData)
  user: User[];

  @OneToMany(() => Organization, (organization) => organization.updatedByData)
  organizationData: Organization[];
}
