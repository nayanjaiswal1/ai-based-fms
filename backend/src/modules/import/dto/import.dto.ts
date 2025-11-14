import { IsString, IsEnum, IsOptional, IsArray, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImportType, ImportStatus } from '@database/entities';

export class CreateImportDto {
  @ApiProperty({ enum: ImportType, example: ImportType.CSV })
  @IsEnum(ImportType)
  type: ImportType;

  @ApiProperty({ example: 'bank-statement-jan-2025.csv' })
  @IsString()
  fileName: string;

  @ApiPropertyOptional({ example: 'Monthly bank statement import' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ParseFileDto {
  @ApiProperty({ example: 'data:text/csv;base64,...' })
  @IsString()
  fileContent: string;

  @ApiProperty({ enum: ImportType, example: ImportType.CSV })
  @IsEnum(ImportType)
  fileType: ImportType;

  @ApiPropertyOptional({
    example: {
      dateColumn: 'Date',
      descriptionColumn: 'Description',
      amountColumn: 'Amount',
      dateFormat: 'MM/DD/YYYY',
    },
  })
  @IsOptional()
  @IsObject()
  mappingConfig?: Record<string, any>;
}

export class ConfirmImportDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  importId: string;

  @ApiProperty({
    type: [Object],
    example: [{ date: '2025-01-15', description: 'Coffee', amount: 5.5 }],
  })
  @IsArray()
  transactions: any[];

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsString()
  defaultAccountId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  autoCategorize?: boolean;
}

export class GetImportHistoryDto {
  @ApiPropertyOptional({ enum: ImportStatus })
  @IsOptional()
  @IsEnum(ImportStatus)
  status?: ImportStatus;

  @ApiPropertyOptional({ enum: ImportType })
  @IsOptional()
  @IsEnum(ImportType)
  type?: ImportType;
}
