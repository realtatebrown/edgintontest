"""Refresh the homepage index using public post metadata from Steven's publication."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from email.utils import parsedate_to_datetime
from html import escape
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

BASE = "https://www.stevenedginton.com"
PAGE = Path(__file__).resolve().parents[1] / "dist" / "index.html"
BEGIN = "<!-- publication index starts -->"
END = "<!-- publication index ends -->"


def fetch(url):
    with urlopen(Request(url, headers={"User-Agent": "EDGINTON publication index/1.0"}), timeout=25) as response:
        return response.read()


class Head(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta = {}

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == "meta" and "property" in data:
            self.meta[data["property"]] = data.get("content", "")


def collect():
    sitemap = ET.fromstring(fetch(BASE + "/sitemap.xml"))
    urls = list(dict.fromkeys(node.text for node in sitemap.findall("./{*}url/{*}loc")
                              if node.text and re.fullmatch(re.escape(BASE) + r"/p/[a-zA-Z0-9_-]+", node.text)))
    if not urls:
        raise ValueError("Publication sitemap returned no posts")
    recent = {}
    try:
        for item in ET.fromstring(fetch(BASE + "/feed")).findall("./channel/item"):
            recent[item.findtext("link")] = (item.findtext("title"), parsedate_to_datetime(item.findtext("pubDate")).date())
    except (OSError, ET.ParseError):
        pass

    def post(url):
        if url in recent:
            title, date = recent[url]
        else:
            parser = Head()
            parser.feed(fetch(url).decode("utf-8").partition("</head>")[0])
            title = parser.meta["og:title"]
            published = parser.meta.get("article:published_time")
            date = datetime.fromisoformat(published.replace("Z", "+00:00")).date() if published else None
        return date, title, url

    with ThreadPoolExecutor(max_workers=4) as pool:
        return list(pool.map(post, urls))


def render(posts):
    def entries(items):
        return '<ul class="post-list">\n' + '\n'.join(
            (f'<li><time datetime="{date}">{date.day} {date:%b %Y}</time> ' if date else '<li class="undated">')
            + f'<a href="{escape(url, quote=True)}">{escape(title)}</a></li>'
            for date, title, url in items) + '\n</ul>'
    result = entries(posts[:4])
    if len(posts) > 4:
        result += f'\n<details><summary>Earlier posts ({len(posts) - 4})</summary>\n{entries(posts[4:])}\n</details>'
    return result


if __name__ == "__main__":
    source = PAGE.read_text()
    before, marker, rest = source.partition(BEGIN)
    _, end, after = rest.partition(END)
    if not marker or not end:
        raise ValueError("Missing publication index markers")
    posts = collect()
    updated = before + BEGIN + "\n" + render(posts) + "\n" + END + after
    temporary = PAGE.with_suffix(".html.tmp")
    temporary.write_text(updated)
    temporary.replace(PAGE)
    print(f"Indexed {len(posts)} public post listings.")
