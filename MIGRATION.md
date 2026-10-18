# GitHub Pages migration handoff

This export contains the latest approved Sangmin Bae homepage, including the final Publication type → Topics → Year filter order. Treat these files as the implementation source; do not recreate the page from screenshots.

## Files

- `dist/`: complete, currently built static website. Publish the contents of this folder.
- `dist/assets/`: essential source assets as well as runtime assets: CV, portrait, original paper figures, Noto Sans font files, font license, and favicon. Keep this directory during builds: `build.py` does not regenerate its files.
- `src/`: HTML template, styles, and browser JavaScript.
- `content/`: publications, source-backed citations, and figure provenance.
- `build.py`: Python 3 standard-library build, with no package installation needed.
- `README.md`: editing instructions and content notes.
- `EXPORT-MANIFEST.json`: original Site source commit and SHA-256 file hashes.

No repository metadata, Site deployment identity, credentials, or hosting configuration are included. This archive does not automatically synchronize with either GitHub or Sites. Later changes must be committed and deployed in the chosen repository.

## Target

Repository: https://github.com/raymin0223/raymin0223.github.io
Existing custom domain: raymin0223.com (inspect the actual GitHub Pages setting and existing CNAME to retain the canonical hostname, which may include www).

## Migration

1. Inspect the existing repository, uncommitted changes, Pages publishing source, workflows, CNAME, and legacy public file URLs. Work on a dedicated branch and record the starting commit.
2. Keep the Git repository, its history, and its domain/DNS settings. Preserve the exact existing CNAME hostname where branch publishing uses it. Do not replace the repository root wholesale or blindly run a deleting sync.
3. Integrate the exported source and publish dist/ through the repository's existing workflow when practical. For branch-based static publishing, place the built files in the configured publishing root (/ or /docs) and use .nojekyll where necessary. For Actions publishing, upload dist/ as the Pages artifact. Avoid conflicting old Jekyll build workflows. Keep the source and assets maintainable.
4. Replace Site-origin absolute metadata URLs in src/index.html and build.py with the existing canonical custom-domain URL. Add or update canonical metadata consistently. Do not alter paper or external profile URLs. Keep legacy CV/paper/project URLs working when possible.
5. Run `python3 build.py`. Preserve dist/assets. Serve the resulting static output locally and check desktop/mobile layout, light/dark themes, images, fonts, CV, combined publication filters, reset, figure enlargement, and citation dialog/copy.
6. Explain the final publishing layout and future editing/build commands. Complete the migration on the working branch for review; do not push or merge to the live branch unless requested.

## Appearance and content to preserve

English-only content; Noto Sans; KAIST blue colors; current font sizes; Education immediately after News; the three Research Highlights panels; original paper figures; consistent Selected Publications thumbnail frames; BASTION highlight categorized Adaptive Computation; OPRD highlight labeled only Efficient Post-training while publication data retains both posttraining and agents; publication filter order Publication type → Topics → Year; all existing publication topics and official citation records. Other research remains an exclusive fallback category. Do not redesign or rewrite content during migration.

33 publications, including 7 selected publications. TAC-CoT currently shows Citation pending because no official citation was verified; do not invent one.
