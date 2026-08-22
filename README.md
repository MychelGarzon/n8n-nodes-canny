# n8n-nodes-canny

An n8n community node for [Canny](https://canny.io) — product feedback, feature request, and roadmap management.

> This is an independent, community-built integration. It is not affiliated with, endorsed by, or sponsored by Canny Inc.

## Installation

Follow the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/), using `n8n-nodes-canny` as the package name.

## Credentials

You need a Canny API key, found in your Canny workspace under **Settings > API**. Paste it into the "API Key" field on the Canny credential — the node handles injecting it into requests correctly (Canny expects the key as a POST body field, not an Authorization header).

## Resources supported (v1)

- Boards
- Categories
- Posts
- Ideas
- Portal Comments

Companies, Opportunities, and Insights are planned for a later release.

## Trigger

The Canny Trigger node (event-based) is pending confirmation of Canny's webhook payload and signature format. See open items below.

## Development status

This package is a scaffold reserving the `n8n-nodes-canny` name ahead of full development. Build is in progress.

## License

MIT
