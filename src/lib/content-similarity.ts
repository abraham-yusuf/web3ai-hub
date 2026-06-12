/**
 * Content Similarity Detection
 * Uses Jaccard similarity on word n-grams to detect near-duplicate content.
 * Returns a score between 0.0 (completely different) and 1.0 (identical).
 */

// Generate word n-grams from text
function getNgrams(text: string, n: number = 3): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0);

  const ngrams = new Set<string>();
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.add(words.slice(i, i + n).join(' '));
  }
  return ngrams;
}

// Jaccard similarity between two sets
function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Calculate similarity between two content strings.
 * Returns a value between 0.0 and 1.0.
 */
export function calculateSimilarity(contentA: string, contentB: string): number {
  // Remove markdown syntax for cleaner comparison
  const cleanA = contentA
    .replace(/^---[\s\S]*?---/m, '') // remove frontmatter
    .replace(/#{1,6}\s/g, '') // remove headings
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove links
    .replace(/[*_~`]/g, '') // remove formatting
    .replace(/\n+/g, ' ') // normalize whitespace
    .trim();

  const cleanB = contentB
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  // Use trigrams for comparison
  const ngramsA = getNgrams(cleanA, 3);
  const ngramsB = getNgrams(cleanB, 3);

  return jaccardSimilarity(ngramsA, ngramsB);
}

/**
 * Check content against a list of existing posts.
 * Returns the maximum similarity score and matching posts.
 */
export function checkContentSimilarity(
  newContent: string,
  existingPosts: Array<{ slug: string; title: string; content: string }>,
  excludeSlug?: string
): {
  maxSimilarity: number;
  blocked: boolean;
  matches: Array<{ slug: string; title: string; similarity: number }>;
} {
  const SIMILARITY_THRESHOLD = 0.8;

  const matches: Array<{ slug: string; title: string; similarity: number }> = [];

  for (const post of existingPosts) {
    if (excludeSlug && post.slug === excludeSlug) continue;

    const similarity = calculateSimilarity(newContent, post.content);
    if (similarity > 0.3) {
      matches.push({
        slug: post.slug,
        title: post.title,
        similarity: Math.round(similarity * 100) / 100,
      });
    }
  }

  // Sort by similarity descending
  matches.sort((a, b) => b.similarity - a.similarity);

  const maxSimilarity = matches.length > 0 ? matches[0].similarity : 0;

  return {
    maxSimilarity,
    blocked: maxSimilarity > SIMILARITY_THRESHOLD,
    matches: matches.slice(0, 5), // top 5 matches
  };
}
