import nodemailer from 'nodemailer'
import 'dotenv/config.js'

export const sendMail = async ({ from, to, subject, text, attachments = [] }) => {
    console.log('sendMail parameters:', { from, to, subject, text, attachments});
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    
        const mappedAttachments = attachments.map(att => ({
            filename: att.name,
            content: att.data,
            encoding: 'base64' 
        }));
        let mailOptions = {
            from:`"${from}" <${process.env.EMAIL}>`,
            to: to,
            subject: subject,
            text: text,
            attachments: mappedAttachments
        };

        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.log('Error sending email:', error);
        throw error;
    }
};
