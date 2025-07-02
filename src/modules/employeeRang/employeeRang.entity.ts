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
import { Organization } from "../organization/organization.entity";
@Entity({ name: "employeeRang", schema: "public" })
export class EmployeeRang {
  @PrimaryGeneratedColumn("uuid")
  employeeRangeId: string;

  @Column()
  employeeRange: string;

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

  @ManyToOne(() => SuperAdmin, (superAdmin) => superAdmin.employeeRang)
  @JoinColumn({ name: "createdBy" })
  createdByData: SuperAdmin;

  @ManyToOne(() => SuperAdmin, (superAdmin) => superAdmin.employeeRangData)
  @JoinColumn({ name: "updatedBy" })
  updatedByData: SuperAdmin;

  @OneToMany(() => Organization, (organization) => organization.employeeRang)
  organization: Organization[];
}
