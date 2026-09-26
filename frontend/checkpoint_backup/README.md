# Pre-Restoration Checkpoint Backup

This directory references the checkpoints preserved before restoring the modular architecture from commit `93a62553`:

1. `frontend/src/App.monolith.backup.tsx` - Complete monolithic single-file App.tsx (1,074 lines) with inline state, charts, upload, and history logic.
2. `frontend/src/App.monolith.backup.css` - Monolithic legacy stylesheet (837 lines).
3. `frontend/src/index.backup.css` - Legacy index stylesheet.

These checkpoints remain intact and preserved in the repository.
`tsconfig.app.json` has been configured with `"exclude": ["src/**/*.backup.*"]` so that these files are safely excluded from TypeScript build compilation while maintaining a permanent record.
