import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

/**
 * Decode basic HTML entities to characters.
 */
function decodeHtmlEntities(str) {
  if (!str) return str;
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * Render a string containing mixed plain text and LaTeX math chunks wrapped in <math> ... </math>.
 */
export function renderMixedMath(str) {
  if (!str) return null;

  // Split by <math> ... </math> tags including inner content
  const parts = str.split(/(<math>.*?<\/math>)/g).filter(Boolean);

  return parts.map((part, i) => {
    if (part.startsWith("<math>") && part.endsWith("</math>")) {
      // Strip tags and decode entities
      const math = decodeHtmlEntities(part.slice(6, -7).trim());
      return <InlineMath key={i}>{math}</InlineMath>;
    }
    return <span key={i}>{part}</span>;
  });
}
