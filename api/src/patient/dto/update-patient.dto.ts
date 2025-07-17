import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePatientDto {
    @IsNotEmpty()
    @IsString()
    fullName?: string;
  
    @IsEmail()
    email?: string;
  
    @IsString()
    @MinLength(6)
    password?: string;
  
    @IsOptional()
    @IsString()
    gender?: string;
  
    @IsOptional()
    @IsString()
    phoneNumber?: string;


  }
