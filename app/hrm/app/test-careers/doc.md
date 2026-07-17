# Redesign the SPUP Careers Applicant Landing Page

Work inside the existing repository:

```text
angelop-1602/spup-sims
```

The HRM Next.js application is located in:

```text
app/hrm
```

Develop a redesigned applicant-facing careers landing page in:

```text
app/hrm/app/test-careers/page.tsx
```

This route is an experimental replacement for the current careers page located at:

```text
app/hrm/app/careers/page.tsx
```

Do not delete, replace, rename, or modify the existing `/careers` page unless a shared type or harmless reusable utility must be updated.

The new route must remain accessible at:

```text
/test-careers
```

The purpose of this task is to design a more academically appropriate, institutional, and professional landing page for applicants who want to apply for jobs posted by St. Paul University Philippines.

This is not a general job board.

All jobs displayed on the page are vacancies offered by St. Paul University Philippines.

---

# 1. Inspect the Existing Repository Before Editing

Before writing code:

1. Inspect the current careers page:

```text
app/hrm/app/careers/page.tsx
```

2. Inspect the existing careers components:

```text
app/hrm/components/hrm/careers/
```

3. Inspect the shared careers data and TypeScript interfaces:

```text
app/hrm/components/hrm/types.ts
```

4. Inspect existing reusable UI components:

```text
app/hrm/components/ui/
```

5. Inspect:

```text
app/hrm/app/layout.tsx
app/hrm/app/globals.css
app/hrm/lib/utils.ts
app/hrm/package.json
```

6. Reuse existing utilities, shadcn components, Lucide icons, and project conventions.

7. Do not install a new dependency unless there is no reasonable way to complete the task with the existing stack.

8. Do not alter unrelated HRM modules.

---

# 2. Existing Technology

Respect the existing application stack:

* Next.js App Router
* React
* TypeScript
* Tailwind CSS 4
* shadcn/ui
* Lucide React
* Framer Motion
* Existing project aliases such as `@/components`
* Existing `cn` utility
* Existing global CSS variables
* Existing careers `Job` type and `INITIAL_JOBS` sample data

Do not migrate the project to another framework.

Do not replace Tailwind with CSS modules or styled-components.

Do not create a separate application.

---

# 3. Main Objective

Redesign the careers landing page so it feels like an official university recruitment website.

The new page should communicate:

* Institutional credibility
* Academic excellence
* Service and mission
* Professional opportunity
* Trust and security
* Clear applicant guidance
* Easy access to current vacancies

The visual experience should feel suitable for:

* Faculty applicants
* Administrative applicants
* Healthcare professionals
* Researchers
* Information technology applicants
* Support staff
* Experienced professionals
* Newly graduated applicants

The page should not feel like:

* A startup landing page
* A commercial job marketplace
* A gaming website
* A student project
* A playful portfolio
* A neo-brutalist poster
* A generic SaaS dashboard
* A social media platform

---

# 4. Applicant-Focused Scope

This page is for people applying for jobs at SPUP.

The primary applicant actions are:

1. Browse current job openings
2. Review vacancy details
3. Understand the application process
4. Prepare application requirements
5. Create or complete an applicant profile
6. Submit an application
7. Track an existing application

The page must not contain:

* Employer registration
* External company postings
* Employer directories
* Subscription pricing
* Student internship marketplaces
* External career partners
* Recruiter dashboards
* Public résumé searches
* General university admissions content

---

# 5. Preserve Existing Functionality Carefully

For the test landing page:

* Reuse `INITIAL_JOBS` from the existing careers types file.
* Reuse the existing `Job` interface.
* The job cards may open the existing `JobDetailsModal` if it can be reused without copying large amounts of state.
* Do not rewrite the application workflow during this landing-page task.
* Do not change the existing applicant data structure.
* Do not add a database integration during this design task.
* Do not duplicate existing sample job data into several files.
* Do not store new fake applications automatically.
* Do not create authentication functionality that does not exist.
* Use safe placeholder links or existing route behavior for account-related actions.

