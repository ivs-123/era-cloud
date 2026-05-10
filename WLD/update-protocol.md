# WLD Update Protocol

## When to Update

Update WLD after every meaningful work block:

- new feature
- infrastructure change
- deployment change
- database/schema change
- major bug fix
- new blocker discovered
- verification result that changes project confidence

## Required Updates

Always update:

- `WLD/history.md`
- `WLD/action-registry.md`
- `WLD/current-focus.md`

Update when relevant:

- `WLD/architecture-snapshot.md`
- `WLD/recovery-checklist.md`
- `README.md`
- `worklogdoc.md`

## History Entry Template

```markdown
## YYYY-MM-DD - Title

Focus:

- ...

Completed:

- ...

Verification:

- ...

Blockers:

- ...

Next action:

- ...
```

## Action Registry Template

```markdown
### YYYY-MM-DD

Action:

- ...

Files/Areas:

- ...

Verification:

- ...

Notes:

- ...
```

## Style Rules

- Keep entries factual.
- Prefer exact commands over vague descriptions.
- Mention blockers plainly.
- Keep next action concrete.
- Do not delete old history unless explicitly asked.
- If a command could not be run, say so and why.

