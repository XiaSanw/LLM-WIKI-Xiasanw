import { FullSlug, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const TagList: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const tags = fileData.frontmatter?.tags
  if (tags && tags.length > 0) {
    return (
      <ul class={classNames(displayClass, "tags")}>
        {tags.map((tag) => {
          const linkDest = resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)
          return (
            <li>
              <a href={linkDest} class="internal tag-link">
                {tag}
              </a>
            </li>
          )
        })}
      </ul>
    )
  } else {
    return null
  }
}

TagList.css = `
.tags {
  list-style: none;
  display: flex;
  padding-left: 0;
  gap: 0.4rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.section-li > .section > .tags {
  justify-content: flex-end;
}

.tags > li {
  display: inline-block;
  white-space: nowrap;
  margin: 0;
  overflow-wrap: normal;
}

a.internal.tag-link {
  font-family: var(--codeFont);
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: lowercase;
  letter-spacing: 0.02em;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-md);
  background-color: var(--lightgray) !important;
  color: var(--gray);
  border: none;
  line-height: 1.4;
}

a.internal.tag-link:hover {
  background-color: var(--accent-hover) !important;
  color: var(--secondary);
}

a.internal.tag-link::before {
  content: "#";
  opacity: 0.5;
  margin-right: 0.15rem;
}
`

export default (() => TagList) satisfies QuartzComponentConstructor
