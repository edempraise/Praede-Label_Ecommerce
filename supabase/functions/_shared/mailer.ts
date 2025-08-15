import { createTransport } from "https://esm.sh/nodemailer";

export const sendMail = async (options: {
  to: string;
  subject: string;
  html: string;
}) => {
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: Deno.env.get("GMAIL_USER"),
      pass: Deno.env.get("GMAIL_PASS"),
    },
  });

  const mailOptions = {
    from: Deno.env.get("GMAIL_USER"),
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};
