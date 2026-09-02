# n8n-nodes-canny

[![Quality gate status](https://sonarcloud.io/api/project_badges/measure?project=MychelGarzon_n8n-nodes-canny&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=MychelGarzon_n8n-nodes-canny)

This is an n8n community node. It lets you use [Canny](https://canny.io/) in your n8n workflows.

Canny is a product feedback and feature-request management tool. It lets teams collect feedback from users, organize it into boards and categories, track votes and comments, and publish public roadmaps.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Post

- Create
- Get
- Get Many
- Update
- Delete
- Change Status

### Board

- Get
- Get Many

### Category

- Get
- Get Many
- Create
- Delete

### Idea

- Get
- Get Many
- Delete

### Portal Comment

- Get
- Get Many
- Create
- Delete

### Canny Trigger

Starts a workflow when a Canny event occurs (post created, status changed, comment created, vote cast, and more). Requires manual webhook setup — see [Usage](#usage) below.

**Not yet supported:** Idea filtering/sort/Merge, Post's `customFields`/`imageURLs` on Create and Update. These may be added in a future version.

## Credentials

You'll need a Canny account with API access:

1. Sign up for a free Canny account at [canny.io](https://canny.io/) if you don't already have one.
2. In your Canny dashboard, go to **Settings > API**.
3. Copy your **Secret API Key**.
4. In n8n, create a new **Canny API** credential and paste the key into the **API Key** field.

Canny's API expects the key as a field in the request body rather than a header — this credential handles that automatically.

## Compatibility

Tested against n8n using n8n-workflow's programmatic node style (`@n8n/node-cli`). No known version incompatibilities.

## Usage

### Pagination

Canny's API has two different pagination styles depending on the resource:

- **Post, Category** use skip-based pagination (`skip`/`limit`/`hasMore`).
- **Portal Comment, Idea** use cursor-based pagination (`cursor`/`hasNextPage`).

This node handles both automatically — just use the **Return All** and **Limit** fields on any "Get Many" operation.

**Board** has no server-side pagination at all; "Get Many" always returns your full list of boards in a single request.

### Setting up the Canny Trigger

Canny has no API for registering webhooks, so setup is manual:

1. Add the **Canny Trigger** node to your workflow, choose your Canny credential, and select the **Event** you want to trigger on.
2. Copy the node's **Webhook URL** (shown in the node once activated).
3. In your Canny dashboard, go to **Settings > API > Webhooks**, and paste the URL there.
4. Canny will send every subscribed event to that same URL — this node automatically verifies each payload's signature and filters out any event that doesn't match your selected **Event**, so only the one you configured actually starts the workflow.

For general help getting started with n8n, see the [Try it out](https://docs.n8n.io/try-it-out/) documentation.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Canny API reference](https://developers.canny.io/api-reference)

## Version history

### 0.2.3

Added Post Update, Delete, and Change Status operations. Implemented real webhook signature verification (HMAC-SHA256) and event filtering in Canny Trigger. Fixed a bug where Board's Get Many sent undocumented pagination parameters that silently broke the response. Fixed Portal Comment's Get Many using the wrong API version (v1 instead of v2). Refactored shared field/icon/credential definitions to reduce code duplication.

### 0.1.0

Initial release. Supports Post (Create/Get/Get Many), Board (Get/Get Many), Category (Get/Get Many/Create/Delete), Idea (Get/Get Many/Delete), and Portal Comment (Get/Get Many/Create/Delete). Canny Trigger node included as a manual-setup webhook receiver — payload signature verification not yet implemented.