This phase focuses on the public landing-page presentation and applicant journey.

---

# 6. Code Organization

Avoid placing the entire implementation in one `page.tsx` file.

Use this suggested structure:

```text
app/hrm/app/test-careers/page.tsx

app/hrm/components/hrm/test-careers/
├── careers-header.tsx
├── mobile-careers-navigation.tsx
├── careers-hero.tsx
├── job-search-panel.tsx
├── featured-job-list.tsx
├── academic-job-card.tsx
├── employment-categories.tsx
├── why-work-at-spup.tsx
├── application-steps.tsx
├── application-requirements.tsx
├── careers-faq.tsx
├── recruitment-notice.tsx
├── careers-final-cta.tsx
└── careers-footer.tsx
```

A smaller component set is acceptable when components remain readable.

Keep:

* Data separate from presentation when practical
* Components focused on one responsibility
* Repeated UI represented through arrays and `.map()`
* Client Components limited to interactive sections
* Static content in Server Components where possible

The page itself should preferably remain a Server Component.

Use `"use client"` only in components that need:

* Search state
* Filtering
* Mobile navigation
* Accordion state
* Modal state
* Saved-job interaction
* Framer Motion animation

---

# 7. Academic Visual Direction

Use a restrained academic editorial design.

Visual references:

* University annual reports
* Academic institution websites
* University recruitment publications
* Formal institutional brochures
* Professional higher-education career portals

The design should feel:

* Scholarly
* Credible
* Calm
* Refined
* Structured
* Mission-driven
* Human
* Contemporary
* Accessible

Use generous whitespace and strong typography.

Avoid visual noise.

---

# 8. Remove the Current Neo-Brutalist Treatment

Do not repeat the design language of the existing careers page.

Remove or avoid:

* Thick two-pixel or three-pixel dark borders on every card
* Offset yellow-and-black box shadows
* Text stroke effects
* Cartoon-like floating circles
* Blurred decorative blobs
* Sticker-style “Apply Today” badges
* Buttons that physically jump several pixels on hover
* Excessive rounded containers
* Strong shadows on every section
* Grid-paper hero backgrounds
* Oversized decorative icons behind card content
* Multiple competing visual styles
* All-caps headings throughout the interface
* Tiny body text
* Excessive use of animations
* Four different font families on one page

Borders should generally be:

```text
1px
```

Shadows should be:

* Very subtle
* Used sparingly
* Limited to elevated elements such as the search panel or sticky header

---

# 9. Typography

Use no more than two font families.

Preferred approach:

* Use the existing global sans-serif font for interface text.
* Add one scholarly serif font for major editorial headings only.

Recommended serif options:

* Libre Baskerville
* Source Serif 4
* Lora
* Merriweather

Choose only one.

If adding a font through `next/font/google`, define it once in the test-careers page or an appropriate layout, not separately in every component.

Do not import Poppins, Epilogue, Inter, and Instrument Serif independently across each component.

Typography hierarchy:

```text
Hero heading:
48–64px desktop
38–46px tablet
34–40px mobile

Section heading:
32–42px desktop
28–34px mobile

Card title:
18–21px

Body:
15–17px

Supporting text:
14–16px

Metadata:
13–14px
```

Use readable line heights.

Do not use text strokes.

Do not use exaggerated letter spacing in ordinary paragraphs.

Avoid body text smaller than 14px.

---

# 10. Color Direction

Use an SPUP-inspired institutional palette.

Recommended page colors:

```text
Deep Green:
#063D29

Institutional Green:
#07543A

Medium Green:
#167654

Soft Green:
#E7F1EB

Warm Ivory:
#FAF8F1

Muted Gold:
#B78A28

Soft Gold:
#F4E8C5

Ink:
#18211C

Muted Text:
#66716A

Light Border:
#DCE3DE

White:
#FFFFFF
```

These values are design approximations.

Prefer existing CSS variables where appropriate.

Use:

* Deep green for main calls to action
* Gold as a restrained accent
* Ivory for alternating sections
* White for primary surfaces
* Dark ink for body text
* Muted gray-green for metadata

