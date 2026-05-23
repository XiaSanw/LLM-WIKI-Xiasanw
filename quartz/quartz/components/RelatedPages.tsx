import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative, FullSlug } from "../util/path"

const RelatedPages: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const currentSlug = fileData.slug ?? ""
  const currentTags = (fileData.frontmatter?.tags as string[]) ?? []

  // Only show on wiki pages with tags
  const isWikiPage = currentSlug.startsWith("wiki/")
  if (!isWikiPage || currentTags.length === 0) return null

  // Find pages with shared tags, sorted by number of shared tags
  const scored = allFiles
    .filter((f) => {
      const slug = f.slug ?? ""
      if (slug === currentSlug) return false
      if (!slug.startsWith("wiki/")) return false
      const tags = (f.frontmatter?.tags as string[]) ?? []
      return tags.some((t) => currentTags.includes(t))
    })
    .map((f) => {
      const tags = (f.frontmatter?.tags as string[]) ?? []
      const sharedCount = tags.filter((t) => currentTags.includes(t)).length
      return { file: f, sharedCount }
    })
    .sort((a, b) => b.sharedCount - a.sharedCount)
    .slice(0, 4)

  if (scored.length === 0) return null

  return (
    <div class="related-pages">
      <div class="related-title">Related Pages</div>
      <div class="related-grid">
        {scored.map(({ file }) => {
          const title = (file.frontmatter?.title as string) ?? file.slug
          const tags = (file.frontmatter?.tags as string[]) ?? []
          const shared = tags.filter((t) => currentTags.includes(t))
          return (
            <a
              href={resolveRelative(currentSlug as FullSlug, file.slug! as FullSlug)}
              class="related-card internal"
            >
              <div class="related-card-title">{title}</div>
              {shared.length > 0 && (
                <div class="related-card-tags">
                  {shared.slice(0, 2).map((tag) => (
                    <span class="related-tag">{tag}</span>
                  ))}
                </div>
              )}
            </a>
          )
        })}
      </div>
    </div>
  )
}

RelatedPages.css = `
.related-pages {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--lightgray);
}

.related-title {
  font-family: var(--codeFont);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gray);
  margin-bottom: 1rem;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.related-card {
  display: block;
  padding: 1rem 1.25rem 0.9rem;
  background: var(--surface);
  border: 1px solid var(--lightgray);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all 0.2s ease;
}

.related-card:hover {
  border-color: var(--secondary);
  background: var(--accent-subtle);
  transform: translateY(-1px);
}

.related-card-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--darkgray);
  line-height: 1.3;
  margin-bottom: 0.5rem;
}

.related-card:hover .related-card-title {
  color: var(--secondary);
}

.related-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.related-tag {
  font-family: var(--codeFont);
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: var(--radius-sm);
  background: var(--lightgray);
  color: var(--gray);
  text-transform: lowercase;
  line-height: 1.4;
}
`

export default (() => RelatedPages) satisfies QuartzComponentConstructor
