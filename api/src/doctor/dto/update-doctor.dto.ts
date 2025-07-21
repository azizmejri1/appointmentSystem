import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateDoctorDto {

    @IsNotEmpty()
    @IsString()
    firstName?: string;

    @IsNotEmpty()
    @IsString()
    lastName?: string;
  
    @IsEmail()
    email?: string;
  
    @IsString()
    @MinLength(6)
    password?: string;
  
    @IsOptional()
    @IsString()
    speciality?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    adress?: string;

    @IsOptional()
    @IsString()
    credential_img?: string;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    keywords?: string[];
}
