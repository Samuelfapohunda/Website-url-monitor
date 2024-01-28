import nodemailer, { Transporter } from 'nodemailer';

const sendEmail = async (email: string, subject: string, content: string): Promise<void> => {
  try {
    const transport: Transporter = nodemailer.createTransport({
      host: process.env.email_host as string,
      port: parseInt(process.env.email_port as string, 10),
      auth: {
        user: process.env.email_user as string,
        pass: process.env.email_pass as string
      }
    });

    // Development
    const info = await transport.sendMail({
      from: process.env.email_user as string,
      to: email,
      subject: subject,
      text: content
    });

    console.log("Preview URL: " + nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log("Email Not Sent", error);
  }
};

export default sendEmail;
