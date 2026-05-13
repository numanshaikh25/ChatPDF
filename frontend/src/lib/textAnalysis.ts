/**
 * textAnalysis.ts
 * Real-time text inconsistency and punctuation detection utility.
 */

export type IssueType = 'error' | 'warning' | 'suggestion'
export type IssueCategory =
  | 'spacing'
  | 'punctuation'
  | 'repetition'
  | 'capitalization'
  | 'grammar'

export interface TextIssue {
  id: string
  type: IssueType
  category: IssueCategory
  message: string
}

interface Rule {
  id: string
  type: IssueType
  category: IssueCategory
  message: string
  test: (text: string) => boolean
}

const RULES: Rule[] = [
  /* ── Spacing ──────────────────────────────────── */
  {
    id: 'double-space',
    type: 'warning',
    category: 'spacing',
    message: 'Multiple consecutive spaces detected',
    test: (t) => /  +/.test(t),
  },
  {
    id: 'trailing-space',
    type: 'suggestion',
    category: 'spacing',
    message: 'Trailing whitespace at end of input',
    test: (t) => /\s$/.test(t),
  },
  {
    id: 'space-before-punctuation',
    type: 'error',
    category: 'punctuation',
    message: 'Space before punctuation mark (e.g. "word .")',
    test: (t) => / [.,;:!?]/.test(t),
  },

  /* ── Punctuation ──────────────────────────────── */
  {
    id: 'missing-space-after-punctuation',
    type: 'error',
    category: 'punctuation',
    message: 'Missing space after punctuation mark (e.g. "word.Next")',
    test: (t) => /[.,;:!?][a-zA-Z]/.test(t),
  },
  {
    id: 'double-punctuation',
    type: 'warning',
    category: 'punctuation',
    message: 'Repeated punctuation marks (e.g. "!!" or "??")',
    test: (t) => /([!?])\1+/.test(t) || /\.{4,}/.test(t),
  },
  {
    id: 'mixed-punctuation',
    type: 'warning',
    category: 'punctuation',
    message: 'Mixed punctuation marks at sentence end (e.g. "!?")',
    test: (t) => /[!?][.!?]|[.][!?]/.test(t),
  },
  {
    id: 'comma-after-space',
    type: 'error',
    category: 'punctuation',
    message: 'Comma or period appears to be misplaced after a space',
    test: (t) => /\s[,]/.test(t),
  },

  /* ── Capitalization ───────────────────────────── */
  {
    id: 'lowercase-start',
    type: 'suggestion',
    category: 'capitalization',
    message: 'Input starts with a lowercase letter',
    test: (t) => t.length > 1 && /^[a-z]/.test(t.trim()),
  },
  {
    id: 'no-capital-after-sentence',
    type: 'warning',
    category: 'capitalization',
    message: 'Sentence not capitalized after end punctuation',
    test: (t) => /[.!?]\s+[a-z]/.test(t),
  },

  /* ── Repetition ───────────────────────────────── */
  {
    id: 'repeated-word',
    type: 'error',
    category: 'repetition',
    message: 'Repeated word detected (e.g. "the the")',
    test: (t) => {
      const words = t.toLowerCase().match(/\b\w+\b/g) ?? []
      for (let i = 1; i < words.length; i++) {
        if (words[i] === words[i - 1] && words[i].length > 1) return true
      }
      return false
    },
  },

  /* ── Grammar / Style ──────────────────────────── */
  {
    id: 'i-not-capitalised',
    type: 'error',
    category: 'grammar',
    message: 'The pronoun "i" should always be capitalised',
    test: (t) => /(?<!\w)i(?!\w)/.test(t),
  },
  {
    id: 'double-conjunction',
    type: 'warning',
    category: 'grammar',
    message: 'Possible double conjunction (e.g. "and and", "but but")',
    test: (t) =>
      /\b(and|but|or|nor|so|yet|for)\s+\1\b/i.test(t),
  },
]

/**
 * Analyse a piece of text and return all detected issues.
 * Runs every rule once — O(n * rules) where n = text length.
 */
export function analyzeText(text: string): TextIssue[] {
  if (!text || text.trim().length === 0) return []
  return RULES.filter((rule) => rule.test(text)).map(({ id, type, category, message }) => ({
    id,
    type,
    category,
    message,
  }))
}

/** Colour mapping for each issue type */
export const ISSUE_TYPE_STYLES: Record<
  IssueType,
  { bg: string; text: string; border: string; dot: string }
> = {
  error: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    dot: 'bg-red-500',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  suggestion: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
}

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  spacing: 'Spacing',
  punctuation: 'Punctuation',
  repetition: 'Repetition',
  capitalization: 'Capitalisation',
  grammar: 'Grammar',
}
