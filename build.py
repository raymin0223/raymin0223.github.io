"""Build dist/ and copy it to the existing GitHub Pages publishing root."""
import hashlib
import html
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
# These are source assets from the export; the renderer cannot recreate them.
if not (DIST / "assets").is_dir():
    raise FileNotFoundError("Restore dist/assets from Git before building; it contains the source images, fonts, and CV.")
papers = json.loads((ROOT / "content/publications.json").read_text())
citations = json.loads((ROOT / "content/citations.json").read_text())
assert len(papers) == len({p["id"] for p in papers})
assert set(citations) == {p["id"] for p in papers}
assert sum(p["selected"] for p in papers) == 7
assert all("Sangmin Bae" in " ".join(p["authors"]) for p in papers)
assert all("other" not in p["topics"] or p["topics"] == ["other"] for p in papers)
for p in papers:
    citation = citations[p["id"]]
    assert citation["sourceUrl"].startswith("https://")
    assert citation["bibtex"] is None or citation["bibtex"].lstrip().startswith("@")
    p["citation"] = {key: citation.get(key, "") for key in ["bibtex", "sourceUrl", "sourceLabel", "displayNote"]}
esc = html.escape

def icon(name):
    return '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"/></svg>'

def author_markup(author):
    clean = author.replace("*", "").replace("†", "")
    markers = "".join(c for c in author if c in "*†")
    text = esc(clean)
    if clean == "Sangmin Bae":
        text = "<strong>" + text + "</strong>"
    return text + ("<sup>" + markers + "</sup>" if markers else "")

def figure_html(p, css_class):
    return (
        '<a class="' + css_class + ' figure-trigger" href="assets/' + esc(p["image"]) + '" '
        'data-figure="' + p["id"] + '" aria-label="' + esc("Enlarge figure: " + p["title"]) + '">'
        '<img src="assets/' + esc(p["image"]) + '" alt="' + esc(p.get("imageAlt", "Main figure from " + p["title"])) + '" '
        'width="' + str(p["imageWidth"]) + '" height="' + str(p["imageHeight"]) + '" loading="lazy">'
        '<span class="figure-open-label">' + icon("search") + ' Enlarge figure</span></a>'
    )

def paper_html(p, selected=False):
    title = esc(p["title"])
    if p["url"]:
        title = '<a href="' + esc(p["url"]) + '" target="_blank" rel="noopener">' + title + "</a>"
    actions = ""
    for key, label in [("url", "Paper"), ("code", "Code"), ("project", "Project")]:
        if p[key]:
            actions += '<a href="' + esc(p[key]) + '" target="_blank" rel="noopener" aria-label="' + esc(label + ": " + p["title"]) + '">' + label + icon("arrow") + "</a>"
    if p["citation"]["bibtex"]:
        actions += '<button class="citation-button" data-cite="' + p["id"] + '" aria-label="' + esc("Cite: " + p["title"]) + '">Cite ' + icon("copy") + "</button>"
    else:
        actions += '<span class="citation-pending" title="' + esc(p["citation"]["displayNote"] or "Official citation not yet verified") + '">Citation pending</span>'
    thumbnail = ""
    if selected and p["image"]:
        thumbnail = figure_html(p, "paper-thumb")
    return (
        '<article class="paper-row" id="' + ("selected-pub-" if selected else "pub-") + p["id"] + '" data-paper-id="' + p["id"] + '">'
        '<div class="paper-body"><div class="paper-meta"><span class="venue-tag" title="' + esc(p["fullVenue"]) + '">' + esc(p["venue"]) + " " + str(p["year"]) + "</span>" +
        ('<span class="paper-oral">Oral presentation</span>' if p["oral"] else "") +
        '</div><h4 class="paper-title">' + title + '</h4><p class="paper-authors">' + ", ".join(author_markup(a) for a in p["authors"]) +
        '</p><div class="paper-actions">' + actions + "</div></div>" + thumbnail + "</article>"
    )

def publication_groups(selected=False):
    items = [p for p in papers if p["selected"]] if selected else papers
    groups = []
    for year in sorted({p["year"] for p in items}, reverse=True):
        group = [p for p in items if p["year"] == year]
        groups.append('<div class="publication-year" data-year="' + str(year) +
            '"><h3 class="year-heading">' + str(year) + '</h3><div class="year-papers">' +
            "".join(paper_html(p, selected) for p in group) + "</div></div>")
    return "\n".join(groups)
person = {
    "@context": "https://schema.org", "@type": "Person", "name": "Sangmin Bae",
    "url": "https://www.raymin0223.com/",
    "image": "https://www.raymin0223.com/assets/portrait.jpg",
    "jobTitle": "Postdoctoral Researcher", "affiliation": {"@type": "Organization", "name": "KAIST"},
    "alumniOf": {"@type": "CollegeOrUniversity", "name": "KAIST"},
    "email": "bsmn0223@gmail.com",
    "knowsAbout": ["Efficient machine learning", "Adaptive computation", "Efficient architectures", "Efficient post-training", "Agentic systems"],
    "sameAs": ["https://scholar.google.com/citations?user=T5rHY14AAAAJ&hl=en", "https://github.com/raymin0223", "https://www.linkedin.com/in/raymin0223", "https://twitter.com/raymin0223"]
}
template = (ROOT / "src/index.html").read_text()
# Changed assets get a new URL so browsers fetch the latest CSS and JavaScript.
for name, placeholder in [("styles.css", "__STYLES_VERSION__"), ("app.js", "__APP_VERSION__")]:
    version = hashlib.sha256((ROOT / "src" / name).read_bytes()).hexdigest()[:12]
    template = template.replace(placeholder, version)
for paper_id, placeholder in [("p2", "__OPRD_FIGURE__"), ("j2", "__HYBRID_FIGURE__"), ("c17", "__MOR_FIGURE__")]:
    paper = next(p for p in papers if p["id"] == paper_id)
    template = template.replace(placeholder, figure_html(paper, "highlight-art figure-art"))
output = template.replace("__SELECTED_PUBLICATIONS__", publication_groups(selected=True)).replace("__PUBLICATIONS__", publication_groups()).replace("__PUBLICATION_DATA__", json.dumps(papers, ensure_ascii=False).replace("</", "<\\/")).replace("__PERSON_SCHEMA__", json.dumps(person, ensure_ascii=False))
assert "__PUBLICATIONS__" not in output and "__SELECTED_PUBLICATIONS__" not in output and "__PERSON_SCHEMA__" not in output
(DIST / "index.html").write_text(output)
for name in ["styles.css", "app.js"]:
    shutil.copyfile(ROOT / "src" / name, DIST / name)
# Keep main / (root) branch publishing and the exact existing custom hostname.
# Copy only the generated site. Never delete source assets or legacy public files.
shutil.copyfile(ROOT / "CNAME", DIST / "CNAME")
(DIST / ".nojekyll").touch()
for name in ["index.html", "styles.css", "app.js", ".nojekyll"]:
    shutil.copyfile(DIST / name, ROOT / name)
shutil.copytree(DIST / "assets", ROOT / "assets", dirs_exist_ok=True)
print(f"Built {len(papers)} publications ({sum(p['selected'] for p in papers)} selected) into {DIST}")
print(f"Copied dist/ to the GitHub Pages publishing root: {ROOT}")
