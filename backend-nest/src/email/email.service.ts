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

  private getFromAddress(): string {
    return this.configService.get<string>('SMTP_USER')!;
  }

  private async sendMail(options: nodemailer.SendMailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: this.getFromAddress(),
      ...options,
    });
  }

  async sendExportConfirmation(to: string): Promise<void> {
    const subject = 'We received your data export request';
    const text = 'We received a request to export your data.';
    const html = `
      <p>We received a request to export your data.</p>
    `;

    await this.sendMail({ to, subject, text, html });
  }

  async sendDeletionConfirmation(to: string): Promise<void> {
    const subject = 'Confirm your account deletion request';
    const text = 'We received a request to delete your account data.';
    const html = `
      <p>we recieved a request to delete your account data.</p>
      <p>If you did not make this request, please ignore this email.</p>
    `;
    console.log('Sending deletion confirmation email to:', to);
    await this.sendMail({ to, subject, text, html });
    console.log('Deletion confirmation email sent to:', to);
  }

  async sendAccountCreationConfirmation(to: string, username: string): Promise<void> {
    const subject = 'Welcome to MovieDB!';
    const text = `Your account has been successfully created, ${username}!`;
    const html = `
      <p>Welcome to MovieDB, ${username}! </p>
      <p>Your account has been successfully created.</p>
    `;

    await this.sendMail({ to, subject, text, html });
  }

}