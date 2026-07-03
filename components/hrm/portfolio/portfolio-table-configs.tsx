import type { components } from "@/lib/api"
import {
  AttachmentCell,
  formatDate,
  type PortfolioTableColumn,
} from "@/components/hrm/portfolio/portfolio-table"
import { EducationCredentialsCell } from "@/components/hrm/portfolio/education-credentials-cell"

export type PortfolioTableConfig<TRow> = {
  endpoint: (profileId: number | string) => string
  loadingLabel: string
  columns: PortfolioTableColumn<TRow>[]
}

type EducationalBackground = components["schemas"]["EducationalBackgroundResponse"]
type WorkExperience = components["schemas"]["WorkExperienceResponse"]
type NationalBoard = components["schemas"]["NationalBoardResponse"]
type ProfessionalOrganization = components["schemas"]["ProfessionalOrganizationResponse"]
type ProfessionalEngagement = components["schemas"]["ProfessionalEngagementResponse"]
type ResearchEngagement = components["schemas"]["ResearchEngagementResponse"]
type CommunityInvolvement = components["schemas"]["CommunityInvolvementResponse"]
type AwardRecognition = components["schemas"]["AwardRecognitionResponse"]

const educationalBackground: PortfolioTableConfig<EducationalBackground> = {
  endpoint: (profileId) => `/api/v1/hrms/profiles/${profileId}/educational-backgrounds`,
  loadingLabel: "educational background",
  columns: [
    { header: "Degree Level", render: (row) => row.degreeLevel },
    { header: "Degree", render: (row) => row.degree },
    { header: "Institution", render: (row) => row.institution },
    { header: "Date Graduated", render: (row) => formatDate(row.dateGraduated) },
    {
      header: "Attachments",
      render: (row, profileId) => (
        <EducationCredentialsCell profileId={profileId} educationalBackgroundId={row.id} />
      ),
    },
  ],
}

const workExperience: PortfolioTableConfig<WorkExperience> = {
  endpoint: (profileId) => `/api/v1/hrms/profiles/${profileId}/work-experiences`,
  loadingLabel: "work experience",
  columns: [
    { header: "Position", render: (row) => row.jobTitle },
    { header: "Institution", render: (row) => row.institution },
    { header: "From", render: (row) => formatDate(row.startDate) },
    { header: "To", render: (row) => formatDate(row.endDate) },
    { header: "Attachments", render: (row) => <AttachmentCell href={row.attachment} /> },
  ],
}

const nationalCertification: PortfolioTableConfig<NationalBoard> = {
  endpoint: (profileId) => `/api/v1/hrms/profiles/${profileId}/national-boards`,
  loadingLabel: "national certifications",
  columns: [
    { header: "Certification", render: (row) => row.certification },
    { header: "License Number", render: (row) => row.licenseNumber },
    { header: "Rating", render: (row) => row.rating ?? "—" },
    { header: "Validity", render: (row) => formatDate(row.validity) },
    { header: "Attachments", render: (row) => <AttachmentCell href={row.attachment} /> },
  ],
}

const organizationAffiliation: PortfolioTableConfig<ProfessionalOrganization> = {
  endpoint: (profileId) => `/api/v1/hrms/profiles/${profileId}/professional-organizations`,
  loadingLabel: "organization affiliations",
  columns: [
    { header: "Affiliation", render: (row) => row.affiliation },
    { header: "Membership", render: (row) => row.membership },
    { header: "Remarks", render: (row) => row.remarks ?? "—" },
    { header: "Attachments", render: (row) => <AttachmentCell href={row.attachment} /> },
  ],
}

const professionalEngagement: PortfolioTableConfig<ProfessionalEngagement> = {
  endpoint: (profileId) => `/api/v1/hrms/profiles/${profileId}/professional-engagements`,
  loadingLabel: "professional engagements",
  columns: [
    { header: "Engagement Type", render: (row) => row.engagementType },
    { header: "Engagement Name", render: (row) => row.engagementName },
    { header: "Remarks", render: (row) => row.remarks ?? "—" },
    { header: "Attachments", render: (row) => <AttachmentCell href={row.attachment} /> },
  ],
}

const researchEngagement: PortfolioTableConfig<ResearchEngagement> = {
  endpoint: (profileId) => `/api/v1/hrms/profiles/${profileId}/research-engagements`,
  loadingLabel: "research engagements",
  columns: [
    { header: "Research Title", render: (row) => row.researchTitle },
    { header: "Nature of Engagement", render: (row) => row.natureEngagement },
    { header: "Nature of Utilization", render: (row) => row.natureUtilization ?? "—" },
    { header: "Date Published", render: (row) => formatDate(row.datePublished) },
    { header: "Attachments", render: (row) => <AttachmentCell href={row.attachment} /> },
  ],
}

const communityInvolvement: PortfolioTableConfig<CommunityInvolvement> = {
  endpoint: (profileId) => `/api/v1/hrms/profiles/${profileId}/community-involvements`,
  loadingLabel: "community involvement",
  columns: [
    { header: "Involvement", render: (row) => row.involvement },
    { header: "Nature of Involvement", render: (row) => row.natureInvolvement },
    { header: "Date of Activity", render: (row) => formatDate(row.dateActivity) },
    { header: "Attachments", render: (row) => <AttachmentCell href={row.attachment} /> },
  ],
}

const awardsRecognition: PortfolioTableConfig<AwardRecognition> = {
  endpoint: (profileId) => `/api/v1/hrms/profiles/${profileId}/award-recognitions`,
  loadingLabel: "awards and recognition",
  columns: [
    { header: "Awarding Body", render: (row) => row.awardingBody },
    { header: "Nature of Award", render: (row) => row.natureAward },
    { header: "Date Received", render: (row) => formatDate(row.dateReceived) },
    { header: "Attachments", render: (row) => <AttachmentCell href={row.attachment} /> },
  ],
}

export const PORTFOLIO_TABLE_CONFIGS: Record<string, PortfolioTableConfig<any>> = {
  "educational-background": educationalBackground,
  "work-experience": workExperience,
  "national-certification": nationalCertification,
  "organization-affiliation": organizationAffiliation,
  "professional-engagement": professionalEngagement,
  "research-creative-work": researchEngagement,
  "community-parish-involvement": communityInvolvement,
  "awards-recognition": awardsRecognition,
}
