export interface OpportunityDraftInput {
  title: string;
  channelName?: string;
  description?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  extraNotes?: string;
}

export interface GeneratedOpportunityDraft {
  title: string;
  organization: string;
  category: string;
  summary: string;
  content: string;
  eligibility: string;
  prerequisites: string;
  benefits: string;
  applyProcess: string;
  dates: string;
  tips: string;
  faq: string; // JSON string
  tags: string; // JSON string
  status: "Open" | "Upcoming" | "Closed" | "Year-Round";
  contentType: "manual" | "video" | "combined";
  applicationUrl?: string;
  sourceUrl?: string;
}

/**
 * Categorizes opportunity based on title / description keywords
 */
export function detectOpportunityCategory(text: string): {
  category: string;
  organization: string;
  status: "Open" | "Upcoming" | "Closed" | "Year-Round";
} {
  const lower = text.toLowerCase();

  // Category detection
  let category = "Open Source";
  let organization = "Global Tech Community";
  let status: "Open" | "Upcoming" | "Closed" | "Year-Round" = "Upcoming";

  if (lower.includes("gsoc") || lower.includes("summer of code") || lower.includes("outreachy") || lower.includes("lfx") || lower.includes("open source")) {
    category = "Open Source";
    if (lower.includes("gsoc") || lower.includes("google summer of code")) organization = "Google";
    else if (lower.includes("lfx") || lower.includes("linux foundation")) organization = "The Linux Foundation";
    else if (lower.includes("outreachy")) organization = "Software Freedom Conservancy";
    else if (lower.includes("gssoc")) organization = "GirlScript Foundation";
    else if (lower.includes("hacktoberfest")) organization = "DigitalOcean";
  } else if (lower.includes("icpc") || lower.includes("codeforces") || lower.includes("codechef") || lower.includes("atcoder") || lower.includes("leetcode") || lower.includes("contest") || lower.includes("competitive programming")) {
    category = "Coding Contests";
    status = lower.includes("codeforces") || lower.includes("leetcode") ? "Year-Round" : "Upcoming";
    if (lower.includes("icpc")) organization = "ICPC Foundation";
    else if (lower.includes("codeforces")) organization = "Codeforces";
    else if (lower.includes("leetcode")) organization = "LeetCode";
    else if (lower.includes("codechef")) organization = "CodeChef";
  } else if (lower.includes("hackathon") || lower.includes("sih") || lower.includes("smart india") || lower.includes("fellowship") || lower.includes("mlh")) {
    category = "Hackathons";
    if (lower.includes("smart india") || lower.includes("sih")) organization = "Ministry of Education & AICTE";
    else if (lower.includes("mlh")) organization = "Major League Hacking";
    else organization = "Hackathon Organizing Committee";
  } else if (lower.includes("ambassador") || lower.includes("campus expert") || lower.includes("mlsa") || lower.includes("gdsc") || lower.includes("cloud club")) {
    category = "Ambassador Programs";
    status = "Open";
    if (lower.includes("microsoft") || lower.includes("mlsa")) organization = "Microsoft";
    else if (lower.includes("github")) organization = "GitHub";
    else if (lower.includes("aws")) organization = "Amazon Web Services";
    else if (lower.includes("google")) organization = "Google Developers";
  } else if (lower.includes("internship") || lower.includes("step") || lower.includes("explore") || lower.includes("swe intern")) {
    category = "Internships";
    if (lower.includes("google")) organization = "Google";
    else if (lower.includes("microsoft")) organization = "Microsoft";
    else if (lower.includes("amazon")) organization = "Amazon";
  } else if (lower.includes("scholarship") || lower.includes("grant") || lower.includes("research fellowship")) {
    category = "Scholarships & Fellowships";
    if (lower.includes("google")) organization = "Google";
    else if (lower.includes("grace hopper") || lower.includes("ghc")) organization = "AnitaB.org";
  } else if (lower.includes("gdg") || lower.includes("meetup") || lower.includes("community") || lower.includes("conference")) {
    category = "Developer Communities";
    status = "Year-Round";
    if (lower.includes("google") || lower.includes("gdg")) organization = "Google Developer Groups";
  }

  return { category, organization, status };
}

/**
 * Generates a structured opportunity draft article from YouTube metadata and optional notes.
 */
