import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST')!, 
      port: parseInt(this.configService.get<string>('SMTP_PORT') ?? '465'),
      secure: true,
      auth: {
        user: this.configService.get<string>('SMTP_USER')!,
        pass: this.configService.get<string>('SMTP_PASS')!,
      },
    });
  }


  


}