import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleCategories = [
  {
    name: 'Government Updates',
    description: 'Latest updates from ONELGA local government',
    slug: 'government-updates'
  },
  {
    name: 'Community News',
    description: 'News and events from ONELGA communities',
    slug: 'community-news'
  },
  {
    name: 'Infrastructure',
    description: 'Updates on infrastructure development and projects',
    slug: 'infrastructure'
  },
  {
    name: 'Public Health',
    description: 'Health-related news and announcements',
    slug: 'public-health'
  },
  {
    name: 'Education',
    description: 'Educational news and school-related updates',
    slug: 'education'
  },
  {
    name: 'Economy & Business',
    description: 'Economic development and business opportunities',
    slug: 'economy-business'
  }
];

const sampleTags = [
  { name: 'Breaking News', slug: 'breaking-news' },
  { name: 'Announcement', slug: 'announcement' },
  { name: 'Development', slug: 'development' },
  { name: 'Community', slug: 'community' },
  { name: 'Services', slug: 'services' },
  { name: 'Roads', slug: 'roads' },
  { name: 'Healthcare', slug: 'healthcare' },
  { name: 'Schools', slug: 'schools' },
  { name: 'Youth', slug: 'youth' },
  { name: 'Agriculture', slug: 'agriculture' }
];

const sampleArticles = [
  {
    title: 'ONELGA Launches New Digital Services Platform',
    slug: 'onelga-launches-new-digital-services-platform',
    excerpt: 'ONELGA Local Government Area has officially launched a comprehensive digital platform to streamline government services and improve citizen access to essential services.',
    content: `ONELGA Local Government Area has taken a significant step towards digital transformation with the launch of its new comprehensive digital services platform. This innovative initiative aims to bring government services closer to citizens and reduce bureaucratic bottlenecks.

## Key Features

The new platform offers:

- Online application for identification letters
- Birth certificate processing
- Business registration services
- Health appointment booking
- Real-time application tracking

## Benefits for Citizens

Citizens can now:
- Apply for services from the comfort of their homes
- Track application status in real-time
- Reduce waiting times and eliminate long queues
- Access services 24/7

## Leadership Statement

The Executive Chairman of ONELGA, Hon. [Name], expressed enthusiasm about the initiative, stating that this platform represents a commitment to serving citizens better and embracing modern technology for governance.

## Getting Started

Citizens can access the platform at [website URL] and create an account to begin using the services immediately.

This initiative positions ONELGA as a leader in digital governance among local government areas in Rivers State.`,
    metaTitle: 'ONELGA Digital Services Platform Launch - Improved Citizen Services',
    metaDescription: 'ONELGA launches new digital platform for government services including online applications, real-time tracking, and 24/7 access to essential services.',
    status: 'PUBLISHED',
    isFeatured: true,
    isBreaking: false,
    tags: ['announcement', 'services', 'development']
  },
  {
    title: 'Major Road Infrastructure Project Begins in Omoku',
    slug: 'major-road-infrastructure-project-begins-omoku',
    excerpt: 'A major road rehabilitation project has commenced in Omoku, aimed at improving transportation and boosting economic activities in the area.',
    content: `A significant infrastructure development project has officially begun in Omoku with the commencement of major road rehabilitation works. This project represents a substantial investment in improving transportation infrastructure across ONELGA.

## Project Scope

The rehabilitation project includes:

- Complete reconstruction of 15 kilometers of major roads
- Installation of proper drainage systems
- Street lighting installation
- Pedestrian walkways and safety features

## Expected Impact

The project is expected to:
- Reduce travel time and transportation costs
- Boost local business and economic activities
- Improve access to healthcare and educational facilities
- Enhance overall quality of life for residents

## Timeline and Investment

The project is scheduled for completion within 18 months, with a total investment of ₦2.5 billion from state and federal allocations.

## Community Involvement

Local contractors and laborers will be prioritized in the project implementation to ensure community participation and economic benefits remain within ONELGA.

## Traffic Advisory

Residents are advised to use alternative routes during construction hours and cooperate with traffic management officials for smooth project execution.`,
    metaTitle: 'Omoku Road Infrastructure Project - ONELGA Development Initiative',
    metaDescription: 'Major road rehabilitation project begins in Omoku, ONELGA. 15km road reconstruction with drainage, lighting, and safety features. ₦2.5B investment.',
    status: 'PUBLISHED',
    isFeatured: true,
    isBreaking: true,
    tags: ['infrastructure', 'roads', 'development']
  },
  {
    title: 'Free Health Screening Program for Elderly Residents',
    slug: 'free-health-screening-program-elderly-residents',
    excerpt: 'ONELGA Health Department announces a comprehensive free health screening program targeting elderly residents aged 60 and above.',
    content: `The ONELGA Health Department has announced the launch of a comprehensive free health screening program specifically designed for elderly residents aged 60 and above. This initiative is part of the local government\'s commitment to ensuring healthcare accessibility for all citizens.

## Program Details

The screening program includes:

- Blood pressure and diabetes screening
- Basic eye examinations
- General health consultations
- Nutritional counseling
- Health education sessions

## Locations and Schedule

Screening will be conducted at:
- ONELGA Primary Healthcare Centers
- Community halls in various wards
- Mobile health units for remote areas

## Registration Process

Eligible residents can register:
- At any PHC center
- Through community leaders
- Via the ONELGA digital services platform

## Free Medications

Basic medications for common conditions will be provided free of charge to participants who require them.

## Partnership

This program is implemented in partnership with Rivers State Ministry of Health and local healthcare professionals.

## Expected Outcomes

The program aims to:
- Early detection of health conditions
- Improve health awareness among elderly
- Reduce healthcare costs for families
- Build comprehensive health data for better planning`,
    metaTitle: 'Free Health Screening for Elderly - ONELGA Healthcare Initiative',
    metaDescription: 'ONELGA launches free health screening program for elderly residents 60+. Includes blood pressure, diabetes screening, and free basic medications.',
    status: 'PUBLISHED',
    isFeatured: false,
    isBreaking: false,
    tags: ['healthcare', 'community', 'announcement']
  },
  {
    title: 'Youth Entrepreneurship Development Program 2024',
    slug: 'youth-entrepreneurship-development-program-2024',
    excerpt: 'ONELGA announces the launch of a comprehensive entrepreneurship program aimed at empowering young people with business skills and startup capital.',
    content: `ONELGA Local Government has unveiled an ambitious Youth Entrepreneurship Development Program for 2024, designed to empower young residents with the skills and resources needed to start successful businesses.

## Program Components

The comprehensive program includes:

### Training Modules
- Business plan development
- Financial literacy and management
- Digital marketing and e-commerce
- Product development and innovation
- Legal aspects of business

### Support Services
- Mentorship from successful entrepreneurs
- Access to microfinance opportunities
- Business incubation facilities
- Networking events and market linkages

## Eligibility Criteria

- Age: 18-35 years
- Resident of ONELGA
- Commitment to complete the full program
- Viable business idea or existing small business

## Application Process

1. Submit application online or at ONELGA offices
2. Attend screening interview
3. Present business proposal
4. Participate in selection process

## Funding Opportunities

Selected participants will have access to:
- Interest-free loans up to ₦500,000
- Grant opportunities for innovative ideas
- Equipment and tool support
- Workspace facilities

## Program Duration

The program runs for 6 months with ongoing support for 2 years.

## Expected Impact

The program aims to:
- Create 500 new businesses
- Generate 1,500 direct and indirect jobs
- Reduce youth unemployment by 30%
- Boost local economic activities

## Application Deadline

Applications close on [Date]. Early application is encouraged due to limited slots.`,
    metaTitle: 'ONELGA Youth Entrepreneurship Program 2024 - Business Development',
    metaDescription: 'ONELGA launches youth entrepreneurship program with training, mentorship, and funding up to ₦500,000 for young entrepreneurs aged 18-35.',
    status: 'PUBLISHED',
    isFeatured: false,
    isBreaking: false,
    tags: ['youth', 'economy-business', 'development']
  },
  {
    title: 'New Agricultural Cooperative Initiative Launched',
    slug: 'new-agricultural-cooperative-initiative-launched',
    excerpt: 'ONELGA partners with agricultural development organizations to launch cooperative farming initiative supporting local farmers with modern techniques and equipment.',
    content: `ONELGA Local Government, in partnership with the Rivers State Agricultural Development Program, has launched a new cooperative farming initiative designed to support local farmers and boost agricultural productivity in the area.

## Initiative Overview

The Agricultural Cooperative Initiative provides:

### Modern Farming Support
- Access to improved seedlings and fertilizers
- Modern farming equipment and tools
- Irrigation system development
- Storage and processing facilities

### Training and Education
- Modern farming techniques
- Crop rotation and soil management
- Pest and disease control
- Post-harvest handling

### Market Access
- Direct market linkages
- Price negotiation support
- Transportation assistance
- Export opportunity facilitation

## Farmer Benefits

Participating farmers will enjoy:
- Reduced production costs through bulk purchasing
- Improved crop yields and quality
- Better market prices through cooperative sales
- Access to agricultural loans and insurance

## Registration Process

Interested farmers can:
- Visit ONELGA Agricultural Department
- Register through ward development committees
- Contact local extension agents
- Apply online through the digital platform

## Expected Outcomes

The initiative targets:
- 2,000 participating farmers
- 40% increase in crop productivity
- 50% reduction in post-harvest losses
- Enhanced food security for ONELGA

## Partnership

Key partners include:
- Rivers State ADP
- Federal Ministry of Agriculture
- Commercial banks
- Agricultural input suppliers
- Market associations

## Sustainability

The program includes provisions for:
- Revolving loan schemes
- Farmer training programs
- Equipment maintenance services
- Continuous market development`,
    metaTitle: 'ONELGA Agricultural Cooperative Initiative - Farmer Support Program',
    metaDescription: 'ONELGA launches agricultural cooperative initiative supporting 2,000 farmers with modern equipment, training, and market access for improved productivity.',
    status: 'PUBLISHED',
    isFeatured: false,
    isBreaking: false,
    tags: ['agriculture', 'development', 'community']
  }
];

