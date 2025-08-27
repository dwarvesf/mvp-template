import { Resend } from 'resend';
import VerifyEmail from '@/emails/VerifyEmail';

export async function POST(request: Request) {
  const { to, url } = await request.json();
  const resend = new Resend(process.env.RESEND_API_KEY);
  const resp = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: 'Verify your email',
    react: VerifyEmail({ url }),
  });
  return Response.json(resp);
}