Do not use gold for long body text.

Do not use green text on green backgrounds without sufficient contrast.

Do not make every section green.

---

# 11. Page Background and Decorative Details

Use a clean white or warm-ivory base.

Optional academic decorative elements:

* Thin gold rules
* Subtle vertical lines
* Small seal-inspired circles
* Restrained geometric corner details
* A very subtle campus-architecture line pattern
* Editorial section numbering
* Small eyebrow labels

Do not use:

* Large blurred blobs
* Random circles scattered across the screen
* Grid-paper backgrounds
* Cartoon decorations
* Neon colors
* Glassmorphism

Decorative elements must never compete with content.

---

# 12. Header

Create an official-looking sticky header.

Desktop layout:

```text
[SPUP Logo]  SPUP Careers
             Recruitment Portal

Home
Job Openings
Why SPUP
Application Process
FAQs

Applicant Sign In
Create Applicant Profile
```

Use the existing SPUP logo asset:

```text
/SPUP-final-logo.png
```

Brand block:

```text
SPUP Careers
St. Paul University Philippines
```

Optional smaller label:

```text
Human Resource Management Office
```

Header behavior:

* Sticky at the top
* White or warm-ivory background
* Subtle bottom border
* Slightly reduced height after scroll if implemented
* No large shadow
* Accessible keyboard navigation
* Visible focus states
* Responsive mobile navigation

Mobile behavior:

* Logo and brand on the left
* Menu button on the right
* Navigation opens using an accessible shadcn Sheet
* Main actions remain clearly visible inside the menu
* Close the sheet after selecting a link
* Prevent horizontal overflow

Navigation items should scroll to sections on the page:

```text
#openings
#why-spup
#application-process
#faqs
```

Account buttons may use placeholder or existing links.

Do not invent a login route without checking the repository first.

---

# 13. Optional Institutional Utility Bar

Above the main header, add a restrained utility bar.

Suggested content:

Left:

```text
Official Recruitment Portal
```

Right:

```text
Visit SPUP Website
Contact Human Resources
```

Keep this bar small.

Suggested styling:

* Deep-green background
* White or pale-gold text
* 32–38px height
* 12–13px typography

Hide secondary utility items on very small screens when necessary.

---

# 14. Hero Section

Create a refined two-column hero.

Desktop:

```text
Left: 55–60%
Right: 40–45%
```

Mobile:

```text
Single column
Text first
Image second
```

Hero eyebrow:

```text
CAREERS AT ST. PAUL UNIVERSITY PHILIPPINES
```

Hero heading:

```text
Build a Meaningful Career in a Community of Excellence and Service.
```

Alternative acceptable heading:

```text
Bring Your Expertise to a Mission That Matters.
```

Hero description:

```text
Explore teaching, administrative, professional, healthcare, research,
technical, and support opportunities at St. Paul University Philippines.
Join a values-driven academic community committed to excellence,
compassion, innovation, and service.
```

Primary action:

```text
Explore Job Openings
```

Secondary action:

```text
View Application Process
```

Small applicant link:

```text
Already submitted an application? Track your application.
```

Hero image:

* Use an existing suitable SPUP image when available.
* Prefer a real campus, faculty, employee, or professional university image.
* Do not use a generic foreign-office stock photograph.
* Use `next/image`.
* Include meaningful alt text.
* Use a restrained rectangular or softly rounded crop.
* Do not place the image inside a floating glass card.

If no suitable image exists, create an elegant visual placeholder using:

* A deep-green panel
* A subtle institutional pattern
* The SPUP seal
* A short mission statement

Do not use image URLs from external websites.

---

# 15. Hero Institutional Detail

Add one subtle institutional visual detail.

Example:

```text
A thin gold vertical rule beside the eyebrow
```

or:

```text
A small seal watermark at low opacity
```

or:

```text
A caption below the hero image:
A Paulinian workplace shaped by service, excellence, and shared purpose.
```

Keep it restrained.

---

# 16. Search Panel

