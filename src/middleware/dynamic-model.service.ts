import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection, Schema, Model } from "mongoose";

/**
 * Caches dynamically created tenant models so we don't
 * re-register the same schema for each tenant repeatedly.
 */
const modelCache = new Map<string, Model<any>>();

@Injectable()
export class GetModelForCompany {
  constructor(
    @InjectConnection()
    private readonly connection: Connection
  ) {}

  /**
   * Returns a tenant-specific model instance bound to its own collection.
   *
   * Example:
   *   const customerModel = getModelForTenant('Customer', schema, 'tenantA');
   */
  getModelForTenant<T = any>(
    baseModelName: string,
    schema: Schema,
    tenantId: string
  ): Model<any> {
    // Lower-case collection name per tenant, e.g. "customer_tenantA"
    const collectionName = `${baseModelName.toLowerCase()}_${tenantId}`;
    const modelKey = `${baseModelName}_${tenantId}`;

    // Reuse from cache if already registered
    const cached = modelCache.get(modelKey);
    if (cached) return cached;

    // Create and cache new model
    const model = this.connection.model(modelKey, schema, collectionName);
    modelCache.set(modelKey, model);

    return model;
  }
}
