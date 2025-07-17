import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.schema';
import { Doctor } from 'src/doctor/doctor.schema';
import { Patient } from 'src/patient/patient.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Doctor.name) private doctorModel: Model<Doctor>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    return user;
  }

  async login(email: string, password: string) {
      await this.validateUser(email,password);
      const user = await this.userModel.findOne({ email });
      if (!user) throw new UnauthorizedException('Invalid email or password');

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new UnauthorizedException('Invalid email or password');

      let role: 'doctor' | 'patient' | null = null;
      let profile = null;

      if (await this.doctorModel.exists({ user: user._id })) {
        role = 'doctor';
        profile = await this.doctorModel.findOne({ user: user._id });
      } else if (await this.patientModel.exists({ user: user._id })) {
        role = 'patient';
        profile = await this.patientModel.findOne({ user: user._id });
      } else {
        throw new UnauthorizedException('User does not belong to doctor or patient.');
      }

      const token = this.jwtService.sign({
        sub: user._id,
        email: user.email,
        role:role,
      });

      return {
        access_token: token,
        user,
        role,
        profile,
      };
}

}