Place a professional vacancy search panel overlapping the lower hero boundary slightly or directly below the hero.

Fields:

1. Keyword
2. Department
3. Workplace
4. Search button

Keyword placeholder:

```text
Search position, department, or qualification
```

Department options should be derived from `INITIAL_JOBS`.

Workplace options should use values from the existing `Job` type:

* Onsite
* Hybrid
* Remote

The panel should:

* Filter the featured jobs displayed below
* Use clear labels
* Be fully keyboard accessible
* Stack on mobile
* Use existing shadcn Input, Select, and Button where practical
* Include a reset action when filters are active
* Display the number of matching openings
* Avoid placing important labels only in placeholders

Use a subtle surface:

* White background
* 1px border
* Very soft shadow
* 12–16px radius
* Generous internal padding

Do not make it resemble a dashboard toolbar.

---

# 17. Current Openings Section

Section ID:

```text
openings
```

Eyebrow:

```text
CURRENT OPPORTUNITIES
```

Heading:

```text
Find Your Place at SPUP
```

Description:

```text
Review current vacancies across the university and select a position
that matches your qualifications, experience, and commitment to service.
```

Display all relevant jobs from `INITIAL_JOBS`, or initially show four and provide an accessible “View all openings” action.

Do not call this section “Featured Jobs” unless jobs are actually configured as featured.

Preferred term:

```text
Current Job Openings
```

Include:

* Matching result count
* Search/filter state
* Empty state
* Clear filters action

---

# 18. Academic Job Card

Redesign the existing job card.

Each card must display:

* Position title
* Department
* Location
* Employment type
* Workplace arrangement
* Experience level
* Date posted
* Application deadline
* Short description
* View Details action
* Save action only when it is genuinely functional

Recommended card structure:

```text
[Category or department eyebrow]

Position Title

Department
Location

[Full-time] [Onsite] [Mid Level]

Short description limited to three lines

Posted date                 Application deadline

View Position →
```

Visual treatment:

* White background
* 1px neutral or green-gray border
* 12px radius
* No thick border
* No offset yellow shadow
* Subtle hover border or shadow
* No dramatic movement
* Title remains dark ink or deep green
* Gold used only for a small accent or deadline icon
* Consistent equal heights when used in a grid

Desktop:

```text
Two-column grid
```

Large desktop may use:

```text
Three-column grid
```

Mobile:

```text
One-column list
```

Preferred for academic readability:

```text
Two-column grid at desktop
```

Do not compress long department names into tiny text.

Use Lucide icons sparingly for:

* MapPin
* BriefcaseBusiness
* Clock
* CalendarDays
* Bookmark

Do not add an icon to every sentence.

---

# 19. Job Card Interaction

Clicking “View Position” should:

Preferred option:

* Open the existing job detail modal if it can be cleanly reused.

Alternative:

* Use a dedicated accessible dialog within the test-careers components.

The modal or dialog should preserve the existing job information:

* Description
* Responsibilities
* Requirements
* Benefits
* Deadline
* Employment information

Do not rewrite or remove the existing application functionality unless necessary.

The dialog must:

* Have a clear title
* Be keyboard accessible
* Trap focus
* Close with Escape
* Restore focus after closing
* Work on mobile
* Allow internal scrolling
* Avoid excessively wide layouts

---

# 20. Empty Search State

When no jobs match:

Heading:

```text
No openings match your search
```

Description:

```text
Try using a broader keyword or removing one or more filters.
```

Actions:

```text
Clear Filters
View All Openings
```

Use a simple icon and restrained design.

Do not show an error style.

---

# 21. Employment Areas Section

Create an editorial category section.

Section heading:

```text
Opportunities Across the University
```

Suggested categories:

* Teaching and Academic
* Administration and Professional Services
* Healthcare and Clinical Services
* Research and Innovation
* Information Technology
* Student and Support Services

Each category should include:

* Small icon
* Category name
* One-sentence explanation
* Optional count derived from existing jobs where possible
* Link or button that applies the corresponding filter

