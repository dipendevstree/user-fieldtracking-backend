import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  DeleteDateColumn,
} from "typeorm";
import { Organization } from "../organization/organization.entity";
import { Role } from "../role/role.entity";
import { OrganizationMenu } from "../organizationMenu/organizationMenu.entity";
import { Permission } from "../permission/permission.entity";
import { USER_STATUS } from "helper/constants";
import { Department } from "../department/department.entity";
import { UserTerritory } from "../userTerritory/userTerritory.entity";
import { CustomerType } from "../customerType/customerType.entity";
import { Customer } from "../customer/customer.entity";
import { CustomerContact } from "../customerContact/customerContact.entity";
import { LiveTracking } from "../liveTracking/liveTracking.entity";
import { Visit } from "../visit/visit.entity";
import { SuperAdmin } from "../superAdmin/superAdmin.entity";
import { WorkDaySession } from "../workDaySession/workDaySession.entity";
import { WorkBreakSession } from "../workBreakSession/workBreakSession.entity";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  otp: string;

  @Column({ length: 255 })
  firstName: string;

  @Column({ length: 255 })
  lastName: string;

  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  @Column({ nullable: true, default: "+91" })
  countryCode: string;

  @Column({ length: 255, nullable: true })
  jobTitle: string;

  @Column({ length: 255, nullable: true, default: "tier_1" })
  tierkey: string;

  @Column()
  schemaName: string;

  @Column({ nullable: true })
  departmentId: string;

  @Column({
    nullable: true,
    length: 255,
    default: USER_STATUS.CREATED,
    enum: USER_STATUS,
  })
  status: string;

  @Column({ nullable: true })
  active_token: string;

  @Column({ type: "timestamp", nullable: true })
  resetTokenExpires: Date;

  @Column({ name: "roleId", nullable: false })
  roleId: string;

  @Column({ name: "reportingToRoleId", nullable: true })
  reportingToRoleId: string;

  @Column()
  organizationID: string;

  @Column({ nullable: true })
  territoryId: string;

  @Column({ default: true })
  isWebUser: boolean;

  @Column({ default: false })
  isPasswordChanged: boolean;

  @ManyToOne(() => UserTerritory, (territory) => territory.user)
  @JoinColumn({ name: "territoryId" })
  territory: UserTerritory;

  @Column({ nullable: true })
  superAdminCreatedBy: string;

  @DeleteDateColumn({ name: "deletedDate", nullable: true })
  deletedDate?: Date;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  // Relations

  @ManyToOne(() => Organization, (organization) => organization.users)
  @JoinColumn({ name: "organizationID" })
  organization: Organization;

  @ManyToOne(() => Department, (organization) => organization.user)
  @JoinColumn({ name: "departmentId" })
  department: Department;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: "roleId" })
  role: Role;

  @ManyToOne(() => Role, (role) => role.reportingUsers)
  @JoinColumn({ name: "reportingToRoleId" })
  reportingToRole: Role;

  @OneToMany(() => Role, (role) => role.createdByData)
  roleData: Role[];

  @OneToMany(() => Role, (role) => role.updatedByData)
  roleDetails: Role[];

  @OneToMany(
    () => OrganizationMenu,
    (organizationMenu) => organizationMenu.createdByData
  )
  organizationMenu: OrganizationMenu[];

  @OneToMany(
    () => OrganizationMenu,
    (organizationMenu) => organizationMenu.updatedByData
  )
  organizationMenuData: OrganizationMenu[];

  @OneToMany(() => Permission, (permissions) => permissions.createdByData)
  permissions: Permission[];

  @OneToMany(() => Permission, (permissions) => permissions.updatedByData)
  permissionsData: Permission[];

  @OneToMany(() => OrganizationMenu, (menu) => menu.createdByData)
  createdOrganizationMenus: OrganizationMenu[];

  @OneToMany(() => OrganizationMenu, (menu) => menu.updatedByData)
  updatedOrganizationMenus: OrganizationMenu[];

  @ManyToMany(() => User, (user) => user.reportingUsers)
  @JoinTable({
    name: "userReporting",
    joinColumn: {
      name: "userId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "reportingToId",
      referencedColumnName: "id",
    },
  })
  reportingTo: User[];

  @ManyToMany(() => User, (user) => user.reportingTo)
  reportingUsers: User[];

  @ManyToOne(() => SuperAdmin, (superAdmin) => superAdmin.user)
  @JoinColumn({ name: "superAdminCreatedBy" })
  superAdminCreatedByData: SuperAdmin;

  @OneToMany(() => CustomerType, (customerType) => customerType.createdByData)
  customerTypeCreated: CustomerType[];

  @OneToMany(() => CustomerType, (customerType) => customerType.updatedByData)
  customerTypeUpdated: CustomerType[];

  @OneToMany(() => Customer, (customer) => customer.createdByData)
  customerCreated: Customer[];

  @OneToMany(() => Customer, (customer) => customer.updatedByData)
  customerUpdated: Customer[];

  @OneToMany(() => CustomerContact, (contact) => contact.createdByData)
  customerContactCreated: CustomerContact[];

  @OneToMany(() => CustomerContact, (contact) => contact.updatedByData)
  customerContactUpdated: CustomerContact[];

  @OneToMany(() => CustomerContact, (contact) => contact.assignUser)
  customerContactAssigned: CustomerContact[];

  @OneToMany(() => LiveTracking, (tracking) => tracking.createdByData)
  liveTrackingCreated: LiveTracking[];

  @OneToMany(() => LiveTracking, (tracking) => tracking.updatedByData)
  liveTrackingUpdated: LiveTracking[];

  @OneToMany(() => LiveTracking, (tracking) => tracking.user)
  liveTrackingUser: LiveTracking[];

  @OneToMany(() => Visit, (visit) => visit.createdByData)
  visits: Visit[];

  @OneToMany(() => Visit, (visit) => visit.updatedByData)
  updatedVisits: Visit[];

  @OneToMany(() => Visit, (rep) => rep.salesRepresentativeUser)
  salesRepresentatives: Visit[];

  @OneToMany(
    () => WorkDaySession,
    (workDaySession) => workDaySession.createdByData
  )
  workDaySessionCreated: WorkDaySession[];

  @OneToMany(
    () => WorkDaySession,
    (workDaySession) => workDaySession.updatedByData
  )
  workDaySessionUpdated: WorkDaySession[];
  @OneToMany(
    () => WorkBreakSession,
    (breakSession) => breakSession.createdByData
  )
  workBreakSessionCreated: WorkBreakSession[];

  @OneToMany(
    () => WorkBreakSession,
    (breakSession) => breakSession.updatedByData
  )
  workBreakSessionUpdated: WorkBreakSession[];

  @OneToMany(() => WorkBreakSession, (breakSession) => breakSession.user)
  workBreakSessions: WorkBreakSession[];

  @OneToMany(() => WorkDaySession, (session) => session.user)
  workDaySessions: WorkDaySession[];
}
