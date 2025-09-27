import nodemailer from 'nodemailer';
import { logger } from './logger';

export interface EmailData {
  to: string;
  subject: string;
  templateId?: string;
  data?: Record<string, any>;
  html?: string;
  text?: string;
}

// Email configuration
const createTransporter = () => {
  if (process.env['SENDGRID_API_KEY']) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env['SENDGRID_API_KEY'],
      },
    });
  } else if (process.env['NODE_ENV'] === 'development') {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass',
      },
    });
  } else {
    logger.warn('No email configuration found');
    return null;
  }
};

const transporter = createTransporter();

// Simple template engine (replace placeholders in HTML)
const renderTemplate = (template: string, data: Record<string, any>): string => {
  return Object.keys(data).reduce((html, key) => {
    return html.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
  }, template);
};

// Send email utility
const sendEmail = async (options: EmailData): Promise<boolean> => {
  if (!transporter) {
    logger.warn('Email transporter not configured');
    return false;
  }

  // Skip email sending in development if no valid SendGrid key
  if (process.env['NODE_ENV'] === 'development' && process.env['SENDGRID_API_KEY'] === 'your-sendgrid-api-key') {
    logger.info(`[DEV MODE] Email would be sent:`, {
      to: options.to,
      subject: options.subject,
      preview: options.html ? options.html.substring(0, 100) + '...' : 'No HTML content'
    });
    return true; // Return true to not block registration
  }

  try {
    let htmlContent = options.html || '';
    if (options.templateId && options.data) {
      // Mock template fetching (replace with actual template storage logic)
      const templates: Record<string, string> = {
        'account-suspended': `
          <h2>Account Suspended</h2>
          <p>Hello {{name}},</p>
          <p>Your account has been suspended. Reason: {{reason}}</p>
          <p>Contact support for assistance.</p>
        `,
        'account-reactivated': `
          <h2>Account Reactivated</h2>
          <p>Hello {{name}},</p>
          <p>Your account has been reactivated. Reason: {{reason}}</p>
          <p>Log in to continue using our services.</p>
        `,
        'admin-message': `
          <h2>{{subject}}</h2>
          <p>Hello {{name}},</p>
          <p>{{message}}</p>
        `,
        'bulk-notification': `
          <h2>{{title}}</h2>
          <p>Hello {{name}},</p>
          <p>{{message}}</p>
        `,
      };

      const template = templates[options.templateId];
      if (!template) {
        logger.error(`Template ${options.templateId} not found`);
        return false;
      }
      htmlContent = renderTemplate(template, options.data);
    }

    const mailOptions = {
      from: {
        name: process.env['FROM_NAME'] || 'Onelga Local Services',
        address: process.env['FROM_EMAIL'] || 'noreply@onelga-services.gov.ng',
      },
      to: options.to,
      subject: options.subject,
      html: htmlContent,
      text: options.text || htmlContent.replace(/<[^>]*>/g, ''),
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.to}`, { messageId: result.messageId });
    return true;
  } catch (error) {
    logger.error('Failed to send email:', error);
    return false;
  }
};

// Welcome email
export const sendWelcomeEmail = async (email: string, firstName: string): Promise<boolean> => {
  const subject = 'Welcome to Onelga Local Services';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Welcome to Onelga Local Services!</h2>
      <p>Dear ${firstName},</p>
      <p>Thank you for registering with Onelga Local Government digital services platform. Your account has been successfully created!</p>
      <p>You can now:</p>
      <ul>
        <li>Apply for various government services online</li>
        <li>Track your application status</li>
        <li>Receive updates and notifications</li>
        <li>Access your personal dashboard</li>
      </ul>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best regards,<br>Onelga Local Government</p>
    </div>
  `;
  return await sendEmail({ to: email, subject, html });
};

// Verification email
export const sendVerificationEmail = async (email: string, firstName: string, token: string): Promise<boolean> => {
  const subject = 'Verify Your Email Address';
  const verificationUrl = `${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Verify Your Email Address</h2>
      <p>Dear ${firstName},</p>
      <p>Thank you for registering with Onelga Local Government services. To complete your registration, please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
      </div>
      <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours for security reasons.</p>
      <p>If you didn't create an account with us, please ignore this email.</p>
      <p>Best regards,<br>Onelga Local Government</p>
    </div>
  `;
  return await sendEmail({ to: email, subject, html });
};

// Password reset email
export const sendPasswordResetEmail = async (email: string, firstName: string, resetToken: string): Promise<boolean> => {
  const subject = 'Reset Your Password';
  const resetUrl = `${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Reset Your Password</h2>
      <p>Dear ${firstName},</p>
      <p>We received a request to reset your password for your Onelga Local Government services account.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
      <p>Best regards,<br>Onelga Local Government</p>
    </div>
  `;
  return await sendEmail({ to: email, subject, html });
};

// Application status email
export const sendApplicationStatusEmail = async (
  email: string,
  firstName: string,
  serviceName: string,
  status: string,
  applicationId: string,
  additionalInfo?: string
): Promise<boolean> => {
  const subject = `Application Update: ${serviceName}`;
  const dashboardUrl = `${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/dashboard`;
  const statusColor = status.toLowerCase() === 'approved' ? '#27ae60' : 
                     status.toLowerCase() === 'rejected' ? '#e74c3c' : 
                     status.toLowerCase() === 'pending' ? '#f39c12' : '#3498db';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Application Status Update</h2>
      <p>Dear ${firstName},</p>
      <p>Your application for <strong>${serviceName}</strong> has been updated.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #2c3e50;">Application Details:</h3>
        <p><strong>Application ID:</strong> ${applicationId}</p>
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status.toUpperCase()}</span></p>
        ${additionalInfo ? `<p><strong>Additional Information:</strong> ${additionalInfo}</p>` : ''}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View in Dashboard</a>
      </div>
      
      <p>You can track your application progress and view more details in your dashboard.</p>
      <p>If you have any questions, please contact our support team.</p>
      <p>Best regards,<br>Onelga Local Government</p>
    </div>
  `;
  return await sendEmail({ to: email, subject, html });
};

// Appointment reminder email
export const sendAppointmentReminderEmail = async (
  email: string,
  firstName: string,
  appointmentDate: string,
  healthCenterName: string,
  serviceType: string
): Promise<boolean> => {
  const subject = 'Appointment Reminder - Onelga Health Services';
  const dashboardUrl = `${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/dashboard`;
  const formattedDate = new Date(appointmentDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Appointment Reminder</h2>
      <p>Dear ${firstName},</p>
      <p>This is a friendly reminder about your upcoming appointment with Onelga Health Services.</p>
      
      <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
        <h3 style="margin: 0 0 15px 0; color: #27ae60;">Appointment Details:</h3>
        <p><strong>Service:</strong> ${serviceType}</p>
        <p><strong>Date & Time:</strong> ${formattedDate}</p>
        <p><strong>Location:</strong> ${healthCenterName}</p>
      </div>
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h4 style="margin: 0 0 10px 0; color: #856404;">Important Reminders:</h4>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Please arrive 15 minutes before your scheduled time</li>
          <li>Bring a valid form of identification</li>
          <li>Bring any relevant medical documents or previous test results</li>
          <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" style="background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Appointment Details</a>
      </div>
      
      <p>If you have any questions or need to make changes to your appointment, please contact our office.</p>
      <p>Best regards,<br>Onelga Health Services Team</p>
    </div>
  `;
  return await sendEmail({ to: email, subject, html });
};

export { sendEmail };
export default { sendEmail };
