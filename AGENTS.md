# AGENTS.md

Before implementing a feature, changing the database, or adding an API route, read the relevant files in `docs/`:

- `docs/SECURITY.md`
- `docs/CODE_STYLE.md`
- `docs/DATABASE.md`
- `docs/API.md`

Also inspect the existing codebase for patterns. Follow current conventions. Do not invent new database models, API shapes, dependencies, or security rules unless they are required.

If documentation conflicts with the implementation, flag the conflict before making a major change. After a change lands, update the matching docs file.
