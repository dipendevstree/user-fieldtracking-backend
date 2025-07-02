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
import { User } from "../users/user.entity";
@Entity({ name: "department", schema: "public" })
export class Department {
  @PrimaryGeneratedColumn("uuid")
  departmentId: string;

  @Column()
  departmentName: string;

  @Column()
  departmentKey: string;

  @Column()
  createdBy: string;

  @Column({ default: null })
  updatedBy: string;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @DeleteDateColumn({ name: "deletedDate", nullable: true })
  deletedDate?: Date;

  @CreateDateColumn({ name: "createdDate" })
  createdDate: Date;

  @UpdateDateColumn({ name: "modifiedDate" })
  modifiedDate: Date;

  @ManyToOne(() => SuperAdmin, (superAdmin) => superAdmin.department)
  @JoinColumn({ name: "createdBy" })
  createdByData: SuperAdmin;

  @ManyToOne(() => SuperAdmin, (superAdmin) => superAdmin.departmentData)
  @JoinColumn({ name: "updatedBy" })
  updatedByData: SuperAdmin;

  @OneToMany(() => User, (organization) => organization.department)
  user: User[];
}
