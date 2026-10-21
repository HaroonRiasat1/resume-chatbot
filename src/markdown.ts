// Tiny, safe markdown subset for chat bubbles: paragraphs, "- " lists, **bold**,
// [text](url) and bare URLs/emails. Everything is HTML-escaped first.

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function inline(s: string): string {
  const links: string[] = [];
  const stash = (html: string) => `\u0000${links.push(html) - 1}\u0000`;
  let out = escape(s)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+)\)/g, (_, text, url) =>
      stash(`<a href="${url}" target="_blank" rel="noopener">${text}</a>`),
    )
    .replace(/\bhttps?:\/\/[^\s<)]+[^\s<).,;:!?]/g, (url) => stash(`<a href="${url}" target="_blank" rel="noopener">${url.replace(/^https?:\/\//, "")}</a>`))
    .replace(/\b[\w.+-]+@[\w-]+\.[\w.]+[a-z]\b/gi, (email) => stash(`<a href="mailto:${email}">${email}</a>`))
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => links[Number(i)]);
}

export function renderMarkdown(text: string): string {
  const html: string[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) html.push(`<ul>${list.map((li) => `<li>${inline(li)}</li>`).join("")}</ul>`);
    list = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const item = line.match(/^(?:[-*•]|\d+\.)\s+(.*)/);
    if (item) {
      list.push(item[1]);
    } else {
      flush();
      if (line) html.push(`<p>${inline(line)}</p>`);
    }
  }
  flush();
  return html.join("");
}
