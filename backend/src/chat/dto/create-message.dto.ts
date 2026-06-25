import { IsString, IsOptional, IsInt, Min, Max, MinLength, MaxLength, IsIn } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  transcription: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  response: string;

  @IsString()
  @IsIn(['am-ET', 'om-ET', 'en-US'])
  language: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  pronunciationScore?: number;
}
