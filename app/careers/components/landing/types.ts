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

export interface ApiJobPosting {
  id: number | string;
  title: string;
  department?: string;
  departmentName?: string;
  unitName?: string;
  location?: string;
  employmentType?: string;
  type?: string;
  workplace?: string;
  salary?: string;
  salaryRange?: string;
  postedDate?: string;
  datePosted?: string;
  createdAt?: string;
  deadline?: string;
  applicationDeadline?: string;
  closingDate?: string;
  experienceLevel?: string;
  experienceRequired?: string;
  description?: string;
  summary?: string;
  responsibilities?: string | string[];
  requirements?: string | string[];
  qualifications?: string | string[];
  benefits?: string | string[];
  perks?: string | string[];
}

export interface JobPostingsApiResponse {
  success: boolean;
  message: string;
  data: {
    data: ApiJobPosting[];
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

export interface SingleJobPostingApiResponse {
  success: boolean;
  message: string;
  data: ApiJobPosting;
}

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split(/\n|•|- /).map((s) => s.trim()).filter(Boolean);
}

export function mapApiJobToJob(apiJob: ApiJobPosting): Job {
  const typeMap: Record<string, Job['type']> = {
    'full-time': 'Full-time',
    'fulltime': 'Full-time',
    'part-time': 'Part-time',
    'parttime': 'Part-time',
    'contract': 'Contract',
    'temporary': 'Temporary',
  };

  const workplaceMap: Record<string, Job['workplace']> = {
    'onsite': 'Onsite',
    'on-site': 'Onsite',
    'hybrid': 'Hybrid',
    'remote': 'Remote',
  };

  const experienceMap: Record<string, Job['experienceLevel']> = {
    'entry level': 'Entry Level',
    'entry-level': 'Entry Level',
    'junior': 'Entry Level',
    'mid level': 'Mid Level',
    'mid-level': 'Mid Level',
    'senior level': 'Senior Level',
    'senior-level': 'Senior Level',
    'senior': 'Senior Level',
    'director / lead': 'Director / Lead',
    'director': 'Director / Lead',
    'lead': 'Director / Lead',
  };

  const rawType = (apiJob.employmentType || apiJob.type || '').toLowerCase();
  const rawWorkplace = (apiJob.workplace || '').toLowerCase();
  const rawExperience = (apiJob.experienceLevel || apiJob.experienceRequired || '').toLowerCase();

  const postedRaw = apiJob.postedDate || apiJob.datePosted || apiJob.createdAt || '';
  const deadlineRaw = apiJob.deadline || apiJob.applicationDeadline || apiJob.closingDate || '';

  const formatDate = (d: string) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return d;
    }
  };

  const dept = apiJob.department || apiJob.departmentName || apiJob.unitName || '';

  return {
    id: String(apiJob.id),
    title: apiJob.title || 'Untitled Position',
    department: dept,
    location: apiJob.location || 'Tuguegarao City, Cagayan',
    type: typeMap[rawType] || 'Full-time',
    workplace: workplaceMap[rawWorkplace] || 'Onsite',
    salary: apiJob.salary || apiJob.salaryRange || 'Undisclosed',
    postedDate: formatDate(postedRaw),
    deadline: formatDate(deadlineRaw),
    experienceLevel: experienceMap[rawExperience] || 'Mid Level',
    description: apiJob.description || apiJob.summary || '',
    responsibilities: toArray(apiJob.responsibilities),
    requirements: toArray(apiJob.requirements || apiJob.qualifications),
    benefits: toArray(apiJob.benefits || apiJob.perks),
  };
}



