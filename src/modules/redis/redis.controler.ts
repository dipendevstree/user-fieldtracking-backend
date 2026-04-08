import { Controller, Get, Post, Delete, Body } from '@nestjs/common';
import { RedisService } from './redis.service'; // Ensure the correct path
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Redis')
@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Post('create')
  async setData(@Body() body: { key: string; value: any }) {
    const defaultData = { key: '1', value: 'sagar' };
    const { key, value } = body || defaultData;
    await this.redisService.setValue(key, value);
    return { message: 'Data set successfully!', key, value };
  }

  @Get('all')
  async getAllData() {
    const data = await this.redisService.getAllSchedules();
    return { message: 'Retrieved all data successfully!', data };
  }

  @Delete('deleteAll')
  async deleteAllData() {
    const result = await this.redisService.deleteAllSchedules();
    return { message: 'All data deleted successfully!', result };
  }
}
