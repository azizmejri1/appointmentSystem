import { IsNotEmpty, IsMongoId, IsNumber, IsOptional, IsString, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class PauseDto {
  @IsString()
  start: string;

  @IsString()
  end: string;
}

class AvailabilityDto {
  @IsString()
  day: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @ValidateNested({ each: true })
  @Type(() => PauseDto)
  @IsOptional()
  pauses?: PauseDto[];
}

export class CreateScheduleDto {
  @IsMongoId()
  doctorId: string;

  @ValidateNested({ each: true })
  @Type(() => AvailabilityDto)
  @ArrayMinSize(1)
  availability: AvailabilityDto[];

  @IsNumber()
  appointmentDuration: number;
}
