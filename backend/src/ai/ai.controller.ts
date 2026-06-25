import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { TranslateDto } from './dto/translate.dto';

@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: ChatDto) {
    return this.aiService.getResponse(body.message, body.language);
  }

  @Post('translate')
  async translate(@Body() body: TranslateDto) {
    const result = await this.aiService.translateText(body.text, body.targetLanguage);
    return { text: result };
  }
}
