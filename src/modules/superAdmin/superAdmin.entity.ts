import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from "typeorm";
import { EmployeeRang } from "../employeeRang/employeeRang.entity";
import { Menu } from "../menu/menu.entity";
import { Industry } from "../industry/industry.entity";
import { Organization } from "../organization/organization.entity";
import { Department } from "../department/department.entity";
import { OrganizationType } from "../organizationType/organizationType.entity";
import { Role } from "../role/role.entity";
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

  @OneToMany(() => EmployeeRang, (employeeRang) => employeeRang.createdByData)
  employeeRang: EmployeeRang[];

  @OneToMany(() => EmployeeRang, (employeeRang) => employeeRang.updatedByData)
  employeeRangData: EmployeeRang[];

  @OneToMany(() => Menu, (menu) => menu.createdByData)
  menu: Menu[];

  @OneToMany(() => Menu, (menu) => menu.updatedByData)
  menuData: Menu[];

  @OneToMany(() => Industry, (industry) => industry.createdByData)
  industry: Industry[];

  @OneToMany(() => Industry, (industry) => industry.updatedByData)
  industryData: Industry[];

  @OneToMany(() => Department, (department) => department.createdByData)
  department: Department[];

  @OneToMany(() => Department, (department) => department.updatedByData)
  departmentData: Department[];

  @OneToMany(
    () => OrganizationType,
    (organizationType) => organizationType.createdByData
  )
  organizationType: OrganizationType[];

  @OneToMany(
    () => OrganizationType,
    (organizationType) => organizationType.updatedByData
  )
  organizationTypeData: OrganizationType[];

  @OneToMany(() => Organization, (organization) => organization.createdByData)
  organization: Organization[];

  @OneToMany(() => Role, (organization) => organization.superAdminCreatedByData)
  role: Role[];

  @OneToMany(() => User, (organization) => organization.superAdminCreatedByData)
  user: User[];

  @OneToMany(() => Organization, (organization) => organization.updatedByData)
  organizationData: Organization[];
}
