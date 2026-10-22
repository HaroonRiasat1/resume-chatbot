// Haroon's public profile: the single source of truth. The chat cards render from
// this data, and resumeMarkdown() turns it into the text the AI is grounded in.
// Built from https://github.com/HaroonRiasat1/HaroonRiasat1, his LinkedIn profile
// (professional sections only, chosen by Haroon) and his resume PDF, which wins
// where they disagree. Public facts only: no phone number.

export const profile = {
  name: "Haroon Riasat",
  title: "Full-Stack Software Engineer | AWS Cloud & AI Development",
  location: "Turku, Finland",
  summary: [
    "Full-stack engineer with 4.5+ years designing, building, and deploying production web, mobile, and AI-powered applications end to end. Hands-on with AWS (EC2, S3, Amplify, Bedrock, SageMaker) and LLM/RAG systems (OpenAI, Claude, Gemini, LangChain, LlamaIndex, Pinecone, pgvector, Chroma).",
    "He completed his M.Sc. in Information Technology at Åbo Akademi University in Turku, Finland, in June 2026 (GPA 4.7/5.0), after a B.Sc. in Computer Science from FAST-NUCES in Islamabad, Pakistan.",
    "He builds React and Next.js frontends and the services behind them in Python, Node.js and PHP/Laravel on AWS, and has shipped RAG assistants, audio transcription pipelines and document extraction systems used by real customers. Co-founding a small consultancy taught him to care as much about the people using a product, and the teammates building it, as about the code.",
    "He cares most about making LLM systems reliable, measurable and cost-efficient under real traffic, and wants to keep growing in a team of strong engineers who care about craft.",
    "Most of his recent work has been on NDA-covered client and employer projects, so his public GitHub activity is lighter than his actual output.",
  ],
  stats: [
    { value: "4.5+", label: "years shipping production software" },
    { value: "60+", label: "products delivered at Exitech" },
    { value: "6", label: "engineers led at QUEST I-8" },
  ],
  contact: {
    email: "haroonriasatali@gmail.com",
    linkedin: "https://linkedin.com/in/haroon-riasat-82659b1a7",
    github: "https://github.com/HaroonRiasat1",
  },
  experience: [
    {
      role: "Software Engineer",
      company: "Amplon.io",
      url: "https://amplon.io",
      place: "Turku, Finland",
      dates: "Sep 2024 – Present",
      text: "Builds Amplon's Hoshin Kanri strategic planning platform, working across the stack. Users struggled to find answers spread across product manuals and video tutorials, so he designed and shipped a RAG assistant (Python/Flask, OpenAI API, AWS) that ingests the manuals and YouTube tutorial transcripts and answers questions inside the product, owning it from the retrieval pipeline to the React integration.",
      more: [
        "Builds and maintains backend features and APIs in PHP/Laravel at Amplon and delivers the matching React frontend work, so new features ship end to end in a production SaaS product.",
        "Manages release notes and in-app informational content at Amplon through Contentful, integrating the headless CMS with the React frontend so content can be updated without code deploys.",
        "Works daily with product, design and backend colleagues at Amplon to improve performance and reliability, turning user feedback into scoped, shippable releases.",
      ],
    },
    {
      role: "Co-Founder & Software Engineer",
      company: "Exitech",
      place: "Remote",
      dates: "Nov 2023 – Present",
      text: "Co-founded a product engineering consultancy that has delivered 60+ products for international clients across SaaS, e-commerce, AI, and automation. Owns architecture, implementation, cloud deployment, and operations end to end.",
      more: [
        "Typical Exitech stack: React/Next.js, Node.js/TypeScript, Python and PostgreSQL, shipped as containerised AWS deployments with Docker, Kubernetes and CI/CD pipelines. Owns technical decisions with client stakeholders, trading off cost, speed and reliability.",
        "Led the Exitech AI Internship Program, co-created with his co-founder for final-year students: over three months the interns built 12 fully functional AI web products, backend to frontend, comparing multiple LLMs and tools along the way.",
      ],
    },
    {
      role: "Software Engineer",
      company: "QUEST I-8",
      place: "Islamabad, Pakistan",
      dates: "Feb 2023 – Jun 2024",
      text: "Promoted early; led a team of 6 software engineers delivering and maintaining 20+ production AI-based full-stack web and iOS applications, including client communication and project management. Owned the full lifecycle of client-facing products, from requirements and architecture through testing and deployment.",
      more: [
        "Clients at QUEST I-8 needed AI features tuned to their own domain, so he fine-tuned LLMs on client data and integrated them into the products.",
        "At QUEST I-8 he built end-to-end products across frontend and backend, deployed and ran them on AWS, built web scraping pipelines that fed the apps and their AI features, and developed native iOS apps alongside the web products.",
      ],
    },
    {
      role: "Software Engineering Intern (internship)",
      company: "MRS Technologies",
      place: "Islamabad, Pakistan",
      dates: "Jul 2022 – Sep 2022",
      text: "Part of a small team building an MVP carpooling app with the MERN stack, AWS Amplify, EC2 and S3. Proposed the MVP idea, gathered requirements, designed the domain model and helped design the ride-matching algorithm. Worked in Scrum with Jira.",
    },
    {
      role: "Software Engineering Intern (internship)",
      company: "QUEST I-8",
      place: "Islamabad, Pakistan",
      dates: "Aug 2021 – Oct 2021",
      text: "Developed an internal audit system using React, PostgreSQL and Laravel.",
    },
  ] as Experience[],
  leadership: [
    "Chair, IEEE Computer Society FAST Islamabad Chapter (Jul 2022 – Jul 2023): led the chapter and organized technical events, workshops and sessions for student skill development. Organized 80+ tech events during his bachelor's.",
    "Deputy Chairman (Vice President), Society for Advanced Studies and Research, FAST-NUCES (Oct 2021 – Sep 2022): arranged seminars on research-based final-year projects using AI and data science, cloud computing, and the first postgraduate research symposium; started an initiative promoting computer science in government colleges in Pakistan.",
    "Chairperson, FAST ISYWSC'22 (Nov – Dec 2022).",
    "Teaching Assistant, FAST-NUCES (Mar 2021 – Jul 2022): Operating Systems (graded quizzes and assignments for 180+ students) and Pakistan Studies (150+ students).",
    "Deputy Secretary, NaSCon (Mar – Apr 2022), and Vice Head PR, National University Computing Society (Nov 2020 – Aug 2021).",
  ],
  awards: [
    "1st place, Microsoft, Nokia & Elisa Hackathon (with a teammate): a 5G/6G drone network for healthcare in remote areas, covering emergency medicine deliveries, on-board diagnostics and telemedicine.",
    "ICT Showroom 2025 finalist with Åbo Akademi University's Fridge app (scans groceries to track expiry dates and suggests recipes): Best UI award from the jury, plus first place for Best Technical Content and Best Presentation in the public vote.",
    "Runner-up, Softec Web Development Competition at FAST Lahore (Mar 2022): built a clinic management system with MongoDB, Express, React and Node.js.",
    "Dean's List of Honor three times at FAST-NUCES (Spring 2021, Fall 2021, Spring 2023).",
  ],
  languages: ["English: professional working proficiency", "Finnish: elementary proficiency"],
  // From the "Beyond work" section of his resume; he chose to let the bot share it.
  beyondWork: [
    "He's an animal lover and has had three cats so far.",
    "He loves to travel and hike; his favourite place so far is Lofoten.",
    "In his free time he loves reading books.",
  ],
  projects: [
    {
      name: "wild-frequencies",
      kind: "Side project",
      text: "A live animal rock concert in the browser: a 7-piece animal band with lights, fog, an LED wall, a crowd you can join, and backing-singer flamingos. Every song is generated live; you can upload your own track and the band learns its beats and choruses, or host a party so friends join from their phones in sync.",
      tech: ["React", "TypeScript", "Tone.js", "Canvas 2D", "WebRTC"],
      repo: "https://github.com/HaroonRiasat1/wild-frequencies",
      demo: "https://wild-frequencies.vercel.app",
      theme: "concert",
    },
    {
      name: "Subqc AI",
      kind: "Work project",
      text: "AI-powered CRM forms and reporting platform. Field teams were filling in inspections and writing reports by hand; he led development of the platform that automates inspections, checklists and report generation, and owned the core implementation and AWS deployment.",
      tech: ["MERN", "OpenAI", "embeddings", "AWS"],
      theme: "subqc",
    },
    {
      name: "Council Tap",
      kind: "Work project",
      text: "AI court-hearing transcription tool. Lawyers in Maui County needed usable notes from long, noisy court-hearing recordings; he led the architecture and delivery of a pipeline that transcribes the audio with Deepgram and uses Claude to turn it into structured, lawyer-ready notes, running on AWS.",
      tech: ["MERN", "Claude", "Python", "Deepgram", "AWS"],
      theme: "council",
    },
    {
      name: "Kinwell",
      kind: "Side project",
      text: "Family health platform with LLM features for families living abroad who had no clear view of their parents' health. Nutritionists log home visits, lab reports uploaded as PDFs or phone photos become structured results with healthy ranges and trends, and families get plain-language updates. He also built a Node.js MCP server so Claude can use the platform directly, with tools scoped to each user's role and human approval before any message reaches a family.",
      tech: ["Node.js", "LLMs", "MCP", "Claude", "document extraction"],
      demo: "https://kinwell-sepia.vercel.app",
      theme: "kinwell",
    },
    {
      name: "resume-chatbot",
      kind: "Personal project",
      text: "Chat with Haroon's resume (this site): a RAG assistant grounded only in his public profile. Hybrid semantic + keyword retrieval over Upstash Vector, OpenAI models with free open-source models via OpenRouter as a fallback, answers that cite their resume sections, and guards that say \"I don't know\" instead of guessing.",
      tech: ["TypeScript", "Vite", "Vercel Functions", "Upstash Vector", "OpenAI", "OpenRouter"],
      repo: "https://github.com/HaroonRiasat1/resume-chatbot",
      demo: "https://resume-chatbot-chi.vercel.app",
      theme: "rag",
    },
    {
      name: "event-map-scraper",
      kind: "Personal project",
      text: "Search any city and scrape the map for nearby venues, festivals, and live events, with no API key required.",
      tech: ["React", "Leaflet", "OpenStreetMap"],
      repo: "https://github.com/HaroonRiasat1/event-map-scraper",
      demo: "https://event-map-scraper.vercel.app",
      theme: "map",
    },
    {
      name: "tripstitch",
      kind: "Personal project",
      text: "Multi-city trip planner with routes, hostels, sights, metro, and budget in one place.",
      tech: [],
      repo: "https://github.com/HaroonRiasat1/tripstitch",
      demo: "https://tripstitch-five.vercel.app",
      theme: "trip",
    },
    {
      name: "airplane-runner",
      kind: "Personal project",
      text: "3D multiplayer endless runner playable over a local network with no internet access; players join by scanning a QR code.",
      tech: ["Node.js", "Express", "Socket.io", "Three.js"],
      repo: "https://github.com/HaroonRiasat1/airplane-runner",
      theme: "runner",
    },
    {
      name: "SCRUB",
      kind: "Work project",
      text: "Custom sales-management app extending Salesforce, with a React/TypeScript frontend, Express/PostgreSQL backend and OAuth sign-in.",
      tech: ["React", "TypeScript", "Express", "PostgreSQL", "OAuth"],
      theme: "scrub",
    },
  ] as Project[],
  // Smaller repos: listed in the resume text, not shown as cards.
  moreProjects: [
    "Task-Manager-Backend and Task-Manager-FrontEnd: full-stack task management system with role-based workflows. Tech: Node.js, Express, MongoDB, React.",
    "Plex-Scrapper: Python tool that scrapes movie metadata from a Plex Media Server for titles listed in an Excel file.",
    "Mariogame: Mario-style platformer built from scratch in x86 Assembly (NASM).",
    "Bejeweled-Game-Code-c- and DODGE_EM-GAME: games built with C++, OpenGL, and GLUT.",
  ],
  skills: [
    { group: "Cloud & DevOps", items: ["AWS (EC2, S3, Amplify, Bedrock, SageMaker)", "Docker", "Kubernetes", "Linux", "Git/GitHub", "CI/CD"] },
    { group: "AI/ML", items: ["OpenAI, Claude and Gemini APIs", "RAG", "embeddings", "vector search", "LLM fine-tuning", "MCP servers", "LangChain", "LlamaIndex", "Pinecone", "pgvector", "Chroma", "AWS Bedrock", "Deepgram"] },
    { group: "Frontend", items: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "Contentful (headless CMS)", "responsive UI", "performance optimisation"] },
    { group: "Backend", items: ["Node.js", "Express", "PHP", "Laravel", "Python", "Flask", "Django", "Java", "REST APIs", "microservices", "web scraping"] },
    { group: "Mobile", items: ["React Native", "SwiftUI/Swift"] },
    { group: "Databases", items: ["PostgreSQL", "MongoDB", "SQL"] },
    { group: "Ways of working", items: ["Project management", "Scrum", "Jira", "Figma", "Software design", "UX"] },
    { group: "AI-assisted development", items: ["Claude", "GitHub Copilot", "ChatGPT (daily coding, review and debugging)"] },
  ],
  education: [
    {
      degree: "M.Sc. Information Technology (Computer Engineering)",
      school: "Åbo Akademi University",
      place: "Turku, Finland",
      date: "Jun 2026",
      grade: "GPA 4.7/5.0",
      details: [
        "Specialized in Scalable Software Systems, with coursework in Cloud Computing, Software Construction, Software Quality, System Safety, and GPU Programming.",
        "Master's thesis: \"TaskLint: AI-driven Task Auditing for Project Management\" (https://www.doria.fi/handle/10024/194918). He built an AI-powered Chrome extension that audits project-board tasks in real time for clarity, ownership, deadlines, workflow consistency, and delivery risks, evaluated through benchmark testing, predictive analysis, and an industry case study.",
        "Active member of the Erasmus Student Network.",
      ],
    },
    {
      degree: "B.Sc. Computer Science",
      school: "FAST-NUCES",
      place: "Islamabad, Pakistan",
      date: "Jun 2023",
      grade: "GPA 3.49/4.0",
      details: [
        "Major in Software Engineering, with courses including Web Development, DevOps, Cloud Computing, Information Security, Ethical Hacking, Artificial Intelligence, Digital Image Processing, Computer Networks, and Software Design.",
        "Dean's List of Honor three times.",
      ],
    },
  ],
  certifications: [
    "AWS Certified Cloud Practitioner (issued Jun 2023, expired Jun 2026)",
    "Foundation Certificate in Project Management, Project Management Professionals Finland (PRY)",
    "Fundamentals for Istio, Solo.io (May 2023)",
    "React State Management, LinkedIn Learning (Jun 2022)",
    "The Complete 2022 Web Development Bootcamp, Udemy (Jan 2022)",
    "Introduction to Data Science in Python, DataCamp (May 2021)",
  ],
};

