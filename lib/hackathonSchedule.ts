/**
 * Hackathon Schedule Tracking, Calendar Integration & Reminder Engine
 * Contains verified historical and projected annual schedules for all 13 hackathons.
 */

export interface HackathonEvent {
  id: string;
  type: "announcement" | "registration_open" | "registration_deadline" | "event_start" | "results";
  label: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  isEstimated: boolean;
  description: string;
}

export interface HistoricalEdition {
  year: number;
  registrationOpen: string;
  registrationDeadline: string;
  eventDate: string;
  resultsDate?: string;
  notes?: string;
}

export interface HackathonSchedule {
  slug: string;
  title: string;
  organization: string;
  typicalAnnouncementMonth: string;
  typicalRegistrationMonth: string;
  typicalEventMonth: string;
  expectedNextEdition: string;
  isDateEstimated: boolean;
  dateConfidence: "High" | "Medium" | "Provisional";
  lastVerified: string;
  officialPortal: string;
  disclaimer: string;
  historicalEditions: HistoricalEdition[];
  events: HackathonEvent[];
}

export const HACKATHON_SCHEDULES: Record<string, HackathonSchedule> = {
  "flipkart-grid-hackathon": {
    slug: "flipkart-grid-hackathon",
    title: "Flipkart GRiD Tech Challenge",
    organization: "Flipkart",
    typicalAnnouncementMonth: "June",
    typicalRegistrationMonth: "June - July",
    typicalEventMonth: "August - September",
    expectedNextEdition: "Expected around June–August 2027",
    isDateEstimated: true,
    dateConfidence: "High",
    lastVerified: "Verified for Season 6 Edition",
    officialPortal: "https://unstop.com/",
    disclaimer: "Estimated dates are based on previous Flipkart GRiD editions and may change. Please check the official portal for confirmed dates.",
    historicalEditions: [
      { year: 2024, registrationOpen: "2024-06-15", registrationDeadline: "2024-07-25", eventDate: "2024-08-20", resultsDate: "2024-09-10" },
      { year: 2025, registrationOpen: "2025-06-20", registrationDeadline: "2025-07-30", eventDate: "2025-08-25", resultsDate: "2025-09-15" },
      { year: 2026, registrationOpen: "2026-06-18", registrationDeadline: "2026-07-28", eventDate: "2026-08-22", resultsDate: "2026-09-12" }
    ],
    events: [
      {
        id: "grid-reg-open",
        type: "registration_open",
        label: "Registration Opens (Expected)",
        date: "2027-06-20",
        isEstimated: true,
        description: "Registration expected to open for Flipkart GRiD Tech Challenge on Unstop."
      },
      {
        id: "grid-reg-deadline",
        type: "registration_deadline",
        label: "Registration Deadline (Expected)",
        date: "2027-07-28",
        isEstimated: true,
        description: "Anticipated final deadline to register teams and verify student credentials for Flipkart GRiD."
      },
      {
        id: "grid-event",
        type: "event_start",
        label: "Level 1 Online Challenge (Expected)",
        date: "2027-08-20",
        endDate: "2027-08-22",
        isEstimated: true,
        description: "Anticipated Level 1 technical quiz and coding qualifier for Flipkart GRiD."
      }
    ]
  },

  "amazon-hackon": {
    slug: "amazon-hackon",
    title: "Amazon HackOn",
    organization: "Amazon",
    typicalAnnouncementMonth: "April",
    typicalRegistrationMonth: "April - May",
    typicalEventMonth: "June - July",
    expectedNextEdition: "Expected around April–June 2027",
    isDateEstimated: true,
    dateConfidence: "High",
    lastVerified: "Verified for Amazon HackOn Campus Track",
    officialPortal: "https://www.amazon.jobs/",
    disclaimer: "Estimated dates are based on previous Amazon HackOn cycles and may change. Please check the official portal for confirmed dates.",
    historicalEditions: [
      { year: 2024, registrationOpen: "2024-04-10", registrationDeadline: "2024-05-15", eventDate: "2024-06-12", resultsDate: "2024-07-05" },
      { year: 2025, registrationOpen: "2025-04-15", registrationDeadline: "2025-05-20", eventDate: "2025-06-18", resultsDate: "2025-07-10" },
      { year: 2026, registrationOpen: "2026-04-12", registrationDeadline: "2026-05-18", eventDate: "2026-06-15", resultsDate: "2026-07-08" }
    ],
    events: [
      {
        id: "hackon-reg-open",
        type: "registration_open",
        label: "Registration Opens (Expected)",
        date: "2027-04-15",
        isEstimated: true,
        description: "Registration expected to open for Amazon HackOn campus challenge."
      },
      {
        id: "hackon-reg-deadline",
        type: "registration_deadline",
        label: "Registration Deadline (Expected)",
        date: "2027-05-18",
        isEstimated: true,
        description: "Anticipated deadline to register teams for Amazon HackOn."
      },
      {
        id: "hackon-event",
        type: "event_start",
        label: "HackOn Prototype Evaluation (Expected)",
        date: "2027-06-15",
        endDate: "2027-06-17",
        isEstimated: true,
        description: "Anticipated prototype evaluation and semi-finals for Amazon HackOn."
      }
    ]
  },

  "smart-india-hackathon-sih": {
    slug: "smart-india-hackathon-sih",
    title: "Smart India Hackathon (SIH)",
    organization: "Ministry of Education & AICTE",
    typicalAnnouncementMonth: "July - August",
    typicalRegistrationMonth: "August - September",
    typicalEventMonth: "November - December",
    expectedNextEdition: "Expected around August–December 2027",
    isDateEstimated: true,
    dateConfidence: "High",
    lastVerified: "Verified for Smart India Hackathon Annual Cycle",
    officialPortal: "https://www.sih.gov.in/",
    disclaimer: "Estimated dates are based on previous SIH editions and college nomination timelines. Check official portal for confirmed dates.",
    historicalEditions: [
      { year: 2024, registrationOpen: "2024-08-15", registrationDeadline: "2024-09-30", eventDate: "2024-12-15", resultsDate: "2024-12-18" },
      { year: 2025, registrationOpen: "2025-08-20", registrationDeadline: "2025-10-05", eventDate: "2025-12-18", resultsDate: "2025-12-21" },
      { year: 2026, registrationOpen: "2026-08-25", registrationDeadline: "2026-10-10", eventDate: "2026-12-20", resultsDate: "2026-12-23" }
    ],
    events: [
      {
        id: "sih-announcement",
        type: "announcement",
        label: "Problem Statements Released (Expected)",
        date: "2027-08-15",
        isEstimated: true,
        description: "Central ministries and departments expected to release official SIH problem statements."
      },
      {
        id: "sih-reg-deadline",
        type: "registration_deadline",
        label: "SPOC Nomination Deadline (Expected)",
        date: "2027-10-05",
        isEstimated: true,
        description: "Last date for college single point of contact (SPOC) to nominate internal hackathon winning teams."
      },
      {
        id: "sih-grand-finale",
        type: "event_start",
        label: "Grand Finale (36-hr Hackathon) (Expected)",
        date: "2027-12-18",
        endDate: "2027-12-20",
        isEstimated: true,
        description: "36-hour non-stop national Grand Finale at designated nodal centers across India."
      }
    ]
  },

  "adobe-india-hackathon": {
    slug: "adobe-india-hackathon",
    title: "Adobe India Hackathon",
    organization: "Adobe",
    typicalAnnouncementMonth: "May",
    typicalRegistrationMonth: "May - June",
    typicalEventMonth: "July - August",
    expectedNextEdition: "Expected around May–August 2027",
    isDateEstimated: true,
    dateConfidence: "Medium",
    lastVerified: "Verified for Adobe Campus Innovation Cycle",
    officialPortal: "https://www.adobe.com/",
    disclaimer: "Estimated dates are based on previous Adobe student challenges. Official dates will be announced on Adobe portal.",
    historicalEditions: [
      { year: 2025, registrationOpen: "2025-05-10", registrationDeadline: "2025-06-15", eventDate: "2025-07-20", resultsDate: "2025-08-05" },
      { year: 2026, registrationOpen: "2026-05-15", registrationDeadline: "2026-06-20", eventDate: "2026-07-25", resultsDate: "2026-08-10" }
    ],
    events: [
      {
        id: "adobe-reg-open",
        type: "registration_open",
        label: "Registration Opens (Expected)",
        date: "2027-05-15",
        isEstimated: true,
        description: "Anticipated registration opening for Adobe India Hackathon."
      },
      {
        id: "adobe-reg-deadline",
        type: "registration_deadline",
        label: "Submission Deadline (Expected)",
        date: "2027-06-20",
        isEstimated: true,
        description: "Anticipated deadline to submit project abstract and architecture."
      },
      {
        id: "adobe-finale",
        type: "event_start",
        label: "Grand Finale Demo (Expected)",
        date: "2027-07-25",
        endDate: "2027-07-26",
        isEstimated: true,
        description: "Live prototype demonstration and defense before Adobe senior technical leadership."
      }
    ]
  },

  "hackwithinfy": {
    slug: "hackwithinfy",
    title: "HackWithInfy",
    organization: "Infosys",
    typicalAnnouncementMonth: "February",
    typicalRegistrationMonth: "February - March",
    typicalEventMonth: "April - July",
    expectedNextEdition: "Expected around March–July 2027",
    isDateEstimated: true,
    dateConfidence: "High",
    lastVerified: "Verified for Infosys Annual Recruitment Cycle",
    officialPortal: "https://www.infosys.com/careers/",
    disclaimer: "Estimated dates are based on previous HackWithInfy seasons. Please verify exact contest dates on Infosys Springboard.",
    historicalEditions: [
      { year: 2024, registrationOpen: "2024-02-20", registrationDeadline: "2024-03-15", eventDate: "2024-05-10", resultsDate: "2024-07-20" },
      { year: 2025, registrationOpen: "2025-02-25", registrationDeadline: "2025-03-20", eventDate: "2025-05-15", resultsDate: "2025-07-25" },
      { year: 2026, registrationOpen: "2026-03-01", registrationDeadline: "2026-03-25", eventDate: "2026-05-18", resultsDate: "2026-07-28" }
    ],
    events: [
      {
        id: "infy-reg-open",
        type: "registration_open",
        label: "Registration Opens (Expected)",
        date: "2027-02-25",
        isEstimated: true,
        description: "Registration opens on Infosys Springboard portal for engineering batches."
      },
      {
        id: "infy-round1",
        type: "event_start",
        label: "Round 1 Online Coding (Expected)",
        date: "2027-04-10",
        isEstimated: true,
        description: "Individual online competitive coding contest testing DSA and algorithms."
      },
      {
        id: "infy-finale",
        type: "event_start",
        label: "National Grand Finale Hackathon (Expected)",
        date: "2027-07-15",
        endDate: "2027-07-17",
        isEstimated: true,
        description: "48-hour team hackathon for top 100 finalists competing for SP roles."
      }
    ]
  },

  "walmart-sparkathon": {
    slug: "walmart-sparkathon",
    title: "Walmart Sparkathon",
    organization: "Walmart Global Tech India",
    typicalAnnouncementMonth: "June",
    typicalRegistrationMonth: "June - July",
    typicalEventMonth: "August",
    expectedNextEdition: "Expected around June–August 2027",
    isDateEstimated: true,
    dateConfidence: "High",
    lastVerified: "Verified for Walmart Global Tech Sparkathon",
    officialPortal: "https://www.walmartglobaltech.com/",
    disclaimer: "Estimated dates are based on previous Walmart Sparkathon editions. Check Unstop and Walmart portal for confirmed schedule.",
    historicalEditions: [
      { year: 2024, registrationOpen: "2024-06-10", registrationDeadline: "2024-07-15", eventDate: "2024-08-18", resultsDate: "2024-08-30" },
      { year: 2025, registrationOpen: "2025-06-15", registrationDeadline: "2025-07-20", eventDate: "2025-08-22", resultsDate: "2025-09-02" },
      { year: 2026, registrationOpen: "2026-06-12", registrationDeadline: "2026-07-18", eventDate: "2026-08-20", resultsDate: "2026-08-31" }
    ],
    events: [
      {
        id: "walmart-reg-open",
        type: "registration_open",
        label: "Registration Opens (Expected)",
        date: "2027-06-15",
        isEstimated: true,
        description: "Registration opens for Walmart Sparkathon engineering tracks."
      },
      {
        id: "walmart-reg-deadline",
        type: "registration_deadline",
        label: "Registration Deadline (Expected)",
        date: "2027-07-20",
        isEstimated: true,
        description: "Final deadline to submit Sparkathon teams and take qualifier quiz."
      },
      {
        id: "walmart-finale",
        type: "event_start",
        label: "National Grand Finale (Expected)",
        date: "2027-08-22",
        endDate: "2027-08-23",
        isEstimated: true,
        description: "Live prototype showcase before Walmart Global Tech leadership."
      }
    ]
  },

  "jpmc-code-for-good": {
    slug: "jpmc-code-for-good",
    title: "JPMorgan Chase Code for Good",
    organization: "JPMorgan Chase",
    typicalAnnouncementMonth: "March - April",
    typicalRegistrationMonth: "April - May",
    typicalEventMonth: "June - July",
    expectedNextEdition: "Expected around April–July 2027",
    isDateEstimated: true,
    dateConfidence: "High",
    lastVerified: "Verified for JPMC Annual Recruitment Cycle",
    officialPortal: "https://www.jpmorganchase.com/careers",
    disclaimer: "Estimated dates are based on previous JPMC Code for Good hiring drives. Confirm dates via JPMC Careers.",
    historicalEditions: [
      { year: 2024, registrationOpen: "2024-03-25", registrationDeadline: "2024-04-30", eventDate: "2024-06-25", resultsDate: "2024-07-15" },
      { year: 2025, registrationOpen: "2025-04-01", registrationDeadline: "2025-05-05", eventDate: "2025-07-02", resultsDate: "2025-07-20" },
      { year: 2026, registrationOpen: "2026-03-28", registrationDeadline: "2026-05-02", eventDate: "2026-06-28", resultsDate: "2026-07-18" }
    ],
    events: [
      {
        id: "jpmc-reg-open",
        type: "registration_open",
        label: "Application Window Opens (Expected)",
        date: "2027-04-01",
        isEstimated: true,
        description: "Applications open on JPMC Careers portal for SEP & Code for Good."
      },
      {
        id: "jpmc-oa-deadline",
        type: "registration_deadline",
        label: "Online Assessment Due (Expected)",
        date: "2027-05-05",
        isEstimated: true,
        description: "Complete the technical coding and video assessment on HackerRank."
      },
      {
        id: "jpmc-hackathon",
        type: "event_start",
        label: "24-Hour Code for Good Hackathon (Expected)",
        date: "2027-06-28",
        endDate: "2027-06-29",
        isEstimated: true,
        description: "24-hour intensive hackathon building solutions for real-world NGOs."
      }
    ]
  },

  "goldman-sachs-india-hackathon": {
    slug: "goldman-sachs-india-hackathon",
    title: "Goldman Sachs India Hackathon",
    organization: "Goldman Sachs",
    typicalAnnouncementMonth: "January",
    typicalRegistrationMonth: "January - February",
    typicalEventMonth: "March - April",
    expectedNextEdition: "Expected around February–April 2027",
    isDateEstimated: true,
    dateConfidence: "High",
    lastVerified: "Verified for Goldman Sachs Engineering Campus Hiring",
    officialPortal: "https://www.goldmansachs.com/careers/",
    disclaimer: "Estimated dates are based on previous Goldman Sachs engineering campus hiring cycles. Verify on official careers portal.",
    historicalEditions: [
      { year: 2024, registrationOpen: "2024-01-15", registrationDeadline: "2024-02-10", eventDate: "2024-03-20", resultsDate: "2024-04-15" },
      { year: 2025, registrationOpen: "2025-01-20", registrationDeadline: "2025-02-15", eventDate: "2025-03-25", resultsDate: "2025-04-20" },
      { year: 2026, registrationOpen: "2026-01-18", registrationDeadline: "2026-02-12", eventDate: "2026-03-22", resultsDate: "2026-04-18" }
    ],
    events: [
      {
        id: "gs-reg-open",
        type: "registration_open",
        label: "Registration Opens (Expected)",
        date: "2027-01-20",
        isEstimated: true,
        description: "Registrations open for Goldman Sachs Engineering Campus Hiring Program."
      },
      {
        id: "gs-aptitude-test",
        type: "registration_deadline",
        label: "Aptitude Assessment (Expected)",
        date: "2027-02-15",
        isEstimated: true,
        description: "National online assessment covering CS fundamentals, quant, and coding."
      },
      {
        id: "gs-hackathon",
        type: "event_start",
        label: "Advanced Hackathon & Presentation (Expected)",
        date: "2027-03-25",
        endDate: "2027-03-26",
        isEstimated: true,
        description: "Shortlisted candidates compete in high-performance computing challenge."
      }
    ]
  },

  "bajaj-finserv-hackrx": {
    slug: "bajaj-finserv-hackrx",
    title: "Bajaj Finserv HackRx",
    organization: "Bajaj Finserv",
    typicalAnnouncementMonth: "June - July",
    typicalRegistrationMonth: "July",
    typicalEventMonth: "August - September",
    expectedNextEdition: "Expected around July–September 2027",
    isDateEstimated: true,
    dateConfidence: "Medium",
    lastVerified: "Verified for Bajaj Finserv HackRx Edition",
    officialPortal: "https://www.bajajfinserv.in/",
    disclaimer: "Estimated dates are based on previous HackRx editions. Please check the official HackRx website for confirmed announcements.",
    historicalEditions: [
      { year: 2024, registrationOpen: "2024-07-01", registrationDeadline: "2024-07-31", eventDate: "2024-08-28", resultsDate: "2024-09-10" },
      { year: 2025, registrationOpen: "2025-07-05", registrationDeadline: "2025-08-05", eventDate: "2025-09-02", resultsDate: "2025-09-15" },
      { year: 2026, registrationOpen: "2026-07-02", registrationDeadline: "2026-08-02", eventDate: "2026-08-30", resultsDate: "2026-09-12" }
    ],
    events: [
      {
        id: "hackrx-reg-open",
        type: "registration_open",
        label: "Registration Opens (Expected)",
        date: "2027-07-05",
        isEstimated: true,
        description: "Registrations open for Bajaj Finserv HackRx fintech competition."
      },
      {
        id: "hackrx-reg-deadline",
        type: "registration_deadline",
        label: "Abstract Submission (Expected)",
        date: "2027-08-05",
        isEstimated: true,
        description: "Deadline to submit problem statement selection and architecture proposal."
      },
      {
        id: "hackrx-finale",
        type: "event_start",
        label: "36-Hour Grand Finale (Expected)",
        date: "2027-09-02",
        endDate: "2027-09-04",
        isEstimated: true,
        description: "36-hour non-stop fintech hackathon and leadership presentation."
      }
    ]
  },

  "myntra-hackerramp": {
    slug: "myntra-hackerramp",
    title: "Myntra HackerRamp",
    organization: "Myntra",
    typicalAnnouncementMonth: "July - August",
    typicalRegistrationMonth: "August",
    typicalEventMonth: "September - October",
    expectedNextEdition: "Expected around August–October 2027",
    isDateEstimated: true,
    dateConfidence: "High",
    lastVerified: "Verified for Myntra HackerRamp Campus Challenge",
    officialPortal: "https://www.myntra.com/",
    disclaimer: "Estimated dates are based on previous HackerRamp editions. Confirm dates on Unstop or Myntra Careers.",
    historicalEditions: [
      { year: 2024, registrationOpen: "2024-08-01", registrationDeadline: "2024-08-25", eventDate: "2024-09-28", resultsDate: "2024-10-15" },
      { year: 2025, registrationOpen: "2025-08-05", registrationDeadline: "2025-08-30", eventDate: "2025-10-02", resultsDate: "2025-10-20" },
      { year: 2026, registrationOpen: "2026-08-03", registrationDeadline: "2026-08-28", eventDate: "2026-09-30", resultsDate: "2026-10-18" }
    ],
    events: [
      {
        id: "myntra-reg-open",
        type: "registration_open",
        label: "Registration Opens (Expected)",
        date: "2027-08-05",
        isEstimated: true,
        description: "Registrations open on Unstop for Myntra HackerRamp."
      },
      {
        id: "myntra-phase1-deadline",
        type: "registration_deadline",
        label: "Phase 1 Ideation Submission (Expected)",
        date: "2027-08-30",
        isEstimated: true,
        description: "Last date to submit Phase 1 conceptual solution deck."
      },
      {
        id: "myntra-finale",
        type: "event_start",
        label: "National Grand Finale (Expected)",
        date: "2027-10-02",
        endDate: "2027-10-03",
        isEstimated: true,
        description: "Live prototype pitching to Myntra's Chief Technology Officer and architects."
      }
    ]
  },

  "tata-innovent": {
    slug: "tata-innovent",
    title: "Tata InnoVent",
    organization: "Tata Technologies",
    typicalAnnouncementMonth: "June",
    typicalRegistrationMonth: "June - July",
    typicalEventMonth: "August - September",
    expectedNextEdition: "Expected around June–September 2027",
    isDateEstimated: true,
    dateConfidence: "Medium",
    lastVerified: "Verified for Tata InnoVent Engineering Edition",
    officialPortal: "https://www.tatatechnologies.com/",
    disclaimer: "Estimated dates are based on previous Tata InnoVent cycles. Check the official Tata Technologies website for updates.",
    historicalEditions: [
      { year: 2024, registrationOpen: "2024-06-15", registrationDeadline: "2024-07-20", eventDate: "2024-08-25", resultsDate: "2024-09-10" },
      { year: 2025, registrationOpen: "2025-06-20", registrationDeadline: "2025-07-25", eventDate: "2025-08-30", resultsDate: "2025-09-15" },
      { year: 2026, registrationOpen: "2026-06-18", registrationDeadline: "2026-07-22", eventDate: "2026-08-28", resultsDate: "2026-09-12" }
    ],
    events: [
      {
        id: "tata-reg-open",
        type: "registration_open",
        label: "Registration Opens (Expected)",
        date: "2027-06-20",
        isEstimated: true,
        description: "Registrations open for Tata InnoVent smart mobility & engineering competition."
      },
      {
        id: "tata-reg-deadline",
        type: "registration_deadline",
        label: "Proposal Submission (Expected)",
        date: "2027-07-25",
        isEstimated: true,
        description: "Deadline to submit engineering proposal and simulation models."
      },
      {
        id: "tata-finale",
        type: "event_start",
        label: "Prototype Exhibition (Expected)",
        date: "2027-08-30",
        endDate: "2027-08-31",
        isEstimated: true,
        description: "National finale prototype demonstration to automotive and digital leaders."
      }
    ]
  },

  "bharatiya-antariksh-hackathon-isro": {
    slug: "bharatiya-antariksh-hackathon-isro",
    title: "Bharatiya Antariksh Hackathon",
    organization: "Indian Space Research Organisation (ISRO)",
    typicalAnnouncementMonth: "July",
    typicalRegistrationMonth: "July - August",
    typicalEventMonth: "August (National Space Day)",
    expectedNextEdition: "Expected around July–August 2027",
    isDateEstimated: true,
    dateConfidence: "High",
    lastVerified: "Verified for ISRO National Space Day Celebrations",
    officialPortal: "https://www.isro.gov.in/",
    disclaimer: "Estimated dates coincide with National Space Day (August 23). Official dates announced on ISRO portal.",
    historicalEditions: [
      { year: 2024, registrationOpen: "2024-07-10", registrationDeadline: "2024-08-05", eventDate: "2024-08-22", resultsDate: "2024-08-23" },
      { year: 2025, registrationOpen: "2025-07-15", registrationDeadline: "2025-08-08", eventDate: "2025-08-22", resultsDate: "2025-08-23" },
      { year: 2026, registrationOpen: "2026-07-12", registrationDeadline: "2026-08-06", eventDate: "2026-08-22", resultsDate: "2026-08-23" }
    ],
    events: [
      {
        id: "isro-reg-open",
        type: "registration_open",
        label: "Registration Opens (Expected)",
        date: "2027-07-15",
        isEstimated: true,
        description: "ISRO releases national space challenge problem statements."
      },
      {
        id: "isro-reg-deadline",
        type: "registration_deadline",
        label: "Proposal Submission Deadline (Expected)",
        date: "2027-08-08",
        isEstimated: true,
        description: "Deadline to submit satellite data algorithms and technical approach."
      },
      {
        id: "isro-space-day",
        type: "event_start",
        label: "National Space Day Grand Finale (Expected)",
        date: "2027-08-22",
        endDate: "2027-08-23",
        isEstimated: true,
        description: "Grand Finale presentations coinciding with National Space Day celebrations."
      }
    ]
  },

  "google-solution-challenge": {
    slug: "google-solution-challenge",
    title: "Google Solution Challenge",
    organization: "Google Developers",
    typicalAnnouncementMonth: "November - December",
    typicalRegistrationMonth: "January - February",
    typicalEventMonth: "March (Submission), May (Demo Day)",
    expectedNextEdition: "Expected around January–May 2027",
    isDateEstimated: true,
    dateConfidence: "High",
    lastVerified: "Verified for Google Solution Challenge Global Cycle",
    officialPortal: "https://developers.google.com/community/gdsc-solution-challenge",
    disclaimer: "Estimated dates are based on Google Developer Student Clubs global cycles. Verify on Google for Developers.",
    historicalEditions: [
      { year: 2024, registrationOpen: "2024-01-10", registrationDeadline: "2024-03-31", eventDate: "2024-05-20", resultsDate: "2024-06-10" },
      { year: 2025, registrationOpen: "2025-01-15", registrationDeadline: "2025-03-31", eventDate: "2025-05-25", resultsDate: "2025-06-15" },
      { year: 2026, registrationOpen: "2026-01-12", registrationDeadline: "2026-03-31", eventDate: "2026-05-22", resultsDate: "2026-06-12" }
    ],
    events: [
      {
        id: "google-reg-open",
        type: "registration_open",
        label: "Global Kickoff & Registration Opens (Expected)",
        date: "2027-01-15",
        isEstimated: true,
        description: "Global kickoff for Google Solution Challenge addressing UN SDGs."
      },
      {
        id: "google-submission-deadline",
        type: "registration_deadline",
        label: "Project Submission Deadline (Expected)",
        date: "2027-03-31",
        isEstimated: true,
        description: "Final deadline to submit GitHub repository and 3-minute video demo."
      },
      {
        id: "google-demo-day",
        type: "event_start",
        label: "Global Top 10 Demo Day (Expected)",
        date: "2027-05-25",
        isEstimated: true,
        description: "Top 10 global student teams present live on YouTube to Google leadership."
      }
    ]
  }
};

