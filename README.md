# Chih-Chi Huang

Personal site for a UMSI product-management student aiming at technical product management.

The biography, case studies, and both languages live in `src/content.ts`. Case studies stay inside the roles and results on the résumé.

## Run the personal site

```bash
npm install
npm run dev
```

## Internship dashboard

The dashboard is a separate app. It does not share the personal site’s pages or navigation. The US board lists open roles even when the official page never mentions a visa, and it keeps the name and link when that page cannot be read. A US role is removed only when the posting refuses sponsorship, requires citizenship or a clearance, or is closed. Roles outside the US are on the other board. InternTrack and JobSpy are tools rather than posting lists, so they are not a feed here.

```bash
npm run dashboard
```

Open the URL Vite prints. The root of that server is the dashboard.

The list is rebuilt every morning at 6:00 AM America/Detroit and committed on `main`. That job does not publish the personal site. Refresh the file by hand with:

```bash
python3 internships/aggregate.py
```

## Build

```bash
npm run build
npm run preview
```

`public/404.html` restores deep links when the site is hosted as a GitHub Pages project at `/personal_website/`.

## Publish

GitHub Pages on a free account needs this repository to be public. After it is public and this branch is on `main`, the Deploy site workflow publishes:

https://joanuser.github.io/personal_website/

In Settings → Pages, set Build and deployment to GitHub Actions.