Use a clean six-item grid.

Do not create overly decorative cards.

Alternative visual:

* Simple bordered list with icons and thin dividers

---

# 22. Why Work at SPUP Section

Section ID:

```text
why-spup
```

Use an ivory or very pale-green background.

Eyebrow:

```text
A PAULINIAN WORKPLACE
```

Heading:

```text
A Career Grounded in Purpose
```

Suggested introduction:

```text
At SPUP, professional work contributes to a larger educational mission.
Every role supports the formation of learners, the advancement of
knowledge, and meaningful service to communities.
```

Include four institutional value points:

## Excellence in Education

```text
Contribute your expertise to a university committed to high standards
in teaching, research, professional service, and institutional practice.
```

## Service With Compassion

```text
Work within a community that values dignity, responsibility,
collaboration, and care for others.
```

## Professional Development

```text
Grow through meaningful responsibilities, collegial learning,
and opportunities for continuous professional formation.
```

## Collaborative Community

```text
Join educators, administrators, researchers, healthcare professionals,
and support personnel working toward a shared institutional mission.
```

Do not claim specific benefits that have not been verified.

Do not promise:

* Automatic promotions
* Salary increases
* Free graduate education
* Paid licenses
* Full health coverage
* Retirement benefits
* Tuition waivers

The existing sample data contains benefit claims that may not be institutionally verified. Do not surface such claims prominently in the new landing page unless confirmed by SPUP HR.

---

# 23. Mission Statement Panel

Add a restrained institutional quote or mission statement between major sections.

Example:

```text
“Your work at SPUP becomes part of a wider mission—forming persons,
strengthening communities, and advancing knowledge through service.”
```

Label:

```text
The Paulinian Commitment
```

This should look editorial, not like a testimonial carousel.

Use:

* Serif typography
* Thin gold rule
* Plenty of whitespace

Do not attribute the quote to a real person unless verified.

---

# 24. Application Process Section

Section ID:

```text
application-process
```

Eyebrow:

```text
HOW TO APPLY
```

Heading:

```text
Your Application Journey
```

Description:

```text
Follow a clear and secure process from vacancy selection to recruitment
evaluation.
```

Use five steps rather than the current four:

1. Explore Openings
2. Review Qualifications
3. Complete Your Profile
4. Submit Requirements
5. Track Your Application

Descriptions:

## 1. Explore Openings

```text
Review available positions and identify a role that matches your
education, experience, and professional interests.
```

## 2. Review Qualifications

```text
Read the position description, minimum qualifications, required
credentials, and application deadline carefully.
```

## 3. Complete Your Profile

```text
Provide accurate personal, educational, employment, and professional
information in your applicant profile.
```

## 4. Submit Requirements

```text
Upload the documents required for the selected vacancy and review your
application before final submission.
```

## 5. Track Your Application

```text
Use the applicant portal to view official updates, additional
requirements, and recruitment schedules.
```

Visual direction:

* Horizontal progression on desktop
* Vertical timeline on mobile
* Simple numbered circles
* Thin connecting rule
* Minimal icons
* No large illustrated card icons
* No dark outlined neo-brutalist boxes

CTA:

```text
Create Applicant Profile
```

Secondary:

```text
Learn More About the Process
```

---

# 25. Application Requirements Section

Heading:

```text
Prepare Your Application Documents
```

Description:

```text
Requirements vary by position. Review the specific vacancy carefully
before submitting your application.
```

Show a clean checklist with two groups.

## Commonly Required

* Application letter
* Updated résumé or curriculum vitae
* Transcript of Records
* Diploma

## When Applicable

* Valid PRC identification
* Certificate of Employment
* Latest performance rating
* Certificates of training
* Professional eligibility documents
* Other vacancy-specific credentials

Important notice:

```text
The final list of required documents is determined by the vacancy.
Only submit documents requested through official SPUP recruitment
channels.
```

Use:

* Check icons
* Subtle list separators
* Required and “when applicable” labels
* A clean two-column layout

Do not use a separate heavily styled card for each document.

