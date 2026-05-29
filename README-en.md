## 📮 Temporary Mail (UI fork)

> Backend core (SMTP intake, ent ORM, attachment handling) is from
> [sunls24/tmail](https://github.com/sunls24/tmail).
> The **main work in this fork is the UI rebuild**, with visual cues from
> [denghongcai/forsaken-mail](https://github.com/denghongcai/forsaken-mail).
> Realtime delivery was also switched from long polling to Server-Sent Events,
> along with a few smaller features.

Built with Golang + Astro + React + Server-Sent Events.

### UI rebuild (the main work)

- [x] Three-section layout: status banner / mail table / detail or FAQ card
- [x] Inline mail detail panel (replaces the old AlertDialog modal)
- [x] forsaken-mail-style address bar: mail icon button / click input to copy / inline edit (Enter to confirm, Esc to cancel)
- [x] Responsive header: address bar drops to its own row on small screens
- [x] Bottom-center toast position (thumb-friendly on mobile)

### Other changes

- [x] **SSE push, no more long polling** (25s heartbeat to defeat proxy idle timeouts, browser auto-reconnect)
- [x] **MySQL driver added** (upstream only supports PostgreSQL)
- [x] Per-mail delete (database row + attachment files on disk)
- [x] Email CSS style isolation (Shadow DOM — inherited from upstream)
- [x] Dark theme + language switch (inherited from upstream)
- [x] View and download attachments (inherited from upstream)

## 🛠 Differences from upstream

| Topic | Upstream | This fork |
| --- | --- | --- |
| Realtime push | Long polling (`/api/fetch/latest`) | SSE (`/api/stream`) |
| Database | PostgreSQL | PostgreSQL / MySQL |
| Mail detail | AlertDialog modal | Inline expansion below the list |
| Delete mail | none | `DELETE /api/fetch/:id` + UI button |
| Header layout | Single column + sidebar Actions | forsaken-mail-style address bar, mobile-responsive |

## 🎉 What can it do?

- Register on websites where you don't want to expose your real email address, avoiding spam.
- Create multiple accounts on the same platform without needing multiple email addresses.

## ⚠️ Warning

- **❗Received emails are only retained for 10 days**
- **❗Randomly generated email addresses can be used by anyone, do not use for registering important accounts**
