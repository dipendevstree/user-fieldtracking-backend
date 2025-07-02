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
import { Customer } from "../customer/customer.entity";
@Entity({ name: "industry", schema: "public" })
export class Industry {
  @PrimaryGeneratedColumn("uuid")
  industryId: string;

  @Column()
  industryName: string;

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

  @ManyToOne(() => SuperAdmin, (superAdmin) => superAdmin.industry)
  @JoinColumn({ name: "createdBy" })
  createdByData: SuperAdmin;

  @ManyToOne(() => SuperAdmin, (superAdmin) => superAdmin.industryData)
  @JoinColumn({ name: "updatedBy" })
  updatedByData: SuperAdmin;

  @OneToMany(() => Organization, (organization) => organization.industry)
  organization: Organization[];

  @OneToMany(() => Customer, (customer) => customer.industry)
  customer: Customer[];
}
