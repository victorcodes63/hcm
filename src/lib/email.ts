/**
 * Shared email sending for applicant and staff notifications.
 * Uses SMTP (e.g. recruitment@eaglehr.co.ke or Microsoft 365).
 * Set SMTP_USER and SMTP_PASS to enable; if unset, sending is a no-op.
 */

import nodemailer from 'nodemailer';
import { existsSync } from 'fs';
import { resolve } from 'path';

const FROM_NAME = process.env.SMTP_FROM_NAME || 'Eagle HR Recruitment';
const FROM_EMAIL = process.env.SMTP_USER || process.env.SMTP_FROM_EMAIL || '';

/** Base URL for logo in email (must be absolute). Set NEXT_PUBLIC_SITE_URL in production. */
const BASE_URL =
  (typeof process.env.NEXT_PUBLIC_SITE_URL === 'string' && process.env.NEXT_PUBLIC_SITE_URL.trim()) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  'https://www.eaglehr.co.ke';
const LOGO_URL = `${BASE_URL.replace(/\/$/, '')}/images/logo/logo_dark_ubxaCll.png`;
const LOGO_CID = 'eaglehr-logo';
const LOGO_FILE_PATH = resolve(process.cwd(), 'public/images/logo/logo_dark_ubxaCll.png');

function getLogoEmailAsset(): {
  src: string;
  attachments?: Array<{ filename: string; path: string; cid: string }>;
} {
  if (existsSync(LOGO_FILE_PATH)) {
    return {
      src: `cid:${LOGO_CID}`,
      attachments: [
        {
          filename: 'eaglehr-logo.png',
          path: LOGO_FILE_PATH,
          cid: LOGO_CID,
        },
      ],
    };
  }
  return { src: LOGO_URL };
}

function getTransporter(): nodemailer.Transporter | null {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.office365.com',
    port,
    secure,
    auth: { user, pass },
  });
}

/**
 * Send "application received" confirmation to the applicant (and your records).
 * No-op if SMTP is not configured.
 */
export async function sendApplicationReceivedEmail(params: {
  to: string;
  applicantFirstName: string;
  jobTitle: string;
  companyName: string;
  applicationId?: string;
}): Promise<{ sent: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter || !FROM_EMAIL) {
    return { sent: false };
  }

  const { to, applicantFirstName, jobTitle } = params;
  const subject = `Application received – ${jobTitle} at Eagle HR Consultants`;
  const applicant = applicantFirstName || 'Applicant';
  const logoAsset = getLogoEmailAsset();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px;">
        <tr>
          <td style="padding: 24px 0 32px; text-align: center; border-bottom: 1px solid #e5e7eb;">
            <img src="${logoAsset.src}" alt="Eagle HR Consultants" width="180" style="display: inline-block; max-width: 180px; height: auto;" />
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 0 24px;">
            <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6;">Dear ${applicant},</p>
            <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6;">We acknowledge receipt of your application for the position of <strong>${jobTitle}</strong> at Eagle HR Consultants.</p>
            <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6;">Thank you for showing interest in joining our team.</p>
            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6;">Should your profile match our requirements, a member of our recruitment team will get in touch with you.</p>
            <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6;">We appreciate the effort you have put into your application and look forward to working together.</p>
            <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6;">Sincerely,</p>
            <p style="margin: 0 0 4px; font-size: 16px; line-height: 1.6;"><strong>Recruitment Team</strong></p>
            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #0B1D39;"><strong>Eagle HR Consultants</strong></p>
          </td>
        </tr>
        <tr>
          <td style="padding: 24px 0; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #6b7280;">Eagle HR Consultants recruits and hires people from a range of backgrounds, including people with disabilities. If you need special arrangements or accommodations during the recruitment process, kindly reach out as soon as possible to help us better understand what accommodations would be helpful.</p>
          </td>
        </tr>
      </table>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      attachments: logoAsset.attachments,
    });
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Send application-received email error:', message);
    return { sent: false, error: message };
  }
}
