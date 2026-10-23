# AGENTS.md

- Authentication and orders use the existing Cloud integration; guest preference and cart remain browser-local, because guest browsing must not grant authenticated data access.
- Administrative UI waits for hydrated database-backed identity; database RLS and RPC authorization remain the authority, never client storage or metadata.

- Chat persists through the existing chat tables and RPCs; each subscription uses a unique topic and cleans up its channel, events and recovery timer to prevent duplicate-topic runtime failures. The shared ChatPanel serves both sides and owner-scoped unread queries prevent administrative visibility from inflating customer badges.
- Reusable motion lives in PremiumMotion and honors reduced-motion preferences; informational pages share FAQ data from src/lib/faq.ts to keep answers consistent.
