export const PROFILE_DETAILS_SECTION = {
  id: "profile-details",
  label: "Profile Details",
  shortLabel: "Profile",
  description: "Personal, contact, and employment information.",
} as const

export const PORTFOLIO_RECORD_SECTIONS = [
  {
    id: "educational-background",
    label: "Educational Background",
    shortLabel: "Education",
    description: "Degrees, institutions, graduation dates, and academic credentials.",
    emptyMessage: "No educational records available.",
  },
  {
    id: "work-experience",
    label: "Work Experience",
    shortLabel: "Work Experience",
    description: "Previous positions, institutions, service dates, and supporting files.",
    emptyMessage: "No work experience records available.",
  },
  {
    id: "national-certification",
    label: "National Certifications",
    shortLabel: "Certifications",
    description: "Licenses, ratings, validity dates, and certification files.",
    emptyMessage: "No certifications recorded.",
  },
  {
    id: "organization-affiliation",
    label: "Professional Organizations",
    shortLabel: "Organizations",
    description: "Professional affiliations, memberships, remarks, and supporting files.",
    emptyMessage: "No professional organizations recorded.",
  },
  {
    id: "professional-engagement",
    label: "Professional Engagements",
    shortLabel: "Engagements",
    description: "Professional activities, engagement types, remarks, and supporting files.",
    emptyMessage: "No professional engagements recorded.",
  },
  {
    id: "research-creative-work",
    label: "Research / Creative Work Engagements",
    shortLabel: "Research / Creative Works",
    description: "Research titles, engagement and utilization details, publication dates, and files.",
    emptyMessage: "No research or creative work engagements recorded.",
  },
  {
    id: "community-parish-involvement",
    label: "Community and Parish Involvement",
    shortLabel: "Community Involvement",
    description: "Community activities, involvement details, dates, and supporting files.",
    emptyMessage: "No community or parish involvement recorded.",
  },
  {
    id: "awards-recognition",
    label: "Awards and Recognition",
    shortLabel: "Awards",
    description: "Awards, granting bodies, dates received, and supporting files.",
    emptyMessage: "No awards or recognitions recorded.",
  },
] as const

export const PORTFOLIO_SECTIONS = [
  PROFILE_DETAILS_SECTION,
  ...PORTFOLIO_RECORD_SECTIONS,
] as const

export type PortfolioSectionId = (typeof PORTFOLIO_SECTIONS)[number]["id"]
export type PortfolioRecordSectionId =
  (typeof PORTFOLIO_RECORD_SECTIONS)[number]["id"]

export const PORTFOLIO_SECTION_IDS = PORTFOLIO_SECTIONS.map(
  (section) => section.id,
)

export function getPortfolioRecordSection(id: PortfolioRecordSectionId) {
  return PORTFOLIO_RECORD_SECTIONS.find((section) => section.id === id)!
}
