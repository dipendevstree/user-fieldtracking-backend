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
import { Visit } from "../visit/visit.entity";

@Entity("customerContact")
export class CustomerContact {
  @PrimaryGeneratedColumn("uuid")
  customerContactId: string;

  @Column()
  customerName: string;

  @Column()
  organizationID: string;

  @Column()
  customerId: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  designation: string;

  @Column()
  phoneNumber: string;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ default: null, nullable: true })
  assignUserId: string;

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

  @ManyToOne(() => User, (user) => user.customerContactCreated)
  @JoinColumn({ name: "createdBy" })
  createdByData: User;

  @ManyToOne(() => User, (user) => user.customerContactUpdated)
  @JoinColumn({ name: "updatedBy" })
  updatedByData: User;

  @ManyToOne(() => User, (user) => user.customerContactAssigned)
  @JoinColumn({ name: "assignUserId" })
  assignUser: User;

  @ManyToOne(() => Organization, (organization) => organization.customerContact)
  @JoinColumn({ name: "organizationID" })
  organization: Organization;

  @ManyToOne(() => Customer, (customer) => customer.customerContacts)
  @JoinColumn({ name: "customerId" })
  customer: Customer;

  @OneToMany(() => Visit, (visit) => visit.customerContact)
  visits: Visit[];
}
