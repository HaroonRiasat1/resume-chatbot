// Rich answer cards for the quick categories. They render straight from
// profile.ts, so they cost no AI request and can't drift from the resume.
import { profile, type Project } from "./profile.js";
import { icon } from "./icons.js";

function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  ...children: (Node | string | null | undefined)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  for (const c of children) if (c != null) el.append(c);
  return el;
}

const external = (href: string, label: string, cls = "") =>
  h("a", { href, target: "_blank", rel: "noopener", class: cls }, label);

function projectCard(p: Project): HTMLElement {
  return h(
    "article",
    { class: `pcard theme-${p.theme}` },
    h("span", { class: "pcard-kind" }, p.kind),
    h("h3", {}, p.name),
    h("p", {}, p.text),
    p.tech.length ? h("div", { class: "pcard-tech" }, ...p.tech.map((t) => h("span", {}, t))) : null,
    p.demo || p.repo
      ? h(
          "div",
          { class: "pcard-links" },
          p.demo ? external(p.demo, "Live demo ↗", "primary") : null,
          p.repo ? external(p.repo, "GitHub ↗") : null,
        )
      : h("div", { class: "pcard-links" }, h("span", { class: "nda" }, "Client work")),
  );
}

export function projectsCard(): HTMLElement {
  return h("div", { class: "card-row" }, ...profile.projects.map(projectCard));
}

export function experienceCard(): HTMLElement {
  return h(
    "ol",
    { class: "timeline" },
    ...profile.experience.map((e) =>
      h(
        "li",
        {},
        h("span", { class: "when" }, e.dates),
        h(
          "div",
          { class: "what" },
          h("strong", {}, e.role),
          h("span", { class: "at" }, " · ", e.url ? external(e.url, e.company) : e.company, ` · ${e.place}`),
          h("p", {}, e.text),
        ),
      ),
    ),
  );
}

export function skillsCard(): HTMLElement {
  return h(
    "div",
    { class: "skills" },
    ...profile.skills.map((s) =>
      h("section", {}, h("h4", {}, s.group), h("div", { class: "chips" }, ...s.items.map((i) => h("span", {}, i)))),
    ),
    h("section", {}, h("h4", {}, "Certification"), h("div", { class: "chips" }, ...profile.certifications.map((c) => h("span", { class: "cert" }, c)))),
  );
}

export function aboutCard(): HTMLElement {
  return h(
    "div",
    { class: "about" },
    h("div", { class: "stats" }, ...profile.stats.map((s) => h("div", {}, h("b", {}, s.value), h("span", {}, s.label)))),
    h(
      "ul",
      { class: "edu" },
      ...profile.education.map((e) =>
        h("li", {}, h("strong", {}, e.degree), h("span", {}, `${e.school}, ${e.place} · ${e.date}`)),
      ),
    ),
  );
}

export function contactCard(): HTMLElement {
  const c = profile.contact;
  const row = (href: string, label: string, value: string, name: string) =>
    h(
      "a",
      { href, class: "contact-row", ...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {}) },
      icon(name, "ic ci"),
      h("span", {}, h("b", {}, label), h("small", {}, value)),
      h("span", { class: "arrow" }, "↗"),
    );
  return h(
    "div",
    { class: "contact" },
    row(`mailto:${c.email}`, "Email", c.email, "mail"),
    row(c.linkedin, "LinkedIn", c.linkedin.replace("https://", ""), "linkedin"),
    row(c.github, "GitHub", c.github.replace("https://", ""), "github"),
  );
}

export interface Category {
  id: string;
  label: string;
  question: string;
  intro: string;
  card: () => HTMLElement;
}

export const CATEGORIES: Category[] = [
  {
    id: "me",
    label: "Me",
    question: "Who is Haroon?",
    intro: `${profile.summary[0]}`,
    card: aboutCard,
  },
  {
    id: "experience",
    label: "Experience",
    question: "Where has he worked?",
    intro: "Here's his work history, most recent first:",
    card: experienceCard,
  },
  {
    id: "projects",
    label: "Projects",
    question: "What has he built?",
    intro: "A few things he's built. Swipe for more; the side projects have live demos you can try.",
    card: projectsCard,
  },
  {
    id: "skills",
    label: "Skills",
    question: "What's his tech stack?",
    intro: "His stack, grouped by area:",
    card: skillsCard,
  },
  {
    id: "contact",
    label: "Contact",
    question: "How can I reach him?",
    intro: "The best ways to get in touch:",
    card: contactCard,
  },
];
