import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { createClient } from "redis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client;
  constructor() {
    this.client = createClient({
      url: "redis://localhost:6379",
    });

    this.client.connect().catch(console.error);
  }

  // Set a value in Redis with 1-day expiration
  async setValue(key: string, value: any): Promise<void> {
    // 86400 seconds = 24 hours
    await this.client.set(key, JSON.stringify(value), {
      EX: 86400, // TTL in seconds
    });
  }
  // Get a value from Redis
  async getValue(key: string): Promise<any> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  // Delete a specific key in Redis
  async delValue(key: string): Promise<number> {
    return await this.client.del(key);
  }

  // Get all schedules stored in Redis
  async getAllSchedules(): Promise<any[]> {
    const keys = await this.client.keys("schedule:*");
    const scheduleDataPromises = keys.map(async (key) => {
      const data = await this.client.get(key);
      return { id: key.split(":")[1], ...JSON.parse(data) };
    });
    return Promise.all(scheduleDataPromises);
  }

  // Add multiple schedules to Redis
  async addMultipleLatLong(schedules: any[]): Promise<any[]> {
    const schedulePromises = schedules.map((schedule) => {
      return this.client.set(schedule.id, JSON.stringify(schedule), {});
    });
    return await Promise.all(schedulePromises);
  }

  // Delete all schedules from Redis
  async deleteAllSchedules(): Promise<number> {
    const keys = await this.client.keys("schedule:*");
    if (keys.length === 0) {
      return 0;
    }
    return await this.client.del(keys);
  }

  // Redis List Push (for user tracking)
  async lpush(key: string, value: any): Promise<void> {
    await this.client.lPush(key, JSON.stringify(value));
  }

  // Redis List Range (read all tracking data for a key)
  async lrange<T = any>(key: string, start = 0, stop = -1): Promise<T[]> {
    try {
      const items = await this.client.lRange(key, start, stop);
      return items.map((item) => JSON.parse(item));
    } catch (error) {
      console.error("Error fetching data from Redis:", error);
      return [];
    }
  }

  // Optional TTL for keys (expire after N seconds)
  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  // Clean up Redis client when module is destroyed
  onModuleDestroy(): void {
    this.client.quit().catch(console.error);
  }
}
