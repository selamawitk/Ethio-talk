import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function sanitize(input: string): string {
  return input.replace(/[<>=]/g, '').slice(0, 10000);
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private prisma: PrismaService) {}

  private checkDb() {
    if (!this.prisma.isConnected) {
      throw new Error('Database not available. Please set DATABASE_URL.');
    }
  }

  async saveMessage(data: {
    transcription: string;
    response: string;
    language: string;
    pronunciationScore?: number;
  }) {
    this.checkDb();
    return this.prisma.chatMessage.create({
      data: {
        transcription: sanitize(data.transcription),
        response: sanitize(data.response),
        language: data.language,
        pronunciationScore: data.pronunciationScore,
      },
    });
  }

  async getMessages(limit = 100) {
    this.checkDb();
    return this.prisma.chatMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async clearMessages() {
    this.checkDb();
    await this.prisma.chatMessage.deleteMany();
    return { success: true };
  }

  async getStats() {
    this.checkDb();
    const [messages, stats] = await Promise.all([
      this.prisma.chatMessage.findMany(),
      this.prisma.userStats.findFirst(),
    ]);

    if (!stats) {
      return {
        totalRecordings: messages.length,
        languages: this.computeLanguages(messages),
        pronunciationScores: messages.map((m) => m.pronunciationScore).filter((s): s is number => s != null),
        lastUpdated: null,
      };
    }

    return {
      totalRecordings: stats.totalRecordings,
      languages: stats.languageData,
      pronunciationScores: stats.pronunciationScores,
      lastUpdated: stats.lastUpdated,
    };
  }

  async updateStats(data: { language: string; score?: number }) {
    this.checkDb();
    let stats = await this.prisma.userStats.findFirst();
    if (!stats) {
      stats = await this.prisma.userStats.create({ data: {} });
    }

    const languageData = (stats.languageData as Record<string, number>) || {};
    languageData[data.language] = (languageData[data.language] || 0) + 1;

    const pronunciationScores = stats.pronunciationScores;
    if (data.score != null) {
      pronunciationScores.push(data.score);
      if (pronunciationScores.length > 100) pronunciationScores.shift();
    }

    return this.prisma.userStats.update({
      where: { id: stats.id },
      data: {
        totalRecordings: stats.totalRecordings + 1,
        languageData,
        pronunciationScores,
        lastUpdated: new Date(),
      },
    });
  }

  async clearStats() {
    this.checkDb();
    await this.prisma.userStats.deleteMany();
    return { success: true };
  }

  private computeLanguages(messages: { language: string }[]) {
    const counts: Record<string, number> = {};
    for (const msg of messages) {
      counts[msg.language] = (counts[msg.language] || 0) + 1;
    }
    return counts;
  }
}
