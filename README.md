# cherryl-media-web

Editorial website and newsroom publishing workbench for Cherryl Media.

## Features
- **Public Publication**: Fast, mobile-first website with category navigation, clean reading views, and responsive typography.
- **Editorial Studio**: Progressive story composer (`/admin/editor`) with auto-expanding blocks, plain English editorial fields, and direct media integration.
- **S3 Presigned Uploads**: Direct uploads via presigned URLs from `cherryl-media-engine` with local dev fallback.
- **Backend Sync**: Live status sync with the Go backend engine (`/api/articles`).

## Getting Started

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site, or [http://localhost:3000/admin](http://localhost:3000/admin) for the editorial workbench.
