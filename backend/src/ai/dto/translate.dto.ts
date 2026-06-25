import { IsString, IsIn, MinLength, MaxLength } from 'class-validator';

export class TranslateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  text: string;

  @IsString()
  @IsIn(['am-ET', 'om-ET', 'en-US'])
  targetLanguage: string;
}
