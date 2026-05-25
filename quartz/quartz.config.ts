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
    ignorePatterns: ["private", "templates", ".obsidian", ".wiki-schema.md", "seeds", "tasks", "assets"],
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
          light: "#faf8f5",
          lightgray: "#e0deda",
          gray: "#958e86",
          darkgray: "#41392f",
          dark: "#211910",
          secondary: "#b2511e",
          tertiary: "#a23300",
          highlight: "rgba(178, 81, 30, 0.12)",
          textHighlight: "rgba(237, 204, 72, 0.35)",
        },
        darkMode: {
          light: "#15110d",
          lightgray: "#312d28",
          gray: "#777068",
          darkgray: "#c2bdb7",
          dark: "#e9e4de",
          secondary: "#de7949",
          tertiary: "#ed946c",
          highlight: "rgba(222, 121, 73, 0.15)",
          textHighlight: "rgba(214, 189, 92, 0.25)",
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
