# Assets Guidelines

Structure:
- `images/`    : static bitmaps (png/jpg/webp)
- `icons/`     : icon packs/svg/png
- `fonts/`     : custom fonts (ttf/otf)
- `lottie/`    : lottie animations (json)

Conventions:
- Use lowercase, kebab-case filenames (e.g., `login-bg.png`).
- Keep raw source files (e.g., .fig/.ai) outside the repo or in /docs/design if needed.
- Prefer WebP/PNG for images; SVG for icons when supported.
- For fonts, include license info in a sibling `LICENSE.txt`.

Usage patterns:
- Import via absolute/relative paths from `src/assets/...`.
- Centralize exports in index files if the list grows (e.g., `src/assets/images/index.ts`).

Notes:
- Add `.gitkeep` if you need to commit empty folders.
- Optimize images before adding (TinyPNG, Squoosh).
