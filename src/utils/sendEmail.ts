import nodeMailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport/index.js";
import SMTPTransport from "nodemailer/lib/smtp-transport/index.js";

export const sendEmail = async (options) => {
  const transporter: nodeMailer.Transporter<SMTPTransport.SentMessageInfo> =
    nodeMailer.createTransport({
      service: process.env.SMPT_SERVICE,
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD,
      },
    });

  const mailOptions: MailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transporter.sendMail(mailOptions);
};
