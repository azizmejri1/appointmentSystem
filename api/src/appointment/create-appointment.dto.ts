import { IsDateString, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  dateTime: string; // e.g., 2025-07-15

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsMongoId()
  doctor: string;

  @IsMongoId()
  patient: string;
}
