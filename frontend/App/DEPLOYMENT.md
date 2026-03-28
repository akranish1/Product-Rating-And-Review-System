# SPA Deployment Notes

This app uses `BrowserRouter`, so deep links like `/review` or `/review/123` must be rewritten to `index.html` by the host.

## Render Static Site

Add a rewrite rule in Render:

- Source: `/*`
- Destination: `/index.html`
- Action: `Rewrite`

## AWS S3 Static Website Hosting

Set these bucket website hosting values:

- Index document: `index.html`
- Error document: `404.html`

The included `public/404.html` redirects deep-link refreshes back into the React app.

## AWS CloudFront

If you serve the app through CloudFront, add custom error responses:

- HTTP 403 -> `/404.html`
- HTTP 404 -> `/404.html`

Set the response code to `200` if you want deep links to behave like a normal page load.
