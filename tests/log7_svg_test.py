"""Validate that engineering log 007 diagrams are safe, well-formed, standalone SVG."""

from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
IMAGES = (
    "compiler-architecture.svg",
    "incremental-invalidation.svg",
    "wasm-profiles.svg",
)
NS = "{http://www.w3.org/2000/svg}"

for name in IMAGES:
    path = ROOT / "public" / "logs" / "7" / name
    root = ET.parse(path).getroot()
    assert root.tag == f"{NS}svg", f"{name}: incorrect SVG namespace"
    assert root.attrib.get("role") == "img", f"{name}: missing image role"
    assert root.attrib.get("viewBox"), f"{name}: missing viewBox"
    titles = root.findall(f"{NS}title")
    descriptions = root.findall(f"{NS}desc")
    assert len(titles) == 1 and (titles[0].text or "").strip(), f"{name}: missing title"
    assert len(descriptions) == 1 and (descriptions[0].text or "").strip(), f"{name}: missing description"

    for element in root.iter():
        local = element.tag.rpartition("}")[2]
        assert local not in {"script", "foreignObject", "image", "iframe", "animate", "set"}, (
            f"{name}: unexpected embedded element {local}"
        )
        for key, value in element.attrib.items():
            attr = key.rpartition("}")[2].lower()
            assert not attr.startswith("on"), f"{name}: event handler {attr}"
            assert attr not in {"href", "src"}, f"{name}: external reference {attr}"
            assert "url(" not in value.lower(), f"{name}: unsupported external paint reference"

    print(f"PASS {name}: valid, accessible, self-contained SVG")
