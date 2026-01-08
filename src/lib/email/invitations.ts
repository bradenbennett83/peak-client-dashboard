/**
 * Send invitation email
 * 
 * This uses Supabase's built-in email functionality.
 * Configure email templates in Supabase Dashboard:
 * Authentication → Email Templates → Invite User
 */

interface SendInvitationEmailParams {
  to: string;
  inviteUrl: string;
  practiceName: string;
  inviterName: string;
  role: string;
}

export async function sendInvitationEmail({
  to,
  inviteUrl,
  practiceName,
  inviterName,
  role,
}: SendInvitationEmailParams): Promise<void> {
  // For now, we'll use a simple approach that logs the invitation
  // In production, you would:
  // 1. Use Supabase Auth's invite functionality, OR
  // 2. Use a service like Resend, SendGrid, or AWS SES
  
  console.log("=== INVITATION EMAIL ===");
  console.log(`To: ${to}`);
  console.log(`From: ${inviterName} at ${practiceName}`);
  console.log(`Role: ${role}`);
  console.log(`Invite URL: ${inviteUrl}`);
  console.log("========================");

  // TODO: Implement actual email sending
  // Option 1: Use Resend (recommended)
  /*
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'Peak Dental Studio <noreply@peakdentalstudio.com>',
    to,
    subject: `You've been invited to join ${practiceName}`,
    html: `
      <h1>You've been invited!</h1>
      <p>${inviterName} has invited you to join ${practiceName} as a ${role}.</p>
      <p><a href="${inviteUrl}">Accept Invitation</a></p>
      <p>This invitation will expire in 7 days.</p>
    `,
  });
  */

  // Option 2: Use SendGrid
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  await sgMail.send({
    to,
    from: 'noreply@peakdentalstudio.com',
    subject: `You've been invited to join ${practiceName}`,
    html: `...`,
  });
  */

  // For development, we just log it
  // The invitation URL is still returned in the API response for manual sharing
}

