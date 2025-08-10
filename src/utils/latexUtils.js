import React from "react";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

/**
 * Render a string containing mixed plain text and LaTeX math chunks wrapped in [[[ ... ]]].
 * Example input:
 *   "The formula is [[[ E=mc^2 ]]] which is famous."
 * 
 * Output will be React nodes mixing spans and InlineMath components.
 * 
 * @param {string} str - input string with mixed text and LaTeX chunks
 * @returns {React.ReactNode[]} array of React nodes
 */
export function renderMixedMath(str) {
  if (!str) return null;

  // Split by triple brackets delimiters [[[ ... ]]]
  // Regex explanation:
  // Matches [[[ ... ]]] including inner content lazily (non-greedy)
  const parts = str.split(/(\[\[\[[^\]]+?\]\]\])/g).filter(Boolean);

  return parts.map((part, i) => {
    // Check if part is a math chunk wrapped in [[[ ... ]]]
    if (part.startsWith('[[[') && part.endsWith(']]]')) {
      // Strip delimiters
      const math = part.slice(3, -3).trim();
      return <InlineMath key={i}>{math}</InlineMath>;
    }
    // Plain text chunk
    return <span key={i}>{part}</span>;
  });
}
