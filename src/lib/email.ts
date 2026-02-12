/**
 * Shared email sending for applicant and staff notifications.
 * Primary provider on Vercel: Microsoft Graph API over HTTPS.
 * Fallback provider: SMTP via Nodemailer.
 */

import nodemailer from 'nodemailer';
import { existsSync, readFileSync } from 'fs';
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

export type EmailSendResult =
  | { sent: true; messageId?: string }
  | {
      sent: false;
      reason:
        | 'graph_not_configured'
        | 'graph_auth_error'
        | 'graph_send_error'
        | 'smtp_not_configured'
        | 'from_email_missing'
        | 'smtp_error';
      error: string;
      diagnostics?: {
        provider?: 'graph' | 'smtp';
        graphMailbox?: string;
        hasTenantId?: boolean;
        hasClientId?: boolean;
        hasClientSecret?: boolean;
        host: string;
        port: number;
        secure: boolean;
        hasUser: boolean;
        hasPass: boolean;
        hasFromEmail: boolean;
      };
    };

function getSmtpLogoAsset(): {
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

function getGraphLogoAsset(): {
  src: string;
  attachments?: Array<Record<string, unknown>>;
} {
  if (existsSync(LOGO_FILE_PATH)) {
    const contentBytes = readFileSync(LOGO_FILE_PATH).toString('base64');
    return {
      src: `cid:${LOGO_CID}`,
      attachments: [
        {
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: 'eaglehr-logo.png',
          contentType: 'image/png',
          contentId: LOGO_CID,
          isInline: true,
          contentBytes,
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

function getSmtpDiagnostics() {
  const host = process.env.SMTP_HOST || 'smtp.office365.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  return {
    host,
    port,
    secure: port === 465,
    hasUser: Boolean(process.env.SMTP_USER?.trim()),
    hasPass: Boolean(process.env.SMTP_PASS?.trim()),
    hasFromEmail: Boolean(FROM_EMAIL?.trim()),
  };
}

function getGraphConfig() {
  const tenantId = process.env.MS_TENANT_ID?.trim() || '';
  const clientId = process.env.MS_CLIENT_ID?.trim() || '';
  const clientSecret = process.env.MS_CLIENT_SECRET?.trim() || '';
  const mailbox =
    process.env.MS_GRAPH_MAILBOX?.trim() ||
    process.env.SMTP_USER?.trim() ||
    process.env.SMTP_FROM_EMAIL?.trim() ||
    '';
  return {
    tenantId,
    clientId,
    clientSecret,
    mailbox,
    enabled: Boolean(tenantId && clientId && clientSecret && mailbox),
  };
}

async function sendViaMicrosoftGraph(params: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<Record<string, unknown>>;
}): Promise<EmailSendResult> {
  const graph = getGraphConfig();
  if (!graph.enabled) {
    return {
      sent: false,
      reason: 'graph_not_configured',
      error: 'MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, or MS_GRAPH_MAILBOX missing.',
      diagnostics: {
        provider: 'graph',
        graphMailbox: graph.mailbox || undefined,
        hasTenantId: Boolean(graph.tenantId),
        hasClientId: Boolean(graph.clientId),
        hasClientSecret: Boolean(graph.clientSecret),
        ...getSmtpDiagnostics(),
      },
    };
  }

  const tokenRes = await fetch(
    `https://login.microsoftonline.com/${graph.tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: graph.clientId,
        client_secret: graph.clientSecret,
        grant_type: 'client_credentials',
        scope: 'https://graph.microsoft.com/.default',
      }).toString(),
    }
  );

  if (!tokenRes.ok) {
    const body = await tokenRes.text().catch(() => '');
    return {
      sent: false,
      reason: 'graph_auth_error',
      error: `Graph token request failed (${tokenRes.status}): ${body.slice(0, 300)}`,
      diagnostics: {
        provider: 'graph',
        graphMailbox: graph.mailbox,
        hasTenantId: true,
        hasClientId: true,
        hasClientSecret: true,
        ...getSmtpDiagnostics(),
      },
    };
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    return {
      sent: false,
      reason: 'graph_auth_error',
      error: 'Graph token response missing access_token.',
      diagnostics: {
        provider: 'graph',
        graphMailbox: graph.mailbox,
        hasTenantId: true,
        hasClientId: true,
        hasClientSecret: true,
        ...getSmtpDiagnostics(),
      },
    };
  }

  const sendRes = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(graph.mailbox)}/sendMail`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject: params.subject,
          body: { contentType: 'HTML', content: params.html },
          from: {
            emailAddress: { address: graph.mailbox, name: FROM_NAME },
          },
          toRecipients: [{ emailAddress: { address: params.to } }],
          ...(params.attachments?.length ? { attachments: params.attachments } : {}),
        },
        saveToSentItems: true,
      }),
    }
  );

  if (!sendRes.ok) {
    const body = await sendRes.text().catch(() => '');
    return {
      sent: false,
      reason: 'graph_send_error',
      error: `Graph sendMail failed (${sendRes.status}): ${body.slice(0, 300)}`,
      diagnostics: {
        provider: 'graph',
        graphMailbox: graph.mailbox,
        hasTenantId: true,
        hasClientId: true,
        hasClientSecret: true,
        ...getSmtpDiagnostics(),
      },
    };
  }

  return { sent: true, messageId: 'graph-sendmail-accepted' };
}

/**
 * Send "application received" confirmation to the applicant (and your records).
 * Provider order: Microsoft Graph (recommended on Vercel) -> SMTP fallback.
 */
export async function sendApplicationReceivedEmail(params: {
  to: string;
  applicantFirstName: string;
  jobTitle: string;
  companyName: string;
  applicationId?: string;
}): Promise<EmailSendResult> {
  const { to, applicantFirstName, jobTitle } = params;
  const subject = `Application received – ${jobTitle} at Eagle HR Consultants`;
  const applicant = applicantFirstName || 'Applicant';
  const smtpLogoAsset = getSmtpLogoAsset();
  const graphLogoAsset = getGraphLogoAsset();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px;">
        <tr>
          <td style="padding: 24px 0 32px; text-align: center; border-bottom: 1px solid #e5e7eb;">
            <img src="${graphLogoAsset.src}" alt="Eagle HR Consultants" width="180" style="display: inline-block; max-width: 180px; height: auto;" />
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

  const graphResult = await sendViaMicrosoftGraph({
    to,
    subject,
    html,
    attachments: graphLogoAsset.attachments,
  });
  if (graphResult.sent) return graphResult;

  const transporter = getTransporter();
  if (!transporter) {
    return graphResult;
  }
  if (!FROM_EMAIL) {
    return {
      sent: false,
      reason: 'from_email_missing',
      error: 'From email is missing. Set SMTP_USER or SMTP_FROM_EMAIL.',
      diagnostics: {
        provider: 'smtp',
        ...getSmtpDiagnostics(),
      },
    };
  }

  try {
    const info = (await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      attachments: smtpLogoAsset.attachments,
    })) as { messageId?: string };
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      sent: false,
      reason: 'smtp_error',
      error: message,
      diagnostics: {
        provider: 'smtp',
        ...getSmtpDiagnostics(),
      },
    };
  }
}