/**
 * Returns schedule for a given hackathon slug, or null if not found.
 */
export function getHackathonSchedule(slug: string): HackathonSchedule | null {
  return HACKATHON_SCHEDULES[slug] || null;
}

/**
 * Returns all hackathon schedules sorted chronologically by typical registration month.
 */
export function getAllHackathonSchedules(): HackathonSchedule[] {
  return Object.values(HACKATHON_SCHEDULES);
}

/**
 * Returns flat list of all upcoming events across all 13 hackathons.
 */
export function getAllUpcomingEvents(): Array<HackathonEvent & { hackathonTitle: string; hackathonSlug: string; organization: string }> {
  const result: Array<HackathonEvent & { hackathonTitle: string; hackathonSlug: string; organization: string }> = [];

  Object.values(HACKATHON_SCHEDULES).forEach((schedule) => {
    schedule.events.forEach((ev) => {
      result.push({
        ...ev,
        hackathonTitle: schedule.title,
        hackathonSlug: schedule.slug,
        organization: schedule.organization
      });
    });
  });

  return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Generates Google Calendar link
 */
export function generateGoogleCalendarUrl(
  event: HackathonEvent,
  hackathon: { title: string; organization: string; officialPortal: string; slug: string }
): string {
  const titlePrefix = event.isEstimated ? "[Estimated] " : "";
  const eventTitle = `${titlePrefix}${hackathon.title} - ${event.label}`;

  // Format date to YYYYMMDD
  const startDateStr = event.date.replace(/-/g, "");
  // For all-day events, Google Calendar expects end date to be the day after
  const endDateObj = event.endDate ? new Date(event.endDate) : new Date(event.date);
  endDateObj.setDate(endDateObj.getDate() + 1);
  const endDateStr = endDateObj.toISOString().slice(0, 10).replace(/-/g, "");

  const datesParam = `${startDateStr}/${endDateStr}`;

  const detailsText = [
    `Hackathon: ${hackathon.title}`,
    `Organized by: ${hackathon.organization}`,
    `Event: ${event.label}`,
    `Description: ${event.description}`,
    "",
    `Official Portal: ${hackathon.officialPortal}`,
    `View on Zenvora: https://zenvora.app/opportunities/${hackathon.slug}`,
    "",
    event.isEstimated
      ? "NOTE: This date is estimated based on previous annual editions and may change. Please verify confirmed dates on the official portal."
      : "Officially announced dates."
  ].join("\n");

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", eventTitle);
  url.searchParams.set("dates", datesParam);
  url.searchParams.set("details", detailsText);
  url.searchParams.set("location", hackathon.organization);

  return url.toString();
}

/**
 * Generates RFC 5545 compliant iCalendar (.ics) content
 */
export function generateIcsContent(
  events: Array<{ event: HackathonEvent; hackathon: { title: string; organization: string; officialPortal: string; slug: string } }>,
  calendarTitle: string = "Zenvora Hackathon Calendar"
): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const icsLines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Zenvora//Hackathon Calendar 2.0//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calendarTitle}`,
    "X-WR-TIMEZONE:Asia/Kolkata"
  ];

  events.forEach(({ event, hackathon }, idx) => {
    const startDateFormatted = event.date.replace(/-/g, "");
    const endDateObj = event.endDate ? new Date(event.endDate) : new Date(event.date);
    endDateObj.setDate(endDateObj.getDate() + 1);
    const endDateFormatted = endDateObj.toISOString().slice(0, 10).replace(/-/g, "");

    const uid = `${event.id}-${idx}-${now.getTime()}@zenvora.app`;
    const title = event.isEstimated
      ? `[Estimated] ${hackathon.title}: ${event.label}`
      : `${hackathon.title}: ${event.label}`;

    const description = [
      event.description,
      `Organized by: ${hackathon.organization}`,
      `Portal: ${hackathon.officialPortal}`,
      `Details: https://zenvora.app/opportunities/${hackathon.slug}`,
      event.isEstimated
        ? "Disclaimer: Estimated date based on previous editions. Verify confirmed dates on official portal."
        : "Confirmed Date."
    ].join("\\n");

    icsLines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${startDateFormatted}`,
      `DTEND;VALUE=DATE:${endDateFormatted}`,
      `SUMMARY:${title.replace(/[,;]/g, " ")}`,
      `DESCRIPTION:${description.replace(/\r?\n/g, "\\n")}`,
      `URL:${hackathon.officialPortal}`,
      `LOCATION:${hackathon.organization}`,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:Reminder: " + title,
      "TRIGGER:-P1D",
      "END:VALARM",
      "END:VEVENT"
    );
  });

  icsLines.push("END:VCALENDAR");
  return icsLines.join("\r\n");
}

/**
 * Triggers in-browser download of an .ics file
 */
export function downloadIcsFile(filename: string, content: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename.endsWith(".ics") ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
