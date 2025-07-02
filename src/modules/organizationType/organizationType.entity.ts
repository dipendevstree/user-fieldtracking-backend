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
@Entity({ name: "organizationType", schema: "public" })
export class OrganizationType {
  @PrimaryGeneratedColumn("uuid")
  organizationTypeId: string;

  @Column()
  organizationTypeName: string;

  @Column()
  organizationTypeKey: string;

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

  @ManyToOne(() => SuperAdmin, (superAdmin) => superAdmin.organizationType)
  @JoinColumn({ name: "createdBy" })
  createdByData: SuperAdmin;

  @ManyToOne(() => SuperAdmin, (superAdmin) => superAdmin.organizationTypeData)
  @JoinColumn({ name: "updatedBy" })
  updatedByData: SuperAdmin;

  @OneToMany(
    () => Organization,
    (organization) => organization.organizationType
  )
  organization: Organization[];
}
