export interface TokenizedInput {
  original: string;
  normalized: string;
  tokens: string[];
}

const CONTRACTIONS: Record<string, string> = {
  "don't": 'do not',
  "doesn't": 'does not',
  "can't": 'can not',
  "won't": 'will not',
  "shouldn't": 'should not',
  "wouldn't": 'would not',
  "isn't": 'is not',
  "aren't": 'are not',
  "i'm": 'i am',
  "i'd": 'i would',
  "i'll": 'i will',
  "i've": 'i have',
  "it's": 'it is',
  "that's": 'that is',
  "what's": 'what is',
  "let's": 'let us',
};

export function tokenize(input: string): TokenizedInput {
  const original = input.trim();

  let normalized = original.toLowerCase();

  // Expand contractions (whole-word only to avoid mangling e.g. "bridge" → "bri wouldge")
  for (const [contraction, expansion] of Object.entries(CONTRACTIONS)) {
    const escaped = contraction.replace("'", "'?");
    normalized = normalized.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), expansion);
  }

  // Remove punctuation except hyphens (keep chain names like "bfb-1")
  normalized = normalized.replace(/[^\w\s\-$.]/g, ' ');

  // Collapse whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();

  const tokens = normalized.split(' ').filter(Boolean);

  return { original, normalized, tokens };
}
