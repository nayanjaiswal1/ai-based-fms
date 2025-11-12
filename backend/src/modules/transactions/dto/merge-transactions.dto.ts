import { IsString, IsArray, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MergeTransactionsDto {
  @ApiProperty({
    example: ['uuid1', 'uuid2', 'uuid3'],
    description: 'Array of transaction IDs to merge into the primary transaction',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  duplicateIds: string[];
}

export class MarkNotDuplicateDto {
  @ApiProperty({
    example: 'uuid',
    description: 'ID of the transaction to mark as not a duplicate',
  })
  @IsString()
  comparedWithId: string;
}
