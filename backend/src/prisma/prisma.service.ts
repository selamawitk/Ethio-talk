import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public isConnected = false;

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      this.logger.warn('DATABASE_URL not set — running without database');
      return;
    }
    for (let i = 0; i < 5; i++) {
      try {
        await this.$connect();
        this.isConnected = true;
        this.logger.log('Connected to database');
        return;
      } catch (err) {
        this.logger.warn(`Database connection attempt ${i + 1} failed: ${err}`);
        if (i === 4) {
          this.logger.error('All database connection attempts failed — running without database');
          return;
        }
        await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
      }
    }
  }

  async onModuleDestroy() {
    if (!this.isConnected) return;
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }
}
