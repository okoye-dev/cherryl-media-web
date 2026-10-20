# Cherryl Media — Frontend Architecture & Editorial Desk Blueprint

---

## 1. Executive Mental Model & Architectural Principles

The **Cherryl Media** web frontend is a high-performance publishing application built on Next.js 15 (App Router), React 19, and Tailwind CSS. It is engineered with a strict **99:1 Read-to-Write access pattern ratio**:

- **Read Path (99%)**: Millions of daily reader requests hitting static and Incremental Static Regeneration (ISR) edge nodes with zero backend database queries.
- **Write Path (1%)**: Newsroom journalists and editors working in `/admin` authoring long-form journalistic dispatches, rearranging homepage sections, and managing site-wide breaking news copy.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Reader & Client Devices                        │
│                 (Mobile Browsers, Desktop, Tablets)                    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ HTTPS
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Website & Admin Desk (Next.js 15 App Router)              │
│                                                                        │
│  [UI Layer: React 19 Components]                                       │
│  ├── Reader Pages: /, /article/[slug], /category/[slug], /about        │
│  └── Admin Desk:   /admin, /admin/editor, /admin/sections, /admin/settings │
│                                                                        │
│  [State Machine & Custom Hooks Layer]                                  │
│  ├── useArticleEditor       ├── useCuratedSections                     │
│  ├── useSlugAvailability    ├── useEditorialSettings                   │
│  └── useTagSearch           └── usePublishPipeline                     │
│                                                                        │
│  [Dependency Injection Container & Service Layer]                      │
│  ├── ApiClient (implements IApiClient with auth header interceptor)   │
│  ├── ArticleService  (implements IArticleService)                     │
│  ├── SectionService  (implements ISectionService)                     │
│  ├── SettingsService (implements ISettingsService)                    │
│  ├── MediaService    (implements IMediaService)                       │
│  └── AuthService     (implements IAuthService)                        │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │ REST (application/json)         │ Direct S3 / R2
                    ▼                                ▼
       ┌────────────────────────┐      ┌───────────────────────────┐
       │ Go Backend Engine      │      │ Cloudflare R2 / S3 Bucket │
       │ (Port 8080)            │      │ (/media/articles/...)     │
       └────────────────────────┘      └───────────────────────────┘
```

### Core Design Rules
1. **Single Responsibility Principle (SRP)**: UI components contain zero raw HTTP queries, string manipulations, or validation regexes. They render layout and dispatch user events.
2. **Dependency Inversion Principle (DIP)**: Components consume custom React hooks; custom hooks consume interface contracts (`IArticleService`, `ISectionService`, etc.) provided by the service container (`@/services`).
3. **Decoupled API Client**: Network access, bearer token injection, timeout handling, and error wrapping live exclusively in `ApiClient.ts`.
4. **Data Cache Invalidation (ISR)**: Public story pages revalidate automatically every 30 seconds (`export const revalidate = 30`), ensuring near-instant edge delivery while reflecting editorial updates within seconds.

---

## 2. Object-Oriented Service Layer & Dependency Injection

The frontend service layer follows an Object-Oriented design with explicit TypeScript interfaces, implementations, and a centralized Service Container.

### 2.1 Interface Contracts (`services/contracts/`)
- `IApiClient`: Centralized transport abstraction with `get<T>`, `post<T>`, `put<T>`, and `delete<T>`. Automatically injects the newsroom JWT `Authorization: Bearer <token>` from the local token provider.
- `IArticleService`:
  - `getArticles(params)`: Query published or all articles.
  - `getArticleBySlug(slug)`: Fetch a single canonical article.
  - `saveArticle(article)`: Persist article draft or published record.
  - `publishArticle(slugOrId)`: Execute editorial sign-off and publication.
  - `checkSlugAvailability(slug, excludeId)`: Debounced uniqueness checking against PostgreSQL.
  - `searchTags(query)`: Search legacy tags with typeahead suggestions.
  - `getCandidates()`: Fetch automated newsroom leads from public feeds.
- `ISectionService`:
  - `getCuratedSections()`: Load layout slot assignments (Hero, Newsbeat, State Affairs, etc.).
  - `updateCuratedSections(sections)`: Batch persist section assignments to the database.
- `ISettingsService`:
  - `getEditorialCopy()`: Fetch live wire announcements, hero mastheads, and footer copy.
  - `updateEditorialCopy(copy)`: Persist updated newsroom configuration.
- `IMediaService`:
  - `uploadImage(file)`: Presigned Cloudflare R2 / S3 upload pipeline with fallback to local storage.
- `IAuthService`:
  - `login(email, password)`: Session authentication against Go / Supabase.
  - `logout()`: Invalidate token and clear session storage.
  - `getMe()`: Validate active credentials.

### 2.2 Container & Singleton Registration (`services/container.ts`)
The `ServiceContainer` class instantiates the implementations and wires their dependencies via constructor injection:

```typescript
// services/container.ts
const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  tokenProvider: () => {
    if (typeof window !== "undefined") return localStorage.getItem("cherryl_token");
    return null;
  },
});

