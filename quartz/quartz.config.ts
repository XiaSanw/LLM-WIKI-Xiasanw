import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * llmwiki-base — Quartz 配置
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "LLM Wiki",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    locale: "zh-CN",
    baseUrl: "llmwiki.local",
    ignorePatterns: ["private", "templates", ".obsidian", ".wiki-schema.md"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: {
          name: "Schibsted Grotesk",
          weights: [400, 500, 600, 700],
        },
        body: {
          name: "Source Sans 3",
          weights: [400, 600],
        },
        code: {
          name: "IBM Plex Mono",
          weights: [400],
        },
      },
      colors: {
        lightMode: {
          light: "oklch(98% 0.004 85)",
          lightgray: "oklch(90% 0.006 85)",
          gray: "oklch(65% 0.015 70)",
          darkgray: "oklch(35% 0.02 70)",
          dark: "oklch(22% 0.02 70)",
          secondary: "oklch(55% 0.14 45)",
          tertiary: "oklch(48% 0.16 45)",
          highlight: "oklch(55% 0.14 45 / 0.12)",
          textHighlight: "oklch(85% 0.15 95 / 0.35)",
        },
        darkMode: {
          light: "oklch(18% 0.01 70)",
          lightgray: "oklch(30% 0.01 70)",
          gray: "oklch(55% 0.015 70)",
          darkgray: "oklch(80% 0.01 70)",
          dark: "oklch(92% 0.01 70)",
          secondary: "oklch(68% 0.14 45)",
          tertiary: "oklch(75% 0.12 45)",
          highlight: "oklch(68% 0.14 45 / 0.15)",
          textHighlight: "oklch(80% 0.12 95 / 0.25)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      // Plugin.CustomOgImages(),
    ],
  },
}

export default config
