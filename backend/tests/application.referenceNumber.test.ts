import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/lib/db';

describe('Application Reference Number Uniqueness', () => {
  afterAll(async () => {
    // Clean up test applications
    await prisma.application.deleteMany({ where: { businessName: 'Test Business Unique' } });
    await prisma.$disconnect();
  });

  it('should not allow duplicate reference numbers', async () => {
    // Create first application
    const res1 = await request(app)
      .post('/api/identification/apply')
      .send({ businessName: 'Test Business Unique', /* other required fields */ });
    expect(res1.status).toBe(201);
    const { referenceNumber } = res1.body;
    expect(referenceNumber).toBeDefined();

    // Attempt to create another application with the same reference number (simulate collision)
    // This assumes the API allows setting referenceNumber for test; if not, skip this part
    const res2 = await prisma.application.create({
      data: {
        businessName: 'Test Business Unique',
        referenceNumber,
        // ...other required fields
      },
    }).catch(e => e);
    expect(res2.code === 'P2002' || res2.message.includes('Unique constraint')).toBe(true);
  });
});
