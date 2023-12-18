import nodemailer from "nodemailer"

export const sendEmail = async (options) => {
const transporter = nodemailer.createTransport({  
  host: process.env.SMTP_HOST,  
  port: process.env.SMTP_PORT,  
  auth: {    
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  },
});


  // send email with defined transport object
  let message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`, // sender address
    to: options.email, // list of receivers. - Options is an argument
    subject: options.subject, // Subject line
    text: options.message, // plain text body    
  };

  const info = await transporter.sendMail(message)

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  //
  // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
  //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
  //       <https://github.com/forwardemail/preview-email>
  //
}
