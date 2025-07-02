import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from "typeorm";
import { Organization } from "../organization/organization.entity";
import { Industry } from "../industry/industry.entity";
import { CustomerType } from "../customerType/customerType.entity";
import { User } from "../users/user.entity";
import { CustomerContact } from "../customerContact/customerContact.entity";
import { Visit } from "../visit/visit.entity";

@Entity("customer")
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  customerId: string;

  @Column()
  companyName: string;

  @Index("IDX_ORGANIZATION_ID")
  @Column()
  organizationId: string;

  @Column()
  industryId: string;

  @Column()
  customerTypeId: string;

  @Column()
  streetAddress: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zipCode: number;

  @Column({ default: 9632587412 })
  phoneNumber: string;

  @Column({ type: "double precision", nullable: true })
  latitude: number;

  @Column({ type: "double precision", nullable: true })
  longitude: number;

  @Column()
  country: string;

  @Column({ nullable: true })
  additionalNotes: string;

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

  @ManyToOne(() => Industry, (industry) => industry.customer)
  @JoinColumn({ name: "industryId" })
  industry: Industry;

  @ManyToOne(() => CustomerType, (customerType) => customerType.customer)
  @JoinColumn({ name: "customerTypeId" })
  customerType: CustomerType;

  @ManyToOne(() => Organization, (organization) => organization.customer)
  @JoinColumn({ name: "organizationId" })
  organization: Organization;

  @ManyToOne(() => User, (user) => user.customerCreated)
  @JoinColumn({ name: "createdBy" })
  createdByData: User;

  @ManyToOne(() => User, (user) => user.customerUpdated)
  @JoinColumn({ name: "updatedBy" })
  updatedByData: User;

  @OneToMany(() => CustomerContact, (contact) => contact.customer)
  customerContacts: CustomerContact[];

  @OneToMany(() => Visit, (visit) => visit.customer)
  visits: Visit[];
}
