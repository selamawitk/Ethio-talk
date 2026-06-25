import { Controller, Get, Post, Delete, Body, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async saveMessage(@Body() body: CreateMessageDto) {
    const saved = await this.chatService.saveMessage(body);
    await this.chatService.updateStats({ language: body.language, score: body.pronunciationScore });
    return saved;
  }

  @Get()
  async getMessages(@Query('limit') limit?: string) {
    return this.chatService.getMessages(limit ? parseInt(limit, 10) : 100);
  }

  @Delete()
  async clearMessages() {
    return this.chatService.clearMessages();
  }

  @Get('stats')
  async getStats() {
    return this.chatService.getStats();
  }

  @Delete('stats')
  async clearStats() {
    return this.chatService.clearStats();
  }
}
