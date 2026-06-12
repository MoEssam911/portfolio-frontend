export interface Experience {
  id: string;
  company: string;
  title: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  bullets: string[];
  order: number;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  description: string | null;
  order: number;
}

export interface SkillGroup {
  id: string;
  name: string;
  skills: string[];
  order: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string | null;
  expiryDate: string | null;
  url: string | null;
  order: number;
}

export interface ResumeLink {
  id: string;
  label: string;
  url: string;
  order: number;
}

export interface ResumeProfile {
  id: string;
  headline: string | null;
  summary: string | null;
  location: string | null;
  downloadUrl: string | null;
  experiences: Experience[];
  educations: Education[];
  skillGroups: SkillGroup[];
  certifications: Certification[];
  links: ResumeLink[];
}
