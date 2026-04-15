# Decision Log

Append-only. Never edit past entries.
Format: `[YYYY-MM-DD] DECISION: ... | REASONING: ... | CONTEXT: ...`

---

[2026-04-14] DECISION: Use Supabase Storage for announcement images, bucket "announcements" (public) | REASONING: Consistent with existing pattern used for profile images and support screenshots. Auto-cleanup on announcement delete to avoid orphaned files. | CONTEXT: Announcement system image upload feature.

[2026-04-14] DECISION: Use TipTap WYSIWYG editor for announcement message field, store output as HTML in MongoDB | REASONING: Admin (Sango) wants rich formatting (headings, bold, lists, etc.) without writing markdown syntax. TipTap is admin-only so no impact on user-facing performance. HTML stored directly, rendered with dangerouslySetInnerHTML in popup. | CONTEXT: Announcement system rich text upgrade.

[2026-04-14] DECISION: Announcement image has two layout options: "thumbnail" (small, left of text) and "banner" (full-width above text) | REASONING: Different announcements need different visual treatments. Two options covers most cases without over-engineering. | CONTEXT: Announcement system image layout.

[2026-04-14] DECISION: What's New page (/updates) shows title cards, clicking opens AnnouncementPopup in preview mode | REASONING: Cleaner UX than showing truncated raw text. Consistent with admin preview behavior. | CONTEXT: What's New page redesign.

[2026-04-14] DECISION: Added Supabase MCP server (https://mcp.supabase.com/mcp) at --scope user | REASONING: Enables direct Supabase management (buckets, SQL, etc.) from Claude Code without manual API calls. | CONTEXT: MCP setup session.