export const articleService = new ArticleService(apiClient);
export const sectionService = new SectionService(apiClient);
export const settingsService = new SettingsService(apiClient);
export const mediaService = new MediaService(apiClient);
export const authService = new AuthService(apiClient);
```

---

## 3. Custom Hooks Architecture (State Machines)

React components stay clean and declarative by delegating async lifecycles, debouncing, and state mutations to dedicated custom hooks:

### 3.1 `useArticleEditor`
Manages the complete state of the newsroom article studio:
- **Article State**: Title, kicker, subtitle/deck, category, tags, read time, author credits, and social copy variants.
- **Content Blocks**: Ordered array of blocks (`paragraph`, `heading`, `image`, `quote`, `video`, `link`). Provides atomic operations:
  - `addBlock(type, index)`
  - `updateBlock(id, updates)`
  - `removeBlock(id)`
  - `moveBlock(index, direction)`
- **Save & Draft Lifecycle**: Handles auto-saving drafts, validation errors, and dirty state tracking.

### 3.2 `useSlugAvailability`
- Debounces user input by 300ms.
- Calls `articleService.checkSlugAvailability(slug, currentArticleId)`.
- Returns `{ isChecking, isAvailable, error }`.

### 3.3 `useTagSearch`
- Debounces tag search queries by 200ms.
- Calls `articleService.searchTags(query)`.
- Deduplicates tags across existing article assignments.

### 3.4 `useCuratedSections`
- Loads current layout sections and all published catalog articles.
- Maintains an $O(1)$ article lookup map by ID and slug.
- Provides slot operations: `openPicker`, `selectArticleForSlot`, `removeArticleFromSlot`, `moveSlot`.
- Batches updates and persists layout changes directly to PostgreSQL.

### 3.5 `useEditorialSettings`
- Manages global copy configuration (`hero`, `ticker`, `dossier`, `network`, `footer`).
- Tracks active tab, pending mutations, and confirmation toasts.

---

## 4. Reader Flows (Public Website)

```
[Reader Requests /]
       │
       ▼
[Edge / Cloudflare Cache] (Instant Cache Hit?)
       ├── YES ──► Serve Static HTML + Hydrate React
       └── NO  ──► Generate SSG/ISR (30s)
                     ├── Query Backend /api/sections (Hero, Lead, Editorial pillars)
                     ├── Query Backend /api/settings (Live Wire Ticker, Dossier copy)
                     └── Return Full HTML ( KaTeX Math + Responsive Images )
```

### 4.1 Homepage (`/`)
1. **Masthead & Live Wire Ticker**: Displays real-time breaking news banner configurable from the admin desk.
2. **Hero Lead & Editorial Dossier**: Renders the primary curated news story alongside secondary editorial highlights.
3. **Pillar Sections**: Automatically or manually curated blocks for Nigeria's 10 pillars (State Affairs, Newsbeat, Brands & SMEs, Opinions, Sports, Entertainment, Education, Thrills & Tricks, Youth Corner, Tour & Hotels).
4. **Responsive Breakpoints**:
   - Desktop: Multi-column magazine layouts with fixed aspect ratio media.
   - Tablet: Streamlined 2-column grids preventing content squishing.
   - Mobile: Clean single-column stack with thumb-friendly touch targets.

### 4.2 Article Reader (`/article/[slug]`)
1. **Header & Metadata**: Kicker, headline, deck, author badge with photo and bio, publication date, and calculated read time.
2. **Social Media & Channel Links**: Direct share buttons for X, Facebook, LinkedIn, WhatsApp, and Telegram.
3. **Block-Based Content Body**:
   - `paragraph`: High-legibility typography with optimized line lengths (65–75 characters per line).
   - `heading`: Section divisions with auto-generated anchor IDs.
   - `image`: Full-bleed or inset photographs with editorial captions and credits.
   - `quote`: Pullquotes with author attribution and source context.
   - `video`: Native HTML5 video player or responsive YouTube embeds.
   - `link`: Internal and external rich cards displaying title, deck, and source favicon.
4. **Primary Sources & Verification Box**: A dedicated section displaying all cited primary sources (e.g., official gazettes, press releases) with trust badges.
5. **Related Stories & More Stories Grid**: Contextual editorial recommendations linking readers deeper into the publication.

### 4.3 Category Pillar Feeds (`/category/[slug]`)
1. Displays all stories belonging to the specific editorial pillar.
2. Generates static paths for all 10 canonical categories at build time with 30s ISR.

---

## 5. Newsroom Admin Workflows (`/admin`)

```
[Journalist / Editor]
       │
       ├── Log In (/admin/login) ────────────► Receives JWT ──► Stored in localStorage
       │
       ├── Stories Dashboard (/admin) ────────► View metrics, discovery inbox leads, stories table
       │
       ├── Story Studio (/admin/editor) ──────► 1. Set Title & Deck
       │                                        2. Real-time Slug Check (Green / Red indicator)
       │                                        3. Pick Pillar Category & Search Tags
       │                                        4. Upload 16:9 Cover Image (Direct to R2)
       │                                        5. Compose Blocks (Paragraphs, Pullquotes, Images)
       │                                        6. Social Media Blurbs (X, FB, LinkedIn, Newsletter)
       │                                        7. Preview Article & Publish to PostgreSQL
       │
       ├── Layout Curator (/admin/sections) ──► Reorder homepage slots, assign articles via modal
       │
       └── Site Settings (/admin/settings) ───► Edit Live Wire Ticker, Hero text, masthead copy
