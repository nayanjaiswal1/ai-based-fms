import { IsString, IsNotEmpty, MinLength, IsOptional, MaxLength } from 'class-validator';

export class DeleteAccountDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
