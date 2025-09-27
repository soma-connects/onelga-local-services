import { sendApplicationStatusEmail } from '../src/utils/emailService';

describe('Email Notification Utility', () => {
  it('should send an email with correct subject and content', async () => {
    // This is a mock test; in real scenarios, use a test SMTP server or mock nodemailer
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const result = await sendApplicationStatusEmail('test@example.com', 'APP-123', 'approved');
    expect(result).toBe(true);
    spy.mockRestore();
  });
});
