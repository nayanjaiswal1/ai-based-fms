import { IsEnum, IsString, IsOptional, IsBoolean, IsNumber, IsObject, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AIProvider } from '@database/entities';

export class ModelParametersDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTokens?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  topP?: number;

  @IsOptional()
  @IsNumber()
  frequencyPenalty?: number;

  @IsOptional()
  @IsNumber()
  presencePenalty?: number;

  @IsOptional()
  @IsString()
  systemPrompt?: string;
}

export class FeaturesDto {
  @IsOptional()
  @IsBoolean()
  emailParsing?: boolean;

  @IsOptional()
  @IsBoolean()
  categorization?: boolean;

  @IsOptional()
  @IsBoolean()
  insights?: boolean;

  @IsOptional()
  @IsBoolean()
  chat?: boolean;
}

export class CreateAiConfigDto {
  @IsEnum(AIProvider)
  provider: AIProvider;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiEndpoint?: string;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  timeout?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ModelParametersDto)
  modelParameters?: ModelParametersDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FeaturesDto)
  features?: FeaturesDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAiConfigDto {
  @IsOptional()
  @IsEnum(AIProvider)
  provider?: AIProvider;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiEndpoint?: string;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  timeout?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ModelParametersDto)
  modelParameters?: ModelParametersDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FeaturesDto)
  features?: FeaturesDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
