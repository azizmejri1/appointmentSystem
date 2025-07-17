import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateDoctorDto {

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
    specialty?: string;

    @IsOptional()
    @IsString()
    credential_img?: string;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;
}
