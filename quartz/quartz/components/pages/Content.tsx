import { ComponentChildren } from "preact"
import { htmlToJsx } from "../../util/jsx"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { resolveRelative, FullSlug } from "../../util/path"

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return ""
  const d = new Date(dateStr + "T00:00:00")
  const now = new Date()
  // Reset hours to compare dates only
  const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffMs = nowDate.getTime() - dDate.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return "today"
  if (diffDays === 1) return "yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function getPageType(slug: string | undefined): string {
  if (!slug) return ""
  if (slug.startsWith("wiki/entities/")) return "entity"
  if (slug.startsWith("wiki/topics/")) return "topic"
  if (slug.startsWith("wiki/sources/")) return "source"
  if (slug.startsWith("wiki/comparisons/")) return "comparison"
  return ""
}

function getPageTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    entity: "实体",
    topic: "主题",
    source: "素材",
    comparison: "对比",
  }
  return labels[type] || type
}

const Content: QuartzComponent = ({ fileData, tree, allFiles }: QuartzComponentProps) => {
  const content = htmlToJsx(fileData.filePath!, tree) as ComponentChildren
  const classes: string[] = fileData.frontmatter?.cssclasses ?? []
  const classString = ["popover-hint", ...classes].join(" ")
  const isHome = fileData.slug === "index"

  if (!isHome) {
    return <article class={classString}>{content}</article>
  }

  // ── Home LandingPage ──
  const wikiFiles = allFiles.filter((f) => (f.slug ?? "").startsWith("wiki/"))
  const entityCount = allFiles.filter((f) => (f.slug ?? "").startsWith("wiki/entities/")).length
  const topicCount = allFiles.filter((f) => (f.slug ?? "").startsWith("wiki/topics/")).length
  const sourceCount = allFiles.filter((f) => (f.slug ?? "").startsWith("wiki/sources/")).length
  const comparisonCount = allFiles.filter((f) => (f.slug ?? "").startsWith("wiki/comparisons/")).length

  const recentPages = [...wikiFiles]
    .sort((a, b) => {
      const dateA =
        (a.frontmatter?.updated as string) ??
        (a.frontmatter?.created as string) ??
        a.dates?.modified ??
        ""
      const dateB =
        (b.frontmatter?.updated as string) ??
        (b.frontmatter?.created as string) ??
        b.dates?.modified ??
        ""
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
    .slice(0, 6)

  return (
    <article class={classString}>
      {/* Hero */}
      <div class="landing-hero">
        <h1 class="landing-title">LLM Wiki</h1>
        <p class="landing-subtitle">个人知识库 — 持续积累、互相链接的 AI 时代笔记</p>
      </div>

      {/* Original markdown content */}
      {content}

      {/* Stats */}
      <div class="landing-stats">
        <a href="./wiki/entities/" class="stat-card">
          <div class="stat-number">{entityCount}</div>
          <div class="stat-label">entities</div>
        </a>
        <a href="./wiki/topics/" class="stat-card">
          <div class="stat-number">{topicCount}</div>
          <div class="stat-label">topics</div>
        </a>
        <a href="./wiki/sources/" class="stat-card">
          <div class="stat-number">{sourceCount}</div>
          <div class="stat-label">sources</div>
        </a>
        <a href="./wiki/comparisons/" class="stat-card">
          <div class="stat-number">{comparisonCount}</div>
          <div class="stat-label">comparisons</div>
        </a>
      </div>

      {/* Recent Updates */}
      {recentPages.length > 0 && (
        <div class="landing-section">
          <div class="section-title">Recent Updates</div>
          <ul class="landing-recent">
            {recentPages.map((page) => {
              const pageType = getPageType(page.filePath)
              const date =
                (page.frontmatter?.updated as string) ?? (page.frontmatter?.created as string)
              const title = (page.frontmatter?.title as string) ?? page.slug
              return (
                <li>
                  <span class="recent-date">{formatDate(date)}</span>
                  <a
                    href={resolveRelative(fileData.slug!, page.slug! as FullSlug)}
                    class="recent-title internal"
                  >
                    {title}
                  </a>
                  {pageType && <span class="recent-tag">{getPageTypeLabel(pageType)}</span>}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </article>
  )
}

export default (() => Content) satisfies QuartzComponentConstructor
