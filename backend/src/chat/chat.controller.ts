import { Controller, Get, Post, Delete, Body, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async saveMessage(@Body() body: CreateMessageDto) {
    try {
      const saved = await this.chatService.saveMessage(body);
      await this.chatService.updateStats({ language: body.language, score: body.pronunciationScore });
      return saved;
    } catch (e) {
      return { error: e.message };
    }
  }

  @Get()
  async getMessages(@Query('limit') limit?: string) {
    try {
      return await this.chatService.getMessages(limit ? parseInt(limit, 10) : 100);
    } catch (e) {
      return { error: e.message, messages: [] };
    }
  }

  @Delete()
  async clearMessages() {
    try {
      return await this.chatService.clearMessages();
    } catch (e) {
      return { error: e.message };
    }
  }

  @Get('stats')
  async getStats() {
    try {
      return await this.chatService.getStats();
    } catch (e) {
      return { error: e.message };
    }
  }

  @Delete('stats')
  async clearStats() {
    try {
      return await this.chatService.clearStats();
    } catch (e) {
      return { error: e.message };
    }
  }
}
