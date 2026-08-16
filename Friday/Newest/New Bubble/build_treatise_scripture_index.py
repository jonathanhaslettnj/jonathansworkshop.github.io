import re
from bs4 import BeautifulSoup

# Matches anchor IDs like: ref_John_6_28
ANCHOR_REGEX = re.compile(r'^ref_([A-Za-z]+)_(\d+)_(\d+)$')

def build_index(input_html, output_html):
    with open(input_html, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")

    index = {}

    for tag in soup.find_all("a", class_="scripture-ref"):
        anchor_id = tag.get("id", "")
        match = ANCHOR_REGEX.match(anchor_id)
        if not match:
            continue

        book, chapter, verse = match.groups()
        chapter = int(chapter)
        verse = int(verse)

        index.setdefault(book, {})
        index[book].setdefault(chapter, [])
        index[book][chapter].append(verse)

    # Build HTML
    html = ["<html><head><title>Scripture Index</title></head><body>"]
    html.append("<h1>Scripture Index for Treatise on Good Works</h1>")

    for book in sorted(index.keys()):
        html.append(f"<h2>{book}</h2>")
        for chapter in sorted(index[book].keys()):
            html.append(f"<h3>Chapter {chapter}</h3>")
            html.append("<ul>")
            for verse in sorted(index[book][chapter]):
                anchor = f"ref_{book}_{chapter}_{verse}"
                html.append(
                    f'<li><a href="TreatiseOnGoodWorks_anchored.html#{anchor}">'
                    f'{book} {chapter}:{verse}</a></li>'
                )
            html.append("</ul>")

    html.append("</body></html>")

    with open(output_html, "w", encoding="utf-8") as f:
        f.write("\n".join(html))

    print(f"Created {output_html}")

if __name__ == "__main__":
    build_index(
        "TreatiseOnGoodWorks_anchored.html",
        "TreatiseOnGoodWorks_scripture_index.html"
    )
