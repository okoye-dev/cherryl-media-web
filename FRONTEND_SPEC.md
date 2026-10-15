# Cherryl Media: Frontend Architecture & Design Specification

## 1. Overview
The frontend is a lightweight, mobile-first Next.js 15 application engineered for high-performance editorial publishing, reading experience, and in-house content operations. It eliminates third-party CMS bloat (Sanity) in favor of direct database/API bindings and native media uploads.

---

## 2. Tech Stack & Styling Tokens

- **Framework**: Next.js 15 (App Router, Server Components default)
- **Runtime**: React 19, Node.js 20+
- **Styling**: Tailwind CSS 3.4
- **Typography**: 
  - Serif / Display: `Playfair Display` (editorial headlines, drop-caps, quotes)
  - Sans / Interface: `Inter` (body copy, metadata, UI controls)
  - Mono / Numbers: `JetBrains Mono` (datelines, counters, timestamps)
- **Palette**:
  - Newsprint Base: `#F4F3EE` (warm architectural stone)
  - Card / Panel Surface: `#EAE8E0` / `#FFFFFF`
  - Deep Ink: `#1A1A1A`
  - Soft Ink: `#5A5A58`
  - Cherryl Editorial Red: `#D02B2B` (hover: `#B82424`)
  - Admin Slate Dark: `#0B0F19`

---

## 3. Public Reader Experience (`/` & `/article/[slug]`)

### 3.1 Editorial Structure & Five Pillars
1. **Nigerian Current Affairs** (`/category/nigerian-current-affairs`)
2. **Entertainment & Internet Culture** (`/category/entertainment-internet-culture`)
3. **Practical Nigerian Updates** (`/category/practical-nigerian-updates`)
4. **Business & Institutions** (`/category/business-institutions`)
5. **Stories & Romance** (`/category/stories-romance`)

### 3.2 Medium-Style Article Blocks (`ArticleBody.tsx`)
Each article is composed of structured JSON blocks:
- **Lead Paragraph**: Automatic drop-cap typography on initial sentence.
- **Section Headings**: Scaled serif H2/H3 anchors.
- **Pull-Quotes**: Full-width bordered quote cards with red hairline accent, author attribution, and source context.
- **Inline Captioned Imagery**: High-res story assets with alt descriptions and source attribution.
- **Internal Related Links**: Highlight card embedding internal articles to retain readers.
- **Primary Source Attestations**: Verified source card detailing issuing agency, source publication, and direct URL.
- **Social Media Preview**: Collapsible preview showing how the story renders on X, Facebook, LinkedIn, and Newsletter.

---

## 4. Editorial Admin Panel (`/admin`)

### 4.1 Story Ideas Inbox (`/admin`)
- Queue of suggested stories ranked by relevance, freshness, and source reliability.
- Filterable by editorial status (`draft`, `in_review`, `approved`, `published`).
- Quick actions: Open in Editor, Review, Reject, Approve.
- Metric indicators: Total pipeline, in review count, scheduled broadcasts.

### 4.2 Progressive Story & Social Media Editor (`/admin/editor`)
- **Metadata Controls**: Title, Kicker, Category selection, Author name & role, Read-time estimator.
- **Block Composer**: Interactive builder to reorder and edit paragraphs, drop-caps, headings, quotes, uploaded images, and links.
- **Simple Photo Uploader**: One-click file picker allowing editors to choose directly from device files or camera roll.
- **Source Verification Shelf**: Multi-source link manager tracking original government gazettes, news APIs, and reports.
- **Social Media Tabs**:
  - **X (Twitter)**: Character counter (280 limit) and thread builder.
  - **Facebook**: Hook generator with social visual toggle.
  - **LinkedIn**: Institutional/macro-economic angle editor.
  - **Newsletter**: Digest summary formatter.
- **Editorial Action Bar**: Draft autosave, Approve for Distribution, and Publish trigger.

---

## 5. Media & Asset Pipeline (Direct Uploads)
- Direct image and photo uploads from editor interface.
- Files stored in local media upload directory (`/uploads/`) or volume storage.
- Immediate client-side thumbnail previews during writing.
- Responsive image delivery.