Do not include unverified instructions addressed to named university officials.

---

# 26. Recruitment Security Notice

Create a visible but calm notice.

Heading:

```text
Apply Only Through Official SPUP Channels
```

Content:

```text
St. Paul University Philippines does not authorize unofficial
representatives to collect applicant information or recruitment
payments. Protect your personal information and use only this portal
and verified SPUP contact channels.
```

Use:

* ShieldCheck icon
* Pale-green or pale-gold background
* 1px border
* No alarming red treatment

Do not claim that SPUP never charges any type of fee unless confirmed by HR.

Use wording that focuses on avoiding unofficial channels and payments.

---

# 27. Frequently Asked Questions

Section ID:

```text
faqs
```

Eyebrow:

```text
APPLICANT GUIDANCE
```

Heading:

```text
Frequently Asked Questions
```

Use an accessible shadcn Accordion.

Do not use category tabs unless they materially improve usability.

For the landing page, show six questions:

1. How do I apply for a position?
2. Can I apply for more than one opening?
3. What documents should I prepare?
4. Can I update my application after submission?
5. How will I know whether my application has progressed?
6. Who should I contact if I experience a technical issue?

FAQ requirements:

* Use cautious, accurate wording.
* Do not promise a seven-to-fourteen-day review period unless verified.
* Do not claim “absolute confidentiality.”
* Explain that submission does not guarantee an interview or employment.
* State that official updates should be monitored through the portal and verified SPUP channels.
* Avoid unsupported email addresses.
* Reuse a verified contact address from the repository only if confirmed.

Suggested answers:

## How do I apply for a position?

```text
Select an open vacancy, review its qualifications and document
requirements, then sign in or create an applicant profile to complete
and submit your application.
```

## Can I apply for more than one opening?

```text
You may apply for more than one vacancy when your qualifications match
the requirements. A separate application may be required for each
position.
```

## What documents should I prepare?

```text
Common documents include an application letter, résumé or curriculum
vitae, Transcript of Records, and diploma. Licenses, certificates, and
other supporting documents may be required for specific positions.
```

## Can I update my application after submission?

```text
You may update your reusable applicant profile, but information already
submitted for a particular vacancy may be locked. Follow any official
request from the Human Resource Management Office for corrections or
additional documents.
```

## How will I receive application updates?

```text
Official updates may appear in your applicant dashboard and may also be
sent to your registered email address. Keep your contact information
current and monitor official SPUP channels.
```

## Does submitting an application guarantee an interview?

```text
No. Applications are reviewed according to the requirements of the
position and the university’s recruitment process.
```

Add:

```text
View All Applicant Questions
```

only when a destination exists.

---

# 28. Final Call to Action

Create a formal final CTA on a deep-green background.

Eyebrow:

```text
BEGIN YOUR PAULINIAN JOURNEY
```

Heading:

```text
Bring Your Knowledge, Experience, and Commitment to SPUP.
```

Description:

```text
Review current vacancies and submit your application through the
official St. Paul University Philippines recruitment portal.
```

Primary action:

```text
Browse Job Openings
```

Secondary action:

```text
Create Applicant Profile
```

Use gold only as a restrained accent.

Do not use decorative blobs.

---

# 29. Footer

Create a complete institutional footer.

Left column:

```text
SPUP Careers
St. Paul University Philippines Recruitment Portal
```

Description:

```text
The official platform for employment opportunities and applicant
services at St. Paul University Philippines.
```

Navigation groups:

## Applicants

* Job Openings
* Application Process
* Application Requirements
* Frequently Asked Questions

## About Employment

* Why Work at SPUP
* Employment Areas
* Recruitment Notice

## Support

* Applicant Sign In
* Track Application
* Contact Human Resources
* Technical Support

Institutional links:

* Main SPUP Website
* Privacy Notice
* Terms of Use
* Accessibility

Footer details:

```text
© 2026 St. Paul University Philippines. All rights reserved.
```

Use actual verified contact details only.

Do not invent:

* Telephone numbers
* Email addresses
* Office locations
* Office hours

