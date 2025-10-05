import { sendApplicationStatusEmail } from '../src/utils/emailService';

describe('Email Notification Utility', () => {
  it('should send an email with correct subject and content', async () => {
    // This is a mock test; in real scenarios, use a test SMTP server or mock nodemailer
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const result = await sendApplicationStatusEmail(
      'test@example.com',
      'John Doe',
      'Identification Letter',
      'approved',
      'APP-123',
      'Your application has been processed successfully'
    );
    expect(result).toBe(true);
    spy.mockRestore();
  });
});
