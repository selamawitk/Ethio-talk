import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  check() {
    return {
      status: 'ok',
      database: this.prisma.isConnected ? 'connected' : 'disconnected',
    };
  }
}