Use placeholders clearly marked in code comments when the information is not available.

---

# 30. Search and Filtering Behavior

Create a client component responsible for job filtering.

Filter fields:

* Search query
* Department
* Workplace arrangement

Optional:

* Employment type
* Experience level

Behavior:

* Case-insensitive search
* Match title
* Match department
* Match description
* Match requirements where reasonable
* Reset filters
* Display result count
* Preserve responsive layout
* Do not use URL query parameters unless simple to implement cleanly
* Avoid unnecessary effects
* Use `useMemo` for filtered results
* Avoid copying the entire current page state into the new route

Search state should be located close to the jobs section.

Do not make the entire page a Client Component just for filtering.

---

# 31. Animation

Use animation sparingly.

Permitted:

* Subtle fade-and-rise when sections enter the viewport
* Gentle job card hover
* Mobile navigation transition
* Accordion opening
* Dialog transition

Animation duration:

```text
150–350ms
```

Respect:

```css
prefers-reduced-motion
```

Do not use:

* Continually moving elements
* Pulsing decorative dots
* Floating circles
* Parallax
* Large spring animations
* Dramatic page transitions
* Delayed entrance animations on every child
* Layout shifts on hover

The page must remain effective with animation disabled.

---

# 32. Accessibility

Target WCAG 2.2 Level AA.

Implement:

* Semantic header, nav, main, section, article, and footer elements
* Skip-to-content link
* Logical heading order
* Keyboard-accessible navigation
* Accessible mobile Sheet
* Accessible Dialog
* Accessible Accordion
* Visible focus rings
* Proper form labels
* Helpful validation messages
* Minimum 44px interactive targets
* Meaningful image alt text
* Decorative images hidden from assistive technology
* Sufficient color contrast
* No essential meaning communicated through color alone
* Reduced-motion support
* Buttons for actions
* Links for navigation

Do not use clickable `<div>` elements.

Do not use `href="#"` for unfinished navigation.

Use a disabled button, valid anchor target, or clearly defined placeholder behavior.

---

# 33. Responsive Requirements

The landing page must work at:

```text
320px
375px
430px
768px
1024px
1280px
1440px
```

Mobile requirements:

* No horizontal scrolling
* Header remains compact
* Hero text remains readable
* Buttons become full-width when needed
* Search fields stack
* Job cards use one column
* Application timeline becomes vertical
* Footer columns stack
* Dialog fits the viewport
* Sticky actions do not cover content

Tablet requirements:

* Hero may remain two columns when space allows
* Job cards use two columns
* Search panel wraps cleanly

Desktop requirements:

* Maximum content width around `1280px`
* Balanced two-column hero
* Two or three job columns
* Generous whitespace
* Controlled text width

---

# 34. Reuse Existing Job Data

Import:

```tsx
import { INITIAL_JOBS, type Job } from "@/components/hrm/types";
```

Do not redefine the `Job` interface.

Do not paste duplicate job objects into the new component folder.

Where dates are displayed:

* Parse dates safely
* Format them consistently
* Avoid displaying raw ISO strings
* Handle invalid dates gracefully

Possible format:

```text
Posted June 25, 2026
Closes August 15, 2026
```

Do not calculate “days remaining” if it could become misleading without handling time zones correctly.

---

# 35. Review Existing Sample Copy

Some sample job data contains specific benefits and institutional claims.

Do not prominently display unverified claims such as:

* Guaranteed tuition waivers
* Premium salary leveling
* Full healthcare coverage
* Retirement contribution matching
* Paid professional licenses
* Paid recess benefits
* Fully supported conferences

Keep the existing data unchanged for compatibility, but avoid emphasizing the `benefits` section on the landing-page cards.

The job detail modal may continue to display existing data as part of the prototype, but add a code comment identifying sample content that requires HR verification before production.

Do not alter real institutional policies based on assumptions.

---

# 36. Fix Obvious UI Issues in the Test Route

Within the new test route, ensure:

