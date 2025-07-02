import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../users/user.entity";
import { SuperAdmin } from "../superAdmin/superAdmin.entity";
import { OrganizationMenu } from "../organizationMenu/organizationMenu.entity";
import { Permission } from "../permission/permission.entity";
import { OrganizationType } from "../organizationType/organizationType.entity";
import { Industry } from "../industry/industry.entity";
import { EmployeeRang } from "../employeeRang/employeeRang.entity";
import { CustomerType } from "../customerType/customerType.entity";
import { Customer } from "../customer/customer.entity";
import { CustomerContact } from "../customerContact/customerContact.entity";
import { Visit } from "../visit/visit.entity";
import { WorkDaySession } from "../workDaySession/workDaySession.entity";
import { WorkBreakSession } from "../workBreakSession/workBreakSession.entity";

@Entity({ name: "organization", schema: "public" })
export class Organization {
  @PrimaryGeneratedColumn("uuid")
  organizationID: string;

  @Column({ name: "name" })
  organizationName: string;

  @Column({ name: "schema", default: "public" })
  organizationSchema: string;

  @Column({ name: "industryId" })
  industryId: string;

  @Column({ name: "adminUserId", nullable: true })
  adminUserId: string;

  @Column({ name: "employeeRangeId" })
  employeeRangeId: string;

  @Column({ name: "organizationTypeId", nullable: true })
  organizationTypeId: string;

  @Column({ name: "isSeparateSchema", default: false })
  isSeparateSchema: boolean;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column("text", { array: true, nullable: true, default: [] })
  menuIds: string[];

  @Column({ name: "website", nullable: true })
  website: string;

  @Column({ name: "description", nullable: true })
  description: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  state: string;

  @Column({ default: "Asia/Calcutta" })
  time_zone: string;

  @Column()
  createdBy: string;

  @Column({ default: null })
  updatedBy: string;

  @CreateDateColumn({ name: "createdDate" })
  createdDate: Date;

  @UpdateDateColumn({ name: "modifiedDate" })
  modifiedDate: Date;

  @DeleteDateColumn({ name: "deletedDate", nullable: true })
  deletedDate?: Date;

  @ManyToOne(() => SuperAdmin, (superAdmin) => superAdmin.organization)
  @JoinColumn({ name: "createdBy" })
  createdByData: SuperAdmin;

  @ManyToOne(() => SuperAdmin, (superAdmin) => superAdmin.organizationData)
  @JoinColumn({ name: "updatedBy" })
  updatedByData: SuperAdmin;

  @ManyToOne(() => OrganizationType, (menu) => menu.organization)
  @JoinColumn({ name: "organizationTypeId" })
  organizationType: OrganizationType;

  @ManyToOne(() => Industry, (industry) => industry.organization)
  @JoinColumn({ name: "industryId" })
  industry: Industry;

  @ManyToOne(() => EmployeeRang, (employeeRang) => employeeRang.organization)
  @JoinColumn({ name: "employeeRangeId" })
  employeeRang: EmployeeRang;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(
    () => OrganizationMenu,
    (organizationMenu) => organizationMenu.organization
  )
  organizationMenu: OrganizationMenu[];

  @OneToMany(
    () => Permission,
    (organizationMenu) => organizationMenu.organization
  )
  permissions: Permission[];

  @OneToMany(() => OrganizationMenu, (menu) => menu.organization)
  organizationMenus: OrganizationMenu[];

  @OneToMany(() => CustomerType, (customerType) => customerType.organization)
  customerTypes: CustomerType[];

  @OneToMany(() => Customer, (customer) => customer.organization)
  customer: Customer[];

  @OneToMany(() => CustomerContact, (contact) => contact.organization)
  customerContact: CustomerContact[];

  @OneToMany(() => Visit, (visit) => visit.organization)
  visits: Visit[];

  @OneToMany(
    () => WorkDaySession,
    (workDaySession) => workDaySession.organization
  )
  workDaySessions: WorkDaySession[];

  @OneToMany(
    () => WorkBreakSession,
    (breakSession) => breakSession.organization
  )
  workBreakSessions: WorkBreakSession[];
}
