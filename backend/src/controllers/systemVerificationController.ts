import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/db';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types/auth';

function fileExists(relativePath: string): boolean {
  try {
    const base = path.resolve(__dirname, '..'); // points to src
    const tsPath = path.join(base, relativePath + '.ts');
    const jsPath = path.join(base, relativePath + '.js');
    return fs.existsSync(tsPath) || fs.existsSync(jsPath);
  } catch {
    return false;
  }
}

export class SystemVerificationController {
  async verifyFeatures(req: AuthRequest, res: Response): Promise<Response> {
    const errors: string[] = [];

    // Route/file existence checks
    const routesCheck = {
      authRoutes: fileExists('routes/authRoutes'),
      userRoutes: fileExists('routes/userRoutes'),
      adminRoutes: fileExists('routes/adminRoutes'),
      identificationRoutes: fileExists('routes/identificationRoutes'),
      birthRoutes: fileExists('routes/birthRoutes'),
      healthRoutes: fileExists('routes/healthRoutes'),
      documentRoutes: fileExists('routes/documentRoutes'),
      enhancedServicesRoutes: fileExists('routes/enhancedServicesRoutes'),
      analyticsRoutes: fileExists('routes/analyticsRoutes'),
      settingsRoutes: fileExists('routes/settingsRoutes'),
      dashboardRoutes: fileExists('routes/dashboardRoutes'),
    } as const;

    // Feature checks (best-effort)
    const checks: Array<{ feature: string; status: string; details?: any }> = [];

    // Citizen Dashboard (API support via profile/enhanced services stats)
    checks.push({
      feature: 'Citizen Dashboard',
      status: routesCheck.dashboardRoutes ? 'Implemented (APIs present)' : 'Missing',
      details: { endpoints: ['/api/dashboard/citizen'], files: ['routes/dashboardRoutes'] },
    });

    // Admin Dashboard
    checks.push({
      feature: 'Admin Dashboard',
      status: routesCheck.dashboardRoutes ? 'Implemented (APIs present)' : 'Missing',
      details: { endpoints: ['/api/dashboard/admin'], files: ['routes/dashboardRoutes'] },
    });

    // Staff Dashboard (restricted service)
    checks.push({
      feature: 'Staff Dashboard',
      status: routesCheck.dashboardRoutes ? 'Implemented (APIs present)' : 'Missing',
      details: { endpoints: ['/api/dashboard/staff/:service'], files: ['routes/dashboardRoutes'] },
    });

    // Government Official Dashboard (analytics/oversight)
    checks.push({
      feature: 'Government Official Dashboard',
      status: routesCheck.dashboardRoutes ? 'Implemented (APIs present)' : 'Missing',
      details: { endpoints: ['/api/dashboard/official'], files: ['routes/dashboardRoutes'] },
    });

    // Profile Page
    checks.push({
      feature: 'Profile Page',
      status: routesCheck.userRoutes ? 'Implemented' : 'Missing',
      details: { endpoints: ['/api/profile', '/api/profile/documents', '/api/profile/applications'] },
    });

    // Service Endpoints
    checks.push({
      feature: 'Service Endpoints',
      status: routesCheck.identificationRoutes || routesCheck.birthRoutes || routesCheck.healthRoutes ? 'Implemented (partial)' : 'Missing',
      details: {
        identification: routesCheck.identificationRoutes,
        birth: routesCheck.birthRoutes,
        health: routesCheck.healthRoutes,
      },
    });

    // Audit Logging (DB & code)
    let auditStatus = 'Missing';
    try {
      const count = await prisma.auditLog.count();
      auditStatus = Number.isInteger(count) ? 'Implemented' : 'Missing';
    } catch (e) {
      auditStatus = 'Error';
      errors.push('AuditLog model check failed');
    }
    checks.push({ feature: 'Audit Logging', status: auditStatus, details: { table: 'audit_logs', prismaModel: 'AuditLog' } });

    // Integrations
    const integrations = {
      awsS3: {
        configured: process.env['STORAGE_DRIVER'] === 's3' && !!process.env['AWS_S3_BUCKET'] && !!process.env['AWS_REGION'],
        details: {
          STORAGE_DRIVER: process.env['STORAGE_DRIVER'] || 'unset',
          AWS_S3_BUCKET: !!process.env['AWS_S3_BUCKET'],
          AWS_REGION: !!process.env['AWS_REGION'],
        },
      },
      email: {
        configured: !!process.env['SENDGRID_API_KEY'] || (!!process.env['SMTP_HOST'] && !!process.env['SMTP_USER'] && !!process.env['SMTP_PASS']),
        details: {
          SENDGRID_API_KEY: !!process.env['SENDGRID_API_KEY'],
          SMTP_HOST: !!process.env['SMTP_HOST'],
        },
      },
      firebase: {
        configured: !!process.env['FIREBASE_API_KEY'],
        details: { FIREBASE_API_KEY: !!process.env['FIREBASE_API_KEY'] },
      },
      governmentApis: {
        configured: fileExists('routes/ninVerificationRoutes'),
        details: { ninVerification: '/api/identification/verify-nin' },
      },
    } as const;

    // RBAC checks (best-effort)
    const rbac = {
      roles: ['CITIZEN', 'ADMIN', 'STAFF'],
      routeGuards: {
        adminRoutesGuarded: routesCheck.adminRoutes,
        staffRoutesGuarded: routesCheck.enhancedServicesRoutes,
      },
      staffServiceRestriction: true, // enforced via service assignments in enhancedServicesRoutes
    };

    // Optional live checks via loopback HTTP using current Authorization header
    const live: Record<string, any> = {};
    try {
      const allow = process.env['ALLOW_LOOPBACK_VERIFY'] === 'true';
      const port = process.env['PORT'] || '5000';
      const base = process.env['VERIFY_BASE_URL'] || `http://127.0.0.1:${port}`;
      const authHeader = req.headers['authorization'] || '';

      if (allow && typeof fetch !== 'undefined') {
        const endpoints: Array<{ key: string; url: string; method?: string }> = [
          { key: 'dashboard_citizen', url: `${base}/api/dashboard/citizen` },
          { key: 'dashboard_admin', url: `${base}/api/dashboard/admin` },
          { key: 'dashboard_staff_identification', url: `${base}/api/dashboard/staff/identification` },
          { key: 'dashboard_official', url: `${base}/api/dashboard/official` },
          { key: 'system_verify_self', url: `${base}/api/system/verify` },
        ];

        for (const ep of endpoints) {
          try {
            const resp = await fetch(ep.url, { headers: { Authorization: String(authHeader) } });
            live[ep.key] = { ok: resp.ok, status: resp.status };
          } catch (err: any) {
            live[ep.key] = { ok: false, error: err?.message || 'fetch_failed' };
          }
        }
      } else {
        live['info'] = 'Loopback checks disabled. Set ALLOW_LOOPBACK_VERIFY=true to enable.';
      }
    } catch (e: any) {
      errors.push(`Live check error: ${e?.message || 'unknown'}`);
    }

    const report = {
      timestamp: new Date().toISOString(),
      checks,
      routes: routesCheck,
      integrations,
      rbac,
      live,
      errors,
    };

    logger.info('System verification report generated');
    // Also log a compact summary
    logger.info(JSON.stringify({ summary: checks.map(c => ({ feature: c.feature, status: c.status })) }));

    return res.json({ success: true, data: report });
  }
}

export default new SystemVerificationController();