export async function generateOpportunityDraft(
  input: OpportunityDraftInput
): Promise<GeneratedOpportunityDraft> {
  const { title, channelName, description = "", youtubeId, youtubeUrl, extraNotes = "" } = input;
  const combinedContext = `${title}\n${channelName || ""}\n${description}\n${extraNotes}`;
  const { category, organization, status } = detectOpportunityCategory(combinedContext);

  // Clean title for program name
  let cleanTitle = title
    .replace(/\|\s*YouTube.*$/i, "")
    .replace(/\[.*?\]/g, "")
    .trim();

  // 1. Try Gemini API if GEMINI_API_KEY is configured
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const prompt = `You are an expert technical career advisor for college students and developers.
Based STRICTLY on the verified facts in the following YouTube video metadata and notes, generate a structured opportunity article draft.
Do NOT invent fake deadlines, links, or requirements. If information is not known, note it as "Awaiting official cycle confirmation" or provide general preparation advice clearly labeled.

Video Title: ${title}
Channel: ${channelName || "Unknown"}
Video Description: ${description}
Extra Notes: ${extraNotes}

Return a valid JSON object matching this schema:
{
  "title": "${cleanTitle}",
  "organization": "${organization}",
  "category": "${category}",
  "summary": "2-sentence compelling summary for students",
  "content": "Comprehensive markdown article with sections: ### What is this program?\\n### Who Should Apply?\\n### Key Learning Outcomes",
  "eligibility": "Clear bullet points on who is eligible",
  "prerequisites": "Prerequisites and recommended technical skills",
  "benefits": "Mentorship, stipend, swag, certificate, career opportunities",
  "applyProcess": "Numbered 1-5 step-by-step application instructions",
  "dates": "Verified or tentative seasonal timeline",
  "tips": "3-4 actionable tips for a winning application",
  "faq": [{"q": "Question 1", "a": "Answer 1"}, {"q": "Question 2", "a": "Answer 2"}],
  "tags": ["tag1", "tag2"],
  "applicationUrl": "official url if known or empty",
  "sourceUrl": "official documentation url if known or empty"
}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          return {
            title: parsed.title || cleanTitle,
            organization: parsed.organization || organization,
            category: parsed.category || category,
            summary: parsed.summary || `${cleanTitle} organized by ${organization}.`,
            content: parsed.content || "",
            eligibility: parsed.eligibility || "Enrolled students or open-source contributors.",
            prerequisites: parsed.prerequisites || "Git, GitHub, and fundamental coding proficiency.",
            benefits: parsed.benefits || "Mentorship, hands-on experience, and networking.",
            applyProcess: parsed.applyProcess || "Review official guidelines and submit application before deadline.",
            dates: parsed.dates || "Check official portal for current cycle dates.",
            tips: parsed.tips || "Start preparing early and showcase public GitHub repositories.",
            faq: typeof parsed.faq === "string" ? parsed.faq : JSON.stringify(parsed.faq || []),
            tags: typeof parsed.tags === "string" ? parsed.tags : JSON.stringify(parsed.tags || [category, organization]),
            status,
            contentType: "combined",
            applicationUrl: parsed.applicationUrl || "",
            sourceUrl: parsed.sourceUrl || "",
          };
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to structured heuristic generator:", err);
    }
  }

  // 2. Structured Heuristic Draft Generator (Robust, verified, zero external dependencies required)
  const summary = description
    ? description.split(/\n\n|\.\s+/)[0].slice(0, 240) + "..."
    : `A premier ${category.toLowerCase()} opportunity organized by ${organization} to help students develop real-world technical skills, collaborate with mentors, and advance their careers.`;

  const eligibility = `• Open to college/university students and aspiring software developers.
• Must meet minimum age requirement (typically 18+ for international programs).
• Must have an active GitHub profile or relevant portfolio for technical evaluation.
• Good academic standing or demonstrable passion for technology and community collaboration.`;

  const prerequisites = `• Solid foundation in at least one core programming language (Python, C++, Java, JavaScript/TypeScript, or Go).
• Proficiency in Git version control and collaborative GitHub workflows (forking, branching, Pull Requests).
• Clear written communication skills for interacting with project mentors and peers.`;

  const benefits = `• Hands-on engineering experience on production-grade software.
• 1-on-1 mentorship from senior industry professionals and foundation maintainers.
• Formal certificate of completion, potential financial stipend or travel assistance (where eligible).
• Direct networking and interview visibility with top technology companies.`;

  const applyProcess = `1. Review the official program announcement and guidelines on the organization's portal.
2. Join the official communication channel (Discord, Slack, or Community Forum).
3. Prepare your resume, portfolio, and relevant GitHub repositories.
4. Draft your application essays or technical proposal according to the official format.
5. Submit all materials through the official application portal before the closing deadline.`;

  const dates = `Check the official organization portal for exact timeline dates for the upcoming cycle. Typically opens 1–2 months prior to the cohort start date.`;

  const tips = `• Begin preparing your portfolio or contributions well ahead of the official application opening.
• Focus on quality over quantity: deeply understand 1-2 open issues rather than skimming dozens.
• Ask thoughtful, well-researched questions in community channels.
• Clearly explain what you hope to learn and how you plan to give back to the community.`;

  const faqList = [
    {
      q: "Is prior experience required to participate?",
      a: "Most programs cater to beginners and intermediate students. Strong curiosity, willingness to learn in public, and solid fundamental coding skills are the most valued qualities."
    },
    {
      q: "Can I participate remotely?",
      a: "Yes, the vast majority of student open-source programs and online hackathons are fully remote and open to global participants."
    },
    {
      q: "Where do I track official updates?",
      a: "Always bookmark and verify information via the official organization portal linked under the resources section of this page."
    }
  ];

  const tagsList = [category, organization, "Students", "Career", "2026"];

  const contentMarkdown = `### What is this program?
${cleanTitle} is an initiative sponsored by **${organization}** designed to bridge classroom learning with high-impact industry practice. Students gain direct exposure to modern software engineering, distributed teamwork, and community-driven development.

### Who Should Apply?
This program is ideal for:
- Self-taught builders and university computer science students seeking real-world validation.
- Developers looking to build a standout portfolio of open-source contributions.
- Students preparing for upcoming internship and software engineering recruitment seasons.

### How to Prepare a Standout Application
To maximize your selection chances, make sure your GitHub profile demonstrates clean commit history, descriptive README files, and thoughtful issue discussions.`;

  return {
    title: cleanTitle,
    organization,
    category,
    summary,
    content: contentMarkdown,
    eligibility,
    prerequisites,
    benefits,
    applyProcess,
    dates,
    tips,
    faq: JSON.stringify(faqList),
    tags: JSON.stringify(tagsList),
    status,
    contentType: youtubeId ? "combined" : "manual",
    applicationUrl: "",
    sourceUrl: "",
  };
}
