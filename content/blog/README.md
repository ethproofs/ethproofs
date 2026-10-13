# Blog posts

Each post is `content/blog/<slug>.mdx`; the file name is the URL (`/blog/<slug>`).
Images go in `public/blog/<slug>/` (kebab-case file names) and are referenced as `/blog/<slug>/<file>`.

## Publishing

Posts are no longer edited in Ghost. To publish or change a post, open a PR with the `.mdx` file and its images, check it on the deploy preview, and merge: the post goes live with the next deploy.

```mdx
---
title: "Post title"
publishedAt: 2026-10-12T12:00:00.000Z
excerpt: "One or two sentences for the blog index and meta description."
featureImage: /blog/<slug>/header.jpg
tags:
  - "product"
authors:
  - name: "Fara Woolf"
    image: /blog/authors/me-bw.jpeg
---

Markdown with GFM tables and footnotes[^1].

<Callout emoji="👉" color="blue">
Callout text. `color` is `grey` (default) or `blue`.
</Callout>

<Figure src="/blog/<slug>/chart.png" alt="Describe the image" caption="Optional caption" />

[^1]: Footnote text.
```

Escape a literal `<` as `&lt;` and `{`/`}` as `\{`/`\}`; MDX reads them as JSX and expressions.
