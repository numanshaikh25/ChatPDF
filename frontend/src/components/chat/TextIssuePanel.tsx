'use client'

import { useMemo } from 'react'
import { AlertCircle, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react'
import { analyzeText, ISSUE_TYPE_STYLES, CATEGORY_LABELS, type TextIssue, type IssueType } from '@/lib/textAnalysis'
import { cn } from '@/lib/utils'

const TYPE_ICONS: Record<IssueType, React.ReactNode> = {
  error:      <AlertCircle  className="h-3 w-3 shrink-0 mt-px" />,
  warning:    <AlertTriangle className="h-3 w-3 shrink-0 mt-px" />,
  suggestion: <Lightbulb    className="h-3 w-3 shrink-0 mt-px" />,
}

const TYPE_ORDER: IssueType[] = ['error', 'warning', 'suggestion']

interface TextIssuePanelProps {
  text: string
}

export function TextIssuePanel({ text }: TextIssuePanelProps) {
  const issues = useMemo(() => analyzeText(text), [text])

  if (!text || issues.length === 0) {
    if (text.trim().length > 0) {
      /* All clear */
      return (
        <div className="flex items-center gap-1.5 px-1 animate-fade-in">
          <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
          <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">
            No issues detected
          </span>
        </div>
      )
    }
    return null
  }

  /* Group issues by type for ordered rendering */
  const grouped = TYPE_ORDER.reduce<Record<IssueType, TextIssue[]>>(
    (acc, t) => {
      acc[t] = issues.filter((i) => i.type === t)
      return acc
    },
    { error: [], warning: [], suggestion: [] }
  )

  const errorCount   = grouped.error.length
  const warningCount = grouped.warning.length
  const suggestCount = grouped.suggestion.length

  return (
    <div className="flex flex-col gap-1.5 animate-fade-in">
      {/* Summary bar */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-[10px] text-muted-foreground/70 font-medium select-none">
          Text check:
        </span>
        {errorCount   > 0 && <Badge type="error"      count={errorCount}   />}
        {warningCount > 0 && <Badge type="warning"    count={warningCount} />}
        {suggestCount > 0 && <Badge type="suggestion" count={suggestCount} />}
      </div>

      {/* Issue chips */}
      <div className="flex flex-col gap-1 max-h-28 overflow-y-auto pr-0.5">
        {TYPE_ORDER.flatMap((type) =>
          grouped[type].map((issue) => {
            const styles = ISSUE_TYPE_STYLES[issue.type]
            return (
              <div
                key={issue.id}
                className={cn(
                  'flex items-start gap-1.5 px-2 py-1 rounded-lg border text-[10px] leading-relaxed',
                  styles.bg,
                  styles.text,
                  styles.border
                )}
              >
                {TYPE_ICONS[issue.type]}
                <span>
                  <span className="font-semibold mr-1">
                    {CATEGORY_LABELS[issue.category]}:
                  </span>
                  {issue.message}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

/* ── Internal badge ────────────────────────────────────────────────── */
function Badge({ type, count }: { type: IssueType; count: number }) {
  const styles = ISSUE_TYPE_STYLES[type]
  const labels: Record<IssueType, string> = {
    error:      count === 1 ? '1 error'      : `${count} errors`,
    warning:    count === 1 ? '1 warning'    : `${count} warnings`,
    suggestion: count === 1 ? '1 suggestion' : `${count} suggestions`,
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-semibold',
        styles.bg,
        styles.text,
        styles.border
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', styles.dot)} />
      {labels[type]}
    </span>
  )
}
