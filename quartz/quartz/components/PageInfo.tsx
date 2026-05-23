import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const typeLabels: Record<string, { label: string; color: string }> = {
  entity: { label: "实体", color: "oklch(55% 0.14 45)" },
  topic: { label: "主题", color: "oklch(55% 0.12 170)" },
  source: { label: "素材", color: "oklch(55% 0.1 250)" },
  comparison: { label: "对比", color: "oklch(55% 0.14 300)" },
  synthesis: { label: "综合", color: "oklch(55% 0.12 200)" },
}

const confidenceLabels: Record<string, { label: string; dot: string }> = {
  confirmed: { label: "confirmed", dot: "oklch(60% 0.12 145)" },
  emerging: { label: "emerging", dot: "oklch(70% 0.12 85)" },
  opinion: { label: "opinion", dot: "oklch(55% 0.14 45)" },
  hypothesis: { label: "hypothesis", dot: "oklch(55% 0.12 250)" },
}

const PageInfo: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const fm = fileData.frontmatter as Record<string, any> | undefined
  if (!fm) return null

  const pageType = fm.type as string | undefined
  const confidence = fm.confidence as string | undefined
  const created = fm.created as string | undefined
  const updated = fm.updated as string | undefined
  const sources = fm.sources as string[] | undefined

  // Only show on wiki pages
  const slug = fileData.slug ?? ""
  const isWikiPage = slug.startsWith("wiki/")
  if (!isWikiPage) return null

  const typeInfo = pageType ? typeLabels[pageType] : null
  const confInfo = confidence ? confidenceLabels[confidence] : null

  return (
    <div class="page-info">
      <div class="info-row">
        {typeInfo && (
          <span class="info-badge type-badge" style={`--type-color: ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
        )}
        {confInfo && (
          <span class="info-badge conf-badge">
            <span class="conf-dot" style={`background: ${confInfo.dot}`} />
            {confInfo.label}
          </span>
        )}
      </div>
      <div class="info-row meta-row">
        {created && (
          <span class="meta-item">
            <span class="meta-label">created</span>
            <span class="meta-value">{created}</span>
          </span>
        )}
        {updated && updated !== created && (
          <span class="meta-item">
            <span class="meta-label">updated</span>
            <span class="meta-value">{updated}</span>
          </span>
        )}
        {sources && sources.length > 0 && (
          <span class="meta-item sources-item">
            <span class="meta-label">sources</span>
            <span class="meta-value">{sources.length}</span>
          </span>
        )}
      </div>
    </div>
  )
}

PageInfo.css = `
.page-info {
  margin: 0.75rem 0 1.25rem;
  padding: 0.75rem 1rem;
  background: var(--surface);
  border: 1px solid var(--lightgray);
  border-radius: var(--radius-md);
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.info-row + .info-row {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--lightgray);
}

.info-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--codeFont);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-sm);
  line-height: 1.4;
}

.type-badge {
  background: color-mix(in oklch, var(--type-color) 12%, var(--surface));
  color: var(--type-color);
  border: 1px solid color-mix(in oklch, var(--type-color) 25%, var(--surface));
}

.conf-badge {
  background: var(--lightgray);
  color: var(--gray);
}

.conf-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.meta-row {
  gap: 1rem;
}

.meta-item {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  font-size: 0.8rem;
}

.meta-label {
  font-family: var(--codeFont);
  color: var(--gray);
  font-size: 0.7rem;
  text-transform: lowercase;
  letter-spacing: 0.05em;
}

.meta-value {
  color: var(--darkgray);
  font-weight: 500;
}
`

export default (() => PageInfo) satisfies QuartzComponentConstructor