* Bookmark buttons have functional click handlers or are omitted.
* Buttons do not use `href="#"`.
* Navigation works on mobile.
* Text is not excessively small.
* Long department names wrap correctly.
* Buttons have consistent sizes.
* Job cards have clear focus states.
* Images use `next/image` where possible.
* The page does not import unused fonts or icons.
* There are no unused state values.
* There are no React key warnings.
* No browser console errors occur.
* No hydration errors occur.
* No invalid Tailwind classes are introduced.

Do not modify the current careers page merely to fix these issues during this test-page task.

---

# 37. Metadata

Add route metadata.

Because `page.tsx` may need to remain a Server Component, export:

```tsx
export const metadata: Metadata = {
  title: "Careers at SPUP | St. Paul University Philippines",
  description:
    "Explore current employment opportunities and apply through the official St. Paul University Philippines recruitment portal.",
};
```

If metadata cannot be exported because the page becomes a Client Component, move interactive behavior into child Client Components instead.

Add suitable Open Graph metadata when practical.

---

# 38. Page Performance

Optimize the page:

* Prefer Server Components
* Avoid loading Framer Motion for static sections unless needed
* Use `next/image`
* Avoid giant background assets
* Avoid unnecessary state
* Avoid duplicated font downloads
* Lazy-load below-the-fold noncritical media
* Keep client-side JavaScript limited
* Avoid rendering the entire page through one Client Component
* Avoid unnecessary ResizeObserver logic
* Avoid calculating decorative grid dimensions

The existing `FeaturedJobs` component uses layout calculations tied to a decorative grid. Do not carry that implementation into the new page.

---

# 39. Content Width and Spacing

Use a consistent layout container:

```text
max-width: approximately 1280px
```

Recommended horizontal padding:

```text
Mobile: 20px
Tablet: 32px
Desktop: 40–48px
```

Recommended vertical section spacing:

```text
Mobile: 64–80px
Desktop: 88–120px
```

Use readable content widths:

* Hero text: max 680px
* Long paragraphs: max 720px
* FAQ content: max 900px

Do not let text stretch across the full viewport.

---

# 40. Suggested Page Order

Build the page in this order:

1. Skip-to-content link
2. Optional institutional utility bar
3. Main header
4. Hero
5. Search panel
6. Current job openings
7. Employment areas
8. Why work at SPUP
9. Institutional mission statement
10. Application process
11. Application requirements
12. Recruitment security notice
13. Frequently asked questions
14. Final CTA
15. Footer
16. Existing job detail modal, if reused

Keep the user’s most important task—viewing vacancies—near the top.

---

# 41. Quality Requirements

Before considering the task complete:

1. Run TypeScript checking through the existing build command.
2. Run ESLint.
3. Verify `/test-careers` loads successfully.
4. Confirm `/careers` remains unchanged and functional.
5. Verify mobile navigation.
6. Verify job search.
7. Verify filters.
8. Verify reset behavior.
9. Verify job detail interaction.
10. Verify all section anchor links.
11. Verify keyboard navigation.
12. Verify focus states.
13. Verify no horizontal overflow at 320px.
14. Verify no console errors.
15. Verify no hydration errors.
16. Verify reduced-motion behavior.
17. Verify all images have correct alt text.
18. Verify no unapproved contact information was invented.
19. Verify no unsupported institutional claims were added.
20. Verify the production build succeeds.

Use:

```bash
cd app/hrm
npm run lint
npm run build
```

Do not suppress lint or TypeScript errors with broad disable comments.

Do not use `any` unless unavoidable and documented.

---

# 42. Deliverables

At completion, provide:

1. A summary of the new design.
2. A list of files created.
3. A list of files modified.
4. Any existing components reused.
5. Any assumptions made.
6. Any placeholder content requiring HR verification.
7. Build and lint results.
8. Any remaining accessibility concerns.
9. Confirmation that `/careers` was not changed.
10. Confirmation that `/test-careers` is responsive.

Do not merge the test design into the current careers route.

The final implementation must remain isolated under `/test-careers` until it has been reviewed and approved.