export async function seedNewsData() {
  try {
    console.log('Starting news data seeding...');

    // Get or create admin user for article authorship
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }

    // Create categories
    console.log('Creating news categories...');
    for (const categoryData of sampleCategories) {
      await prisma.newsCategory.upsert({
        where: { slug: categoryData.slug },
        update: {},
        create: categoryData
      });
    }

    // Create tags
    console.log('Creating news tags...');
    for (const tagData of sampleTags) {
      await prisma.newsTag.upsert({
        where: { slug: tagData.slug },
        update: {},
        create: tagData
      });
    }

    // Create articles
    console.log('Creating news articles...');
    for (const articleData of sampleArticles) {
      // Get category (using first category as default)
      const category = await prisma.newsCategory.findFirst({
        where: { 
          OR: [
            { slug: 'government-updates' },
            { slug: 'community-news' }
          ]
        }
      });

      if (!category) {
        console.log('No category found for article:', articleData.title);
        continue;
      }

      // Get tags for the article
      const articleTags = await prisma.newsTag.findMany({
        where: {
          slug: { in: articleData.tags }
        }
      });

      await prisma.newsArticle.upsert({
        where: { slug: articleData.slug },
        update: {},
        create: {
          title: articleData.title,
          slug: articleData.slug,
          excerpt: articleData.excerpt,
          content: articleData.content,
          metaTitle: articleData.metaTitle,
          metaDescription: articleData.metaDescription,
          status: articleData.status,
          isFeatured: articleData.isFeatured,
          isBreaking: articleData.isBreaking,
          publishedAt: new Date(),
          authorId: adminUser.id,
          categoryId: category.id,
          tags: {
            connect: articleTags.map(tag => ({ id: tag.id }))
          }
        }
      });
    }

    console.log('News data seeding completed successfully!');
    
    // Print summary
    const categoriesCount = await prisma.newsCategory.count();
    const tagsCount = await prisma.newsTag.count();
    const articlesCount = await prisma.newsArticle.count();
    
    console.log(`\nSummary:`);
    console.log(`- Categories created: ${categoriesCount}`);
    console.log(`- Tags created: ${tagsCount}`);
    console.log(`- Articles created: ${articlesCount}`);

  } catch (error) {
    console.error('Error seeding news data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedNewsData()
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}