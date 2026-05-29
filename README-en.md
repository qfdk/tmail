## 📮 Temporary Mail (Heavily Modified)

> Forked from [sunls24/tmail](https://github.com/sunls24/tmail) with substantial changes.
> The UI takes visual cues from [denghongcai/forsaken-mail](https://github.com/denghongcai/forsaken-mail).

Built with Golang + Astro + React + Server-Sent Events for real-time mail delivery.

- [x] Email CSS style isolation (Shadow DOM)
- [x] **SSE push replaces long polling** (25s heartbeat, browser auto-reconnect)
- [x] Dark theme and language switching
- [x] View and download attachments
- [x] Inline mail detail panel (no more dialog)
- [x] Per-mail delete (database row + attachment files on disk)
- [x] **MySQL driver support** (in addition to the original SQLite)
- [x] Three-section UI rebuild (status banner / table / detail or FAQ card) — visual cues from forsaken-mail
- [x] Responsive header: address bar drops to its own row on small screens
- [x] Bottom-center toast position (thumb-friendly on mobile)

Anonymous disposable email to protect your personal email address from spam.

## 🛠 Differences from upstream

| Topic | Upstream | This fork |
| --- | --- | --- |
| Realtime push | Long polling (`/api/fetch/latest`) | SSE (`/api/stream`) |
| Database | SQLite | SQLite / MySQL |
| Mail detail | AlertDialog modal | Inline expansion below the list |
| Delete mail | none | `DELETE /api/fetch/:id` + UI button |
| Header layout | Single column + sidebar Actions | forsaken-mail-style address bar, mobile-responsive |

## 🎉 What can it do?

- Register on websites where you don't want to expose your real email address, avoiding spam.
- Create multiple accounts on the same platform without needing multiple email addresses.

## ⚠️ Warning

- **❗Received emails are only retained for 10 days**
- **❗Randomly generated email addresses can be used by anyone, do not use for registering important accounts**
