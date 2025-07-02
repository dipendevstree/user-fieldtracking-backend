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
} from "typeorm";
import { Organization } from "../organization/organization.entity";
import { User } from "../users/user.entity";
import { Customer } from "../customer/customer.entity";
import { CustomerContact } from "../customerContact/customerContact.entity";
import { VISIT_STATUS } from "helper/constants";

@Entity("visit")
export class Visit {
  @PrimaryGeneratedColumn("uuid")
  visitId: string;

  @Column({ type: "timestamp", nullable: false })
  date: Date;

  @Column()
  time: string;

  @Column({ type: "float", nullable: true })
  duration: number;

  @Column()
  purpose: string;

  @Index()
  @Column()
  organizationId: string;

  @Column({
    nullable: true,
    length: 255,
    default: VISIT_STATUS.PENDING,
    enum: VISIT_STATUS,
  })
  status: string;

  @Column()
  customerId: string;

  @Column()
  salesRepresentativeUserId: string;

  @Column({ nullable: true })
  customerContactId: string;

  @Column({ nullable: true })
  priority: "Low" | "Medium" | "High";

  @Column()
  streetAddress: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zipCode: number;
  @Column({ type: "double precision", nullable: true })
  latitude: number;

  @Column({ type: "double precision", nullable: true })
  longitude: number;

  @Column()
  country: string;

  @Column({ nullable: true })
  preparationNotes: string;

  @Column({ nullable: true })
  meetingNotes: string;

  @Column("text", { array: true, nullable: true })
  meetingOutcomes: string[];

  @Column({ type: "text", nullable: true })
  nextActions: string;

  @Column({ type: "timestamp", nullable: true })
  followUpDate: Date;

  @DeleteDateColumn({ name: "deletedDate", nullable: true })
  deletedDate?: Date;

  @CreateDateColumn({ name: "createdDate" })
  createdDate: Date;

  @UpdateDateColumn({ name: "modifiedDate" })
  modifiedDate: Date;

  @Column()
  createdBy: string;

  @Column({ default: null })
  updatedBy: string;

  @ManyToOne(() => User, (user) => user.visits)
  @JoinColumn({ name: "createdBy" })
  createdByData: User;

  @ManyToOne(() => User, (user) => user.updatedVisits)
  @JoinColumn({ name: "updatedBy" })
  updatedByData: User;

  @ManyToOne(() => Organization, (organization) => organization.visits)
  @JoinColumn({ name: "organizationId" })
  organization: Organization;

  @ManyToOne(() => Customer, (customer) => customer.visits)
  @JoinColumn({ name: "customerId" })
  customer: Customer;

  @ManyToOne(() => CustomerContact, (contact) => contact.visits)
  @JoinColumn({ name: "customerContactId" })
  customerContact: CustomerContact;

  @ManyToOne(() => User, (contact) => contact.salesRepresentatives)
  @JoinColumn({ name: "salesRepresentativeUserId" })
  salesRepresentativeUser: User;
}