export interface Experience {
  role: string;
  company: string;
  url?: string;
  place: string;
  dates: string;
  text: string;
  more?: string[];
}

export interface Project {
  name: string;
  kind: string;
  text: string;
  tech: string[];
  repo?: string;
  demo?: string;
  theme: string;
}

export function resumeMarkdown(): string {
  const p = profile;
  const project = (x: Project) =>
    `- ${x.name}${x.repo ? ` (${x.repo})` : ""}: ${x.text}${x.tech.length ? ` Tech: ${x.tech.join(", ")}.` : ""}${x.demo ? ` Live demo: ${x.demo}` : ""}`;
  return [
    `# ${p.name}`,
    "",
    `${p.title}. Based in ${p.location}.`,
    "",
    "## Summary",
    "",
    ...p.summary.flatMap((s) => [s, ""]),
    "## Contact",
    "",
    `- Email: ${p.contact.email}`,
    `- LinkedIn: ${p.contact.linkedin}`,
    `- GitHub: ${p.contact.github}`,
    "",
    "## Experience",
    "",
    ...p.experience.flatMap((e) => [
      `- ${e.role}, ${e.company}${e.url ? ` (${e.url})` : ""}, ${e.place}. ${e.dates.replace("–", "to")}. ${e.text}`,
      // Extra detail as its own lines (one vector each), named so they stand alone.
      ...(e.more ?? []).map((m) => `- ${e.company}: ${m}`),
    ]),
    "",
    "## Selected work projects",
    "",
    ...p.projects.filter((x) => x.kind === "Work project").map(project),
    "",
    "## Side and personal projects",
    "",
    ...p.projects.filter((x) => x.kind !== "Work project").map(project),
    ...p.moreProjects.map((m) => `- ${m}`),
    "",
    "## Skills and stack",
    "",
    ...p.skills.map((s) => `- ${s.group}: ${s.items.join(", ")}`),
    "",
    "## Education",
    "",
    ...p.education.flatMap((e) => [
      `- ${e.degree}, ${e.school}, ${e.place}. Graduated ${e.date}. ${e.grade}.`,
      ...e.details.map((d) => `- ${e.school} ${e.degree.split(" ")[0]}: ${d}`),
    ]),
    "",
    "## Certifications",
    "",
    ...p.certifications.map((c) => `- ${c}`),
    "",
    "## Honors and awards",
    "",
    ...p.awards.map((a) => `- ${a}`),
    "",
    "## Leadership and activities",
    "",
    ...p.leadership.map((l) => `- ${l}`),
    "",
    "## Languages",
    "",
    ...p.languages.map((l) => `- ${l}`),
    "",
    "## Beyond work (hobbies and interests)",
    "",
    ...p.beyondWork.map((b) => `- ${b}`),
    "",
  ].join("\n");
}
