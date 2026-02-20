// Dashboard & API contract – shared shapes so UI and backend stay in sync

export type ApplicationStatus =
  | 'pending'
  | 'reviewed'
  | 'shortlisted'
  | 'rejected'
  | 'hired';

export interface CandidateSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  location: string | null;
  nationality: string | null;
  homeCounty: string | null;
  experience: number;
  education: string | null;
  resumePath: string | null;
  createdAt: string;
}

export interface JobSummary {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  postedDate: string;
  isActive: boolean;
  clientId: string | null;
  clientName: string | null;
  minYearsExperience: number | null;
  educationLevel: string | null;
  educationQualification: string | null;
  requiredCertifications: string | null;
}

// Application form data (Stages 2–5) stored as JSON on Application
export type EducationLevel = 'high_school' | 'certificate' | 'diploma' | 'undergraduate' | 'masters' | 'phd';

export interface EducationEntry {
  level: EducationLevel;
  institution: string;
  grade: string;
  discipline?: string;
  certificatePath?: string;
}

export type EmploymentType = 'Full-time' | 'Contract' | 'Freelance';

export interface EmploymentEntry {
  jobTitle: string;
  companyName: string;
  industry: string;
  employmentType: EmploymentType;
  startDate: string;
  endDate: string;
  isCurrentJob?: boolean;
}

export interface ProfessionalCertificationEntry {
  name: string;
  certificatePath?: string;
}

export interface ProfessionalMembershipEntry {
  name: string;
  membershipNo: string;
  certificatePath?: string;
}

export interface ApplicationFormData {
  gender?: string;
  education: EducationEntry[];
  employmentHistory: EmploymentEntry[];
  /** @deprecated Use professionalCertificationsList */
  professionalCertifications?: string;
  /** @deprecated Use professionalCertificationsList[].certificatePath */
  professionalCertificationsPath?: string;
  professionalCertificationsList?: ProfessionalCertificationEntry[];
  professionalMemberships?: ProfessionalMembershipEntry[];
  declarations: {
    accurate: boolean;
    dataProcessing: boolean;
    backgroundChecks: boolean;
    talentPool: boolean;
  };
}

export interface ApplicationWithDetails {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  appliedDate: string;
  coverLetter: string | null;
  resumePath: string | null;
  salaryExpectations: string | null;
  notes: string | null;
  formData: ApplicationFormData | null;
  createdAt: string;
  updatedAt: string;
  candidate: CandidateSummary;
  job: JobSummary;
}

export interface ApplicationsListResponse {
  applications: ApplicationWithDetails[];
  total: number;
}

export interface ApplicationsQueryParams {
  jobId?: string;
  status?: ApplicationStatus;
  page?: number;
  limit?: number;
  sortBy?: 'appliedDate' | 'status' | 'candidateName';
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateApplicationStatusBody {
  status: ApplicationStatus;
  emailMessage?: string; // optional custom note to include in status-update email
}

// Interview management
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled';
export type InterviewType = 'phone' | 'video' | 'onsite';

export type InterviewDurationMinutes = 30 | 45 | 60;

export type ConfirmationStatus = 'pending' | 'confirmed' | 'declined' | 'reschedule_requested' | 'withdrawn';

export interface InterviewWithDetails {
  id: string;
  applicationId: string;
  scheduledAt: string;
  durationMinutes: number;
  type: InterviewType;
  locationOrLink: string | null;
  notes: string | null;
  status: InterviewStatus;
  inviteSentAt: string | null;
  officialLetterPath: string | null;
  confirmationStatus: ConfirmationStatus;
  confirmationNotes: string | null;
  confirmationAt: string | null;
  createdAt: string;
  updatedAt: string;
  application: {
    id: string;
    status: ApplicationStatus;
    candidate: CandidateSummary;
    job: JobSummary;
  };
}

export interface CreateInterviewBody {
  applicationId: string;
  scheduledAt: string; // ISO datetime
  durationMinutes?: InterviewDurationMinutes; // default 45
  type: InterviewType;
  locationOrLink?: string;
  notes?: string;
}

export interface UpdateInterviewBody {
  scheduledAt?: string;
  durationMinutes?: InterviewDurationMinutes;
  type?: InterviewType;
  locationOrLink?: string | null;
  notes?: string | null;
  status?: InterviewStatus;
  officialLetterPath?: string | null;
}

export interface BulkCreateInterviewsBody {
  jobId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: InterviewDurationMinutes;
  type: InterviewType;
  applicationIds: string[]; // max 10
  locationOrLink?: string;
}

// Staff / User management (no password in API responses)
export type UserRole = 'admin' | 'staff' | 'viewer';

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserBody {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserBody {
  name?: string;
  role?: UserRole;
  isActive?: boolean;
  password?: string; // optional new password
}
