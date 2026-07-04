import * as React from "react"
import type { components } from "@/lib/api"
import {
  AttachmentCell,
  formatDate,
  PortfolioTable,
  type PortfolioTableColumn,
} from "@/components/hrm/portfolio/portfolio-table"
import { EducationCredentialsCell } from "@/components/hrm/portfolio/education-credentials-cell"
import { EducationalBackgroundAddDialog } from "@/components/hrm/portfolio/modals/educational-background-add-dialog"
import { EducationalBackgroundRowActions } from "@/components/hrm/portfolio/modals/educational-background-row-actions"
import { WorkExperienceAddDialog } from "@/components/hrm/portfolio/modals/work-experience-add-dialog"
import { WorkExperienceRowActions } from "@/components/hrm/portfolio/modals/work-experience-row-actions"
import { NationalCertificationAddDialog } from "@/components/hrm/portfolio/modals/national-certification-add-dialog"
import { NationalCertificationRowActions } from "@/components/hrm/portfolio/modals/national-certification-row-actions"
import { OrganizationAffiliationAddDialog } from "@/components/hrm/portfolio/modals/organization-affiliation-add-dialog"
import { OrganizationAffiliationRowActions } from "@/components/hrm/portfolio/modals/organization-affiliation-row-actions"
import { ProfessionalEngagementAddDialog } from "@/components/hrm/portfolio/modals/professional-engagement-add-dialog"
import { ProfessionalEngagementRowActions } from "@/components/hrm/portfolio/modals/professional-engagement-row-actions"
import { ResearchEngagementAddDialog } from "@/components/hrm/portfolio/modals/research-engagement-add-dialog"
import { ResearchEngagementRowActions } from "@/components/hrm/portfolio/modals/research-engagement-row-actions"
import { CommunityInvolvementAddDialog } from "@/components/hrm/portfolio/modals/community-involvement-add-dialog"
import { CommunityInvolvementRowActions } from "@/components/hrm/portfolio/modals/community-involvement-row-actions"
import { AwardRecognitionAddDialog } from "@/components/hrm/portfolio/modals/award-recognition-add-dialog"
import { AwardRecognitionRowActions } from "@/components/hrm/portfolio/modals/award-recognition-row-actions"

export type PortfolioTableConfig<TRow> = {
  endpoint: (profileId: number | string) => string
  loadingLabel: string
  columns: PortfolioTableColumn<TRow>[]
  renderAddButton?: (args: {
    profileId: number | string
    onCreated: () => void
  }) => React.ReactNode
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
    {
      header: "Actions",
      render: (row, profileId, refresh) => (
        <EducationalBackgroundRowActions profileId={profileId} row={row} onChanged={refresh} />
      ),
    },
  ],
  renderAddButton: ({ profileId, onCreated }) => (
    <EducationalBackgroundAddDialog profileId={profileId} onCreated={onCreated} />
  ),
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
    {
      header: "Actions",
      render: (row, profileId, refresh) => (
        <WorkExperienceRowActions profileId={profileId} row={row} onChanged={refresh} />
      ),
    },
  ],
  renderAddButton: ({ profileId, onCreated }) => (
    <WorkExperienceAddDialog profileId={profileId} onCreated={onCreated} />
  ),
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
    {
      header: "Actions",
      render: (row, profileId, refresh) => (
        <NationalCertificationRowActions profileId={profileId} row={row} onChanged={refresh} />
      ),
    },
  ],
  renderAddButton: ({ profileId, onCreated }) => (
    <NationalCertificationAddDialog profileId={profileId} onCreated={onCreated} />
  ),
}

const organizationAffiliation: PortfolioTableConfig<ProfessionalOrganization> = {
  endpoint: (profileId) => `/api/v1/hrms/profiles/${profileId}/professional-organizations`,
  loadingLabel: "organization affiliations",
  columns: [
    { header: "Affiliation", render: (row) => row.affiliation },
    { header: "Membership", render: (row) => row.membership },
    { header: "Remarks", render: (row) => row.remarks ?? "—" },
    { header: "Attachments", render: (row) => <AttachmentCell href={row.attachment} /> },
    {
      header: "Actions",
      render: (row, profileId, refresh) => (
        <OrganizationAffiliationRowActions profileId={profileId} row={row} onChanged={refresh} />
      ),
    },
  ],
  renderAddButton: ({ profileId, onCreated }) => (
    <OrganizationAffiliationAddDialog profileId={profileId} onCreated={onCreated} />
  ),
}

