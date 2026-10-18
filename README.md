# Update

- Edit `src/index.html` for page content and research highlights.
- Update `content/publications.json` and `content/citations.json` for publications and BibTeX.
- Edit `src/styles.css` and `src/app.js` for styling and interactions.
- Update images, fonts, and the CV in `dist/assets/`. Keep this folder when building.

Build, check, and preview:

```bash
python3 build.py
python3 scripts/check_site.py
python3 -m http.server 8000 --bind 127.0.0.1
```

Open <http://localhost:8000>. Commit the source and generated files, then push to `main` to publish.
