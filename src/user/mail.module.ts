import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // bắt buộc khi dùng port 465
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass: process.env.GMAIL_PASSWORD,
        },
      },
      defaults: {
        from: process.env.GMAIL_EMAIL,
      },
    }),
  ],
  exports: [MailerModule],
})
export class MailModule {}