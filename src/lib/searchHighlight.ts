export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

export function getHighlightSegments(text: string, query: string): HighlightSegment[] {
  if (!query) return [{ text, highlighted: false }];

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi")).filter(Boolean);
  const normalizedQuery = query.toLowerCase();

  return parts.map((part) => ({
    text: part,
    highlighted: part.toLowerCase() === normalizedQuery,
  }));
}
