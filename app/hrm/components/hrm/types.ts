export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary';
  workplace: 'Onsite' | 'Hybrid' | 'Remote';
  salary: string;
  postedDate: string;
  deadline: string;
  experienceLevel: 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Director / Lead';
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  resumeName: string;
  resumeContent: string; 
  portfolioUrl?: string;
  coverLetterText?: string;
  education: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  department: string;
  appliedDate: string;
  status: 'Submitted' | 'Under Review' | 'Interviewing' | 'Decision Pending' | 'Offer';
  timeline: { status: string; date: string; description: string }[];
  profileSnapshot: UserProfile;
}

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-01',
    title: 'College Instructor (AI & Data Analytics)',
    department: 'School of Information Technology and Engineering',
    location: 'Tuguegarao City, Cagayan',
    type: 'Full-time',
    workplace: 'Onsite',
    salary: 'Undisclosed',
    postedDate: '2026-06-25',
    deadline: '2026-08-15',
    experienceLevel: 'Mid Level',
    description: 'The School of Information Technology and Engineering invites applications for a Full-time Faculty position. We are seeking progressive educators with dedicated industry or academic background in Artificial Intelligence, Retrieval-Augmented Generation (RAG) models, Data Analytics, or Full-Stack Web Architectures to mentor our undergraduate students.',
    responsibilities: [
      'Teach undergraduate courses in Information Technology, focusing on machine learning foundations, programming, and capstone analytics projects.',
      'Serve as an academic adviser and research panelist for undergraduate IT capstone projects and systems development.',
      'Contribute to the continuous improvement of the IT curriculum aligned with current global tech landscapes.',
      'Participate actively in university institutional research initiatives, community extensions, and committee tasks.',
      'Coordinate with industry partners to foster student internship assignments and technology bootcamp alignment.'
    ],
    requirements: [
      'Master’s Degree in Information Technology, Computer Science, or a closely related field (Ph.D. or aligned units preferred).',
      'Demonstrated proficiency in modern web stacks (e.g., PHP/Laravel, JavaScript) or AI/Data programming frameworks.',
      'A strong commitment to high-quality instruction, holistic student development, and the institutional mission.',
      'Excellent interpersonal communication skills and readiness to work within a values-driven academic community.'
    ],
    benefits: [
      'Competitive institutional salary scale with premium leveling for Master’s/Doctoral holders.',
      'Comprehensive health coverage, SSS, PhilHealth, and Pag-IBIG institutional supplements.',
      'Generous tuition waiver and remission benefits for continuing advanced graduate studies.',
      'Paid institutional recess, faculty developmental leaves, and annual retreat privileges.',
      'Access to research publication incentives and fully supported professional training workshops.'
    ]
  },
  {
    id: 'job-02',
    title: 'Basic Education Unit (BEU) Guidance Counselor',
    department: 'Guidance Office',
    location: 'Tuguegarao City, Cagayan',
    type: 'Full-time',
    workplace: 'Onsite',
    salary: 'Undisclosed',
    postedDate: '2026-06-28',
    deadline: '2026-07-30',
    experienceLevel: 'Entry Level',
    description: 'We are seeking an empathetic, values-centered Registered Guidance Counselor (RGC) to handle student development, psychological appraisal, and comprehensive counseling frameworks for our Basic Education Unit (BEU). This individual will implement programs centered around holistic student success and mental wellness.',
    responsibilities: [
      'Deliver proactive individual and group counseling sessions to Grade School or High School students within the Basic Education Unit.',
      'Administer, interpret, and document standard psychological tests and academic appraisal profiles.',
      'Organize and facilitate structured homeroom guidance modules, career orientation seminars, and anti-bullying campaigns.',
      'Conduct regular parent-teacher consultation frameworks regarding student adjustment challenges and behavioral diagnostics.',
      'Collaborate with the BEU principal and faculty coordinators regarding student loading, scheduling adjustments, and special cases.'
    ],
    requirements: [
      'Bachelor’s or Master’s degree in Guidance and Counseling, Psychology, or Clinical Counseling.',
      'Must be a Registered Guidance Counselor (RGC) under the Philippine Professional Regulation Commission (PRC).',
      'Strong active listening, crisis intervention, and conflict-resolution capabilities.',
      'Exceptional organization skills for handling delicate confidential student appraisal files and case work indicators.'
    ],
    benefits: [
      'Standard institutional health allowances and comprehensive government statutory inclusions.',
      'Generous annual paid vacation, sick leaves, and holiday breaks tied directly to the academic calendar cycle.',
      'Full administrative support and allocation for PRC license renewals and PGCA conference attendance.',
      'Subsidized institutional meals and access to on-campus physical wellness amenities.'
    ]
  },
  {
    id: 'job-03',
    title: 'Community Development Extension Coordinator',
    department: 'Community Development Center',
    location: 'Tuguegarao City, Cagayan',
    type: 'Full-time',
    workplace: 'Onsite',
    salary: 'Undisclosed',
    postedDate: '2026-06-20',
    deadline: '2026-07-25',
    experienceLevel: 'Mid Level',
    description: 'The Community Development Center (CDC) is looking for an organized, community-driven Coordinator to manage and deploy the university’s flagship extension initiatives. This role bridges academe and grassroots community building by organizing outreach programs, livelihood allocations, and community mapping structures across adopted communities.',
    responsibilities: [
      'Liaise directly with community leaders and stakeholders to design sustainable extension program proposals.',
      'Utilize community mapping profiles and trackers to analyze localized development indicators and plan program interventions.',
      'Coordinate and log extension schedules, logistics, and deployment requirements across university departments.',
      'Draft thorough, data-supported progress reports and impact assessment summaries for the CDC Director.',
      'Supervise and guide student volunteers and faculty representatives during off-campus outreach deployments.'
    ],
    requirements: [
      'Bachelor’s degree in Social Work, Community Development, Development Communication, Sociology, or related fields.',
      '2+ years of field experience handling community organization, civic mobilization, or NGO workflows.',
      'Outstanding proficiency in narrative report drafting, programmatic documentation, and basic data compilation.',
      'Excellent vernacular communication skills (Ilocano/Ibanag is a significant asset for field engagements).'
    ],
    benefits: [
      'Full medical coverage with institutional clinic access and health maintenance supplements.',
      'Complete field insurance coverage and full transportation/logistics allocation during off-campus deployments.',
      'Opportunities for fully supported professional advancement via national community extension symposia.',
      'Subsidized professional development courses and standard statutory holiday components.'
    ]
  },
  {
    id: 'job-04',
    title: 'University Registrar Administrative Specialist',
    department: 'Office of the University Registrar',
    location: 'Tuguegarao City, Cagayan',
    type: 'Full-time',
    workplace: 'Onsite',
    salary: 'Undisclosed',
    postedDate: '2026-06-18',
    deadline: '2026-08-01',
    experienceLevel: 'Mid Level',
    description: 'Join our essential administrative infrastructure. The Registrar Administrative Specialist provides efficient documentation processing, maintains secure academic records databases, organizes enrollment listings, and handles verification workflows for student credentials and graduation clearances.',
    responsibilities: [
      'Process, maintain, and archive student transcripts of records (TOR), certifications, diplomas, and enrollment logs.',
      'Verify student loading configurations, course substitutions, and general evaluation checklists against curriculum guidelines.',
      'Manage input and validation workflows inside the centralized Student Information System database infrastructure.',
      'Assist with terminal evaluation processing for graduation candidates and coordinate statutory reporting to CHED or DepEd.',
      'Provide courteous, efficient counter assistance to students, alumni, and external agencies requesting academic verification.'
    ],
    requirements: [
      'Bachelor’s degree in Information Technology, Business Administration, Office Administration, or related disciplines.',
      '2+ years of administrative experience, preferably inside an educational institution registrar or admissions desk.',
      'High-level mastery of data entry software, electronic spreadsheet architectures, and database records organization.',
      'Superb attention to details, high data integrity compliance, and ability to multitask calmly under tight enrollment windows.'
    ],
    benefits: [
      'Stable academic environment with clear career growth tracks and performance incentive frameworks.',
      'Comprehensive retirement contribution match and health premium additions.',
      'Full tuition waiver programs for continuing education classes taken within the institution.',
      'Paid winter recess and comprehensive institutional break leave benefits.'
    ]
  }
];