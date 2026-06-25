import { IsString, IsIn, MinLength, MaxLength } from 'class-validator';

export class ChatDto {
  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  message: string;

  @IsString()
  @IsIn(['am-ET', 'om-ET', 'en-US'])
  language: string;
}
