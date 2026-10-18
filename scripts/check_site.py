"""Check the files actually published by GitHub Pages (standard library only)."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
        self.canonical = []
        self.meta = {}
        self.filters = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "select":
            self.filters.append(attrs.get("id"))
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical.append(attrs["href"])
        if tag == "meta":
            self.meta[attrs.get("property", attrs.get("name"))] = attrs.get("content")
        self.links.extend(attrs[key] for key in ("href", "src") if attrs.get(key))


def check_site():
    dist = ROOT / "dist"
    for source in dist.rglob("*"):
        if source.is_file():
            target = ROOT / source.relative_to(dist)
            assert target.is_file(), f"Missing published file: {target}"
            assert source.read_bytes() == target.read_bytes(), f"Rebuild stale file: {target}"
    assert (ROOT / ".nojekyll").is_file(), "Missing .nojekyll"
    canonical = "https://" + (ROOT / "CNAME").read_text().strip() + "/"
    markup = (ROOT / "index.html").read_text()
    assert "chatgpt.site" not in markup, "Stale Site metadata URL"
    page = Page()
    page.feed(markup)
    assert len(page.ids) == len(set(page.ids)), "Duplicate HTML IDs"
    assert page.canonical == [canonical], "Canonical URL disagrees with CNAME"
    assert page.meta["og:url"] == canonical
    assert page.meta["og:image"] == canonical + "assets/portrait.jpg"
    schema = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', markup, re.S)[1])
    assert schema["url"] == canonical
    assert schema["image"] == page.meta["og:image"]
    assert page.filters == ["type-filter", "topic-filter", "year-filter"]
    for anchor in ("education", "publications", "patents", "awards", "experience", "projects", "services"):
        assert anchor in page.ids, f"Missing legacy bookmark: #{anchor}"
    local_links = 0
    for link in page.links:
        url = urlsplit(link)
        if url.scheme or url.netloc:
            continue
        if url.path:
            assert (ROOT / unquote(url.path).lstrip("/")).is_file(), f"Broken local URL: {link}"
            local_links += 1
        elif url.fragment:
            assert unquote(url.fragment) in page.ids, f"Broken fragment: {link}"
    for asset in re.findall(r"url\(['\"]?([^)'\"]+)", (ROOT / "styles.css").read_text()):
        assert (ROOT / asset).is_file(), f"Missing CSS asset: {asset}"
    papers = json.loads((ROOT / "content/publications.json").read_text())
    assert sum(i.startswith("pub-") for i in page.ids) == len(papers)
    assert sum(i.startswith("selected-pub-") for i in page.ids) == sum(p["selected"] for p in papers)
    assert (ROOT / "assets/Sangmin_Bae_CV.pdf").read_bytes().startswith(b"%PDF-")
    print(f"OK: root matches dist; {len(papers)} publications; {local_links} local links; fonts, CV, metadata, legacy anchors.")


if __name__ == "__main__":
    check_site()