```

### 5.1 Admin Dashboard (`/admin`)
- **Newsroom Metrics**: Story counts, active editorial pillars, distribution channels, and story leads in inbox.
- **Story Ideas & Discovery Inbox**: Automated story leads captured from public monitoring feeds ready to be triaged and drafted.
- **Stories Management Table**: Filterable list of published and draft stories with direct Edit and View links.

### 5.2 Article Studio (`/admin/editor`)
Decomposed into clean, focused subcomponents under `components/admin/editor/`:
- `EditorTopBar`: Title breadcrumbs, status badge, preview trigger, and publish button.
- `EditorMetadata`: Title, kicker, subtitle (deck), and category dropdown.
- `EditorCoverImage`: Direct file drag-and-drop with presigned S3/R2 upload and aspect ratio preview.
- `EditorTags`: Typeahead tag autocomplete with keyboard navigation.
- `EditorBlockList` & `EditorBlockItem`: The block canvas supporting add, edit, reorder, and remove.
- `EditorMoreStories`: Inline search and selection for related articles.
- `EditorSeoPanel`: Search engine preview (Google SERP snippet) and meta tags.
- `EditorPublishModal`: Pre-publish checklist verifying word count, image presence, and social blurb readiness.

### 5.3 Curated Sections Manager (`/admin/sections`)
- Decomposed into `SectionPanel`, `SectionSlotCard`, and `ArticlePickerModal`.
- Editors visually reorder slots using ↑/↓ controls or click "Replace" to search the full database catalog by headline or category.

### 5.4 Site Settings & Newsroom Copy (`/admin/settings`)
- Organized into 5 tabbed panels (`HeroSettingsPanel`, `TickerSettingsPanel`, `DossierSettingsPanel`, `NetworkSettingsPanel`, `FooterSettingsPanel`).
- Edits persist directly to the PostgreSQL `settings` table with instant fallback to default canonical values.

---

## 6. Frontend File & Folder Directory Map

```
website/
├── app/
│   ├── layout.tsx                     # Root HTML, fonts, and global metadata
│   ├── page.tsx                       # Homepage feed (ISR 30s)
│   ├── about/page.tsx                 # About Cherryl Media newsroom
│   ├── article/[slug]/page.tsx        # Long-form article reader (SSG + ISR 30s)
│   ├── category/[slug]/page.tsx       # Pillar category page (SSG + ISR 30s)
│   ├── admin/
│   │   ├── page.tsx                   # Admin dashboard & discovery inbox
│   │   ├── login/page.tsx             # Newsroom login screen
│   │   ├── editor/page.tsx            # Modular story studio page
│   │   ├── sections/page.tsx          # Homepage layout curator page
│   │   └── settings/page.tsx          # Site copy & configuration page
│   └── api/
│       ├── articles/check-slug/       # Server proxy for debounced slug checking
│       ├── tags/                      # Server proxy for tag search autocomplete
│       └── upload/                    # Fallback upload proxy
├── components/
│   ├── admin/
│   │   ├── editor/                    # 9 modular editor components
│   │   ├── sections/                  # Slot cards, panels, and picker modal
│   │   └── settings/                  # 5 copy configuration tab panels
│   ├── layout/                        # Header, Ticker, Navigation, Footer
│   ├── article/                       # Block renderers, citations box, audio player
│   └── cards/                         # Standard, Hero, and Compact story cards
├── hooks/
│   ├── useArticleEditor.ts            # Editor state machine & block operations
│   ├── useCuratedSections.ts          # Curated layout state machine
│   ├── useEditorialSettings.ts        # Site copy state machine
│   ├── usePublishPipeline.ts          # Pre-publish validation & publishing logic
│   ├── useSlugAvailability.ts         # Debounced slug checker
│   └── useTagSearch.ts                # Debounced tag search
├── services/
│   ├── contracts/                     # IApiClient, IArticleService, etc.
│   ├── implementations/               # ApiClient, ArticleService, etc.
│   ├── container.ts                   # Dependency Injection container
│   └── index.ts                       # Public service exports
├── lib/                               # Data models, types, and fallback data
└── config/                            # Site pillars, navigation, and SEO constants
```
