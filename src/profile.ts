// Haroon's public profile: the single source of truth. The chat cards render from
// this data, and resumeMarkdown() turns it into the text the AI is grounded in.
// Built from https://github.com/HaroonRiasat1/HaroonRiasat1 — public facts only.

export const profile = {
  name: "Haroon Riasat",
  title: "Full-Stack Software Engineer | AWS Cloud & AI Development",
  location: "Turku, Finland",
  summary: [
    "Full-stack engineer with 4.5+ years designing, building, and deploying production web, mobile, and AI-powered applications end to end. Hands-on with AWS (EC2, S3, Amplify, Bedrock, SageMaker) and LLM/RAG systems (OpenAI, Claude, Gemini, LangChain, LlamaIndex, Pinecone, pgvector, Chroma).",
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
      text: "Builds and enhances Amplon's Hoshin Kanri strategic planning platform in React. Shipped a RAG-based AI assistant (Python/Flask, OpenAI API, AWS) for product-manual and video content retrieval.",
    },
    {
      role: "Co-Founder & Software Engineer",
      company: "Exitech",
      place: "Remote",
      dates: "Nov 2023 – Present",
      text: "Co-founded a product engineering consultancy that has delivered 60+ products for international clients across SaaS, e-commerce, AI, and automation. Owns architecture, implementation, cloud deployment, and operations end to end.",
    },
    {
      role: "Software Engineer",
      company: "QUEST I-8",
      place: "Islamabad, Pakistan",
      dates: "Feb 2023 – Jun 2024",
      text: "Led a team of 6 software engineers delivering and maintaining 20+ production AI-based full-stack web and iOS applications, owning the full SDLC from requirements through deployment.",
    },
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
      text: "AI-powered CRM forms and reporting platform that automates inspections and report generation.",
      tech: ["MERN", "OpenAI", "embeddings", "AWS"],
      theme: "subqc",
    },
    {
      name: "Council Tap",
      kind: "Work project",
      text: "AI court-hearing transcription tool that turns audio into structured, lawyer-ready notes.",
      tech: ["MERN", "Claude", "Python", "Deepgram", "AWS"],
      theme: "council",
    },
    {
      name: "resume-chatbot",
      kind: "Personal project",
      text: "Chat with Haroon's resume (this site): a RAG assistant grounded only in his public profile. Hybrid semantic + keyword retrieval over Upstash Vector, free open-source LLMs via OpenRouter, answers that cite their resume sections, and guards that say \"I don't know\" instead of guessing.",
      tech: ["TypeScript", "Vite", "Vercel Functions", "Upstash Vector", "OpenRouter"],
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
      text: "Custom Salesforce sales-management extension.",
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
    { group: "Cloud & DevOps", items: ["AWS (EC2, S3, Amplify, Bedrock, SageMaker)", "Docker", "Linux", "Git/GitHub", "CI/CD"] },
    { group: "AI/ML", items: ["OpenAI, Claude and Gemini APIs", "RAG", "embeddings", "LangChain", "LlamaIndex", "Pinecone", "pgvector", "Chroma"] },
    { group: "Frontend", items: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS"] },
    { group: "Backend", items: ["Node.js", "Express", "PHP", "Laravel", "Python", "Flask", "Django", "REST APIs"] },
    { group: "Mobile", items: ["React Native", "SwiftUI/Swift"] },
    { group: "Databases", items: ["PostgreSQL", "MongoDB", "SQL"] },
  ],
  education: [
    { degree: "M.Sc. Information Technology (Computer Engineering)", school: "Åbo Akademi University", place: "Turku, Finland", date: "Jun 2026" },
    { degree: "B.Sc. Computer Science", school: "FAST-NUCES", place: "Islamabad, Pakistan", date: "Jun 2023" },
  ],
  certifications: ["AWS Certified Cloud Practitioner"],
};

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
    ...p.experience.map(
      (e) => `- ${e.role}, ${e.company}${e.url ? ` (${e.url})` : ""}, ${e.place}. ${e.dates.replace("–", "to")}. ${e.text}`,
    ),
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
    ...p.education.map((e) => `- ${e.degree}, ${e.school}, ${e.place}. ${e.date}.`),
    "",
    "## Certifications",
    "",
    ...p.certifications.map((c) => `- ${c}`),
    "",
  ].join("\n");
}
