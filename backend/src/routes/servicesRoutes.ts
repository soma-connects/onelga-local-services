import { Router } from 'express';

const router = Router();


// List of available services for ONELGA, Rivers State
const services = [
  {
    id: '1',
    name: 'Identification Letter',
    description: 'Official identification letter for residents of Ogba–Egbema–Ndoni (ONELGA) LGA, Rivers State',
    category: 'identification',
    processingTime: '3-5 business days',
    requirements: ['Valid ID', 'Proof of residence', 'Passport photograph', 'LGA Ward'],
    fee: 2000,
    isPopular: true,
    status: 'available',
    applicationPath: '/services/identification',
  },
  {
    id: '2',
    name: 'Birth Certificate',
    description: 'Register birth and obtain certified birth certificate in ONELGA',
    category: 'birth-registration',
    processingTime: '7-14 business days',
    requirements: ['Hospital birth record', 'Parents\' ID', 'Marriage certificate'],
    fee: 3500,
    isPopular: true,
    status: 'available',
    applicationPath: '/services/birth-certificate',
  },
  {
    id: '3',
    name: 'Health Facility Registration',
    description: 'Register health facilities and get operating permits in ONELGA',
    category: 'health',
    processingTime: '14-21 business days',
    requirements: ['Medical qualifications', 'Facility inspection', 'Equipment list'],
    fee: 15000,
    isPopular: false,
    status: 'available',
    applicationPath: '/services/health',
  },
  {
    id: '4',
    name: 'Business Registration',
    description: 'Register your business and obtain trading license in ONELGA',
    category: 'business',
    processingTime: '5-10 business days',
    requirements: ['Business plan', 'Tax identification', 'Location permit'],
    fee: 8000,
    isPopular: true,
    status: 'available',
    applicationPath: '/services/business',
  },
  {
    id: '5',
    name: 'Vehicle Registration',
    description: 'Register vehicles and obtain permits for commercial operations in ONELGA',
    category: 'transport',
    processingTime: '3-7 business days',
    requirements: ['Vehicle documents', 'Insurance', 'Safety inspection'],
    fee: 12000,
    isPopular: false,
    status: 'available',
    applicationPath: '/services/transport',
  },
  {
    id: '6',
    name: 'School Registration',
    description: 'Register educational institutions and get accreditation in ONELGA',
    category: 'education',
    processingTime: '21-30 business days',
    requirements: ['Educational license', 'Facility assessment', 'Staff qualifications'],
    fee: 25000,
    isPopular: false,
    status: 'temporarily_unavailable',
    applicationPath: '/services/education',
  },
  {
    id: '7',
    name: 'Land Title Registration',
    description: 'Register land ownership and obtain certificate of occupancy in ONELGA',
    category: 'housing',
    processingTime: '30-45 business days',
    requirements: ['Survey plan', 'Purchase agreement', 'Tax clearance'],
    fee: 45000,
    isPopular: false,
    status: 'available',
    applicationPath: '/services/housing',
  },
  {
    id: '8',
    name: 'Social Welfare Services',
    description: 'Access social welfare programs and submit community complaints in ONELGA',
    category: 'social-security',
    processingTime: '1-3 business days',
    requirements: ['Valid ID', 'Income proof', 'Community reference'],
    fee: 0,
    isPopular: false,
    status: 'coming_soon',
    applicationPath: '/services/social-security',
  },
];

router.get('/', (_req, res) => {
  res.json({ success: true, data: { services } });
});

export default router;
