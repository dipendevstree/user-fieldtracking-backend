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
import { Organization } from "../organization/organization.entity";
import { Customer } from "../customer/customer.entity";

@Entity("customerType")
export class CustomerType {
  @PrimaryGeneratedColumn("uuid")
  customerTypeId: string;

  @Column()
  typeName: string;

  @Column()
  organizationId: string;

  @Column()
  createdBy: string;

  @Column({ default: null })
  updatedBy: string;

  @DeleteDateColumn({ name: "deletedDate", nullable: true })
  deletedDate?: Date;

  @CreateDateColumn({ name: "createdDate" })
  createdDate: Date;

  @UpdateDateColumn({ name: "modifiedDate" })
  modifiedDate: Date;

  @ManyToOne(() => User, (user) => user.customerTypeCreated)
  @JoinColumn({ name: "createdBy" })
  createdByData: User;

  @ManyToOne(() => User, (user) => user.customerTypeUpdated)
  @JoinColumn({ name: "updatedBy" })
  updatedByData: User;

  @ManyToOne(() => Organization, (organization) => organization.customerTypes)
  @JoinColumn({ name: "organizationId" })
  organization: Organization;

  @OneToMany(() => Customer, (customer) => customer.customerType)
  customer: Customer[];
}
