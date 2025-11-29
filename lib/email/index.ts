// Export SMTP email utilities
export {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendRSVPConfirmationEmail,
  sendSupportEmail,
  sendRefundRequestEmail,
} from './smtp';

export type { EmailOptions } from './smtp';