const professionalEngagement: PortfolioTableConfig<ProfessionalEngagement> = {
  endpoint: (profileId) => `/api/v1/hrms/profiles/${profileId}/professional-engagements`,
  loadingLabel: "professional engagements",
  columns: [
    { header: "Engagement Type", render: (row) => row.engagementType },
    { header: "Engagement Name", render: (row) => row.engagementName },
    { header: "Remarks", render: (row) => row.remarks ?? "—" },
    { header: "Attachments", render: (row) => <AttachmentCell href={row.attachment} /> },
    {
      header: "Actions",
      render: (row, profileId, refresh) => (
        <ProfessionalEngagementRowActions profileId={profileId} row={row} onChanged={refresh} />
      ),
    },
  ],
  renderAddButton: ({ profileId, onCreated }) => (
    <ProfessionalEngagementAddDialog profileId={profileId} onCreated={onCreated} />
  ),
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
    {
      header: "Actions",
      render: (row, profileId, refresh) => (
        <ResearchEngagementRowActions profileId={profileId} row={row} onChanged={refresh} />
      ),
    },
  ],
  renderAddButton: ({ profileId, onCreated }) => (
    <ResearchEngagementAddDialog profileId={profileId} onCreated={onCreated} />
  ),
}

const communityInvolvement: PortfolioTableConfig<CommunityInvolvement> = {
  endpoint: (profileId) => `/api/v1/hrms/profiles/${profileId}/community-involvements`,
  loadingLabel: "community involvement",
  columns: [
    { header: "Involvement", render: (row) => row.involvement },
    { header: "Nature of Involvement", render: (row) => row.natureInvolvement },
    { header: "Date of Activity", render: (row) => formatDate(row.dateActivity) },
    { header: "Attachments", render: (row) => <AttachmentCell href={row.attachment} /> },
    {
      header: "Actions",
      render: (row, profileId, refresh) => (
        <CommunityInvolvementRowActions profileId={profileId} row={row} onChanged={refresh} />
      ),
    },
  ],
  renderAddButton: ({ profileId, onCreated }) => (
    <CommunityInvolvementAddDialog profileId={profileId} onCreated={onCreated} />
  ),
}

const awardsRecognition: PortfolioTableConfig<AwardRecognition> = {
  endpoint: (profileId) => `/api/v1/hrms/profiles/${profileId}/award-recognitions`,
  loadingLabel: "awards and recognition",
  columns: [
    { header: "Awarding Body", render: (row) => row.awardingBody },
    { header: "Nature of Award", render: (row) => row.natureAward },
    { header: "Date Received", render: (row) => formatDate(row.dateReceived) },
    { header: "Attachments", render: (row) => <AttachmentCell href={row.attachment} /> },
    {
      header: "Actions",
      render: (row, profileId, refresh) => (
        <AwardRecognitionRowActions profileId={profileId} row={row} onChanged={refresh} />
      ),
    },
  ],
  renderAddButton: ({ profileId, onCreated }) => (
    <AwardRecognitionAddDialog profileId={profileId} onCreated={onCreated} />
  ),
}

type PortfolioTableRenderer = (
  profileId: number | string,
  headerActionsEl: HTMLElement | null,
) => React.ReactNode

// TRow is captured here, at the one place it's still concrete — the returned
// renderer is a plain function with no generic left to erase into `any`.
function makeRenderer<TRow extends { id: number | string }>(
  config: PortfolioTableConfig<TRow>,
): PortfolioTableRenderer {
  return (profileId, headerActionsEl) => (
    <PortfolioTable<TRow>
      profileId={profileId}
      headerActionsEl={headerActionsEl}
      endpoint={config.endpoint(profileId)}
      loadingLabel={config.loadingLabel}
      columns={config.columns}
      renderAddButton={config.renderAddButton}
    />
  )
}

export const PORTFOLIO_TABLE_RENDERERS = {
  "educational-background": makeRenderer(educationalBackground),
  "work-experience": makeRenderer(workExperience),
  "national-certification": makeRenderer(nationalCertification),
  "organization-affiliation": makeRenderer(organizationAffiliation),
  "professional-engagement": makeRenderer(professionalEngagement),
  "research-creative-work": makeRenderer(researchEngagement),
  "community-parish-involvement": makeRenderer(communityInvolvement),
  "awards-recognition": makeRenderer(awardsRecognition),
}

export type PortfolioSectionId = keyof typeof PORTFOLIO_TABLE_RENDERERS
