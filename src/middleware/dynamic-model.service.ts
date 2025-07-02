// src/common/utils/mongoose-tenant.util.ts
import { Connection, Model, Schema } from "mongoose";
import { InjectConnection } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";

const modelCache: Map<string, Model<any>> = new Map();

@Injectable()
export class GetModelForCompany {
  constructor(
    @InjectConnection()
    private readonly connection: Connection
  ) {}

  /**
   * Returns a tenant-specific collection (model)
   * @param baseModelName - e.g., 'Customer'
   * @param schema - The schema definition
   * @param tenantId - e.g., 'tenant1'
   */
  getModelForTenant<T>(
    baseModelName: string,
    schema: Schema,
    tenantId: string
  ): Model<T> {
    const collectionName = `${baseModelName.toLowerCase()}_${tenantId}`;
    const modelKey = `${baseModelName}_${tenantId}`;

    if (modelCache.has(modelKey)) {
      return modelCache.get(modelKey) as Model<T>;
    }

    const model = this.connection.model<T>(
      modelKey,
      schema,
      collectionName // 👈 custom collection name in DB
    );

    modelCache.set(modelKey, model);
    return model;
  }
}
