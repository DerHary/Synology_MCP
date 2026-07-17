# Synology_MCP

A modular MCP server for a mixed Synology workspace stack:

- DSM / system info
- File Station
- Synology Calendar
- Note Station / DS Note
- Synology Contacts
- Synology Chat
- Download Station
- Container Manager

## Goals

This server is built as a full multi-domain Synology MCP instead of a narrow single-purpose bridge.
It separates:

- shared DSM auth and API discovery
- per-service adapters
- MCP tool registration
- safety gates for read, mutate, and dangerous operations

## Current integration model

The server supports two integration styles:

- official Synology WebAPI modules where public docs are available
- flexible candidate probing or alternative transports where Synology's public API surface is thinner

That means:

- `DSM`, `File Station`, `Calendar`, and `Download Station` use normal WebAPI calls
- `Note Station`, `Contacts`, and `Chat` use private API candidate probing
- `Chat` can alternatively send via webhook transport
- `Container Manager` can use either private API candidates or direct Docker Engine HTTP API

## Safety modes

- `readonly`
- `standard_mutation`
- `admin_dangerous`

Destructive tools are blocked unless the configured mode allows them.

## Configuration

Copy `.env.example` values into your environment before running:

```powershell
$env:SYN_HOST="https://diskstation.local:5001"
$env:SYN_USERNAME="admin"
$env:SYN_PASSWORD="secret"
$env:SYN_SAFETY_MODE="standard_mutation"
$env:SYN_ENABLED_MODULES="dsm,files,calendar,notes,contacts,chat,downloads,containers"
```

Optional:

- `SYN_OTP_CODE`
- `SYN_IGNORE_TLS=true`
- `SYN_CHAT_TRANSPORT=webhook`
- `SYN_CHAT_WEBHOOK_URL=...`
- `SYN_CONTAINER_TRANSPORT=docker`
- `SYN_DOCKER_BASE_URL=http://diskstation.local:2375`

## Install

```bash
npm install
npm run build
```

## Run

```bash
npm start
```

## Notes

- The weaker documented Synology app domains are implemented with adapter fallbacks so the server can be tuned against real NAS behavior without rewriting the MCP surface.
- Container support is intentionally able to bypass private DSM UI APIs and talk to Docker directly when that is the more stable path.
