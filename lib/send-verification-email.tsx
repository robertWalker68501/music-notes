import { Resend } from 'resend';

import VerificationEmail from '@/emails/verification-email';
import { captureE2EVerificationEmail } from '@/lib/e2e-verification';
const resend = new Resend(process.env.RESEND_API_KEY);

type EmailProps = {
  to: string;
  verificationUrl: string;
  userName: string;
};

export const sendVerificationEmail = async ({
  to,
  verificationUrl,
  userName,
}: EmailProps) => {
  const capturedForE2E = await captureE2EVerificationEmail({
    email: to,
    verificationUrl,
  });

  if (capturedForE2E) {
    return;
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: 'Welcome to MusicNotes',
    react: (
      <VerificationEmail
        verificationUrl={verificationUrl}
        userName={userName}
      />
    ),
  });
};
