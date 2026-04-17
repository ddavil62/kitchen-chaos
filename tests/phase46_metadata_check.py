"""Phase 46 QA: metadata.json 전수 검사 스크립트.
PIL로 실제 PNG 크기를 측정하고 metadata.json의 size 필드와 비교한다.
"""
import json
import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow not installed. Run: pip install Pillow")
    sys.exit(1)

BASE = Path("C:/antigravity/kitchen-chaos/assets")

# 기대 크기 정의
EXPECTED_SIZES = {
    "enemies": {
        "__default__": (92, 92),
    },
    "bosses": {
        "__default__": (112, 112),
        "cuisine_god": (136, 136),
        "queen_of_taste": (136, 136),
    },
    "chefs": {
        "__default__": (92, 92),
    },
}

# 특수 케이스: mini_dumpling은 분열 소환 적이므로 실제 PNG가 작을 수 있음
KNOWN_EXCEPTIONS = {
    ("enemies", "mini_dumpling"): "분열 소환 적 -소형 사이즈 의도적",
}

results = []
errors = []
warnings = []


def check_category(category):
    cat_dir = BASE / category
    if not cat_dir.exists():
        errors.append(f"MISSING DIR: {cat_dir}")
        return

    expected_map = EXPECTED_SIZES.get(category, {})
    default_size = expected_map.get("__default__", None)

    for char_dir in sorted(cat_dir.iterdir()):
        if not char_dir.is_dir():
            continue
        char_name = char_dir.name

        # metadata.json 존재 확인
        meta_path = char_dir / "metadata.json"
        if not meta_path.exists():
            errors.append(f"MISSING metadata.json: {category}/{char_name}")
            continue

        # metadata.json 파싱
        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
        except json.JSONDecodeError as e:
            errors.append(f"INVALID JSON: {category}/{char_name}/metadata.json -{e}")
            continue

        # size 필드 추출
        character = meta.get("character", {})
        size = character.get("size", {})
        meta_w = size.get("width", None)
        meta_h = size.get("height", None)

        if meta_w is None or meta_h is None:
            errors.append(f"MISSING size field: {category}/{char_name}/metadata.json")
            continue

        # 기대 크기 결정
        expected = expected_map.get(char_name, default_size)

        # 기대 크기와 metadata size 비교
        if expected and (meta_w, meta_h) != expected:
            errors.append(
                f"META SIZE MISMATCH: {category}/{char_name} -"
                f"metadata=({meta_w}x{meta_h}), expected=({expected[0]}x{expected[1]})"
            )

        # 실제 south.png 크기 확인
        south_png = char_dir / "south.png"
        if not south_png.exists():
            # rotations 폴더 확인
            south_png = char_dir / "rotations" / "south.png"

        if south_png.exists():
            try:
                with Image.open(south_png) as img:
                    actual_w, actual_h = img.size
            except Exception as e:
                errors.append(f"CANNOT READ PNG: {category}/{char_name}/south.png -{e}")
                continue

            # metadata size와 실제 PNG 크기 비교
            if (meta_w, meta_h) != (actual_w, actual_h):
                key = (category, char_name)
                if key in KNOWN_EXCEPTIONS:
                    warnings.append(
                        f"KNOWN EXCEPTION: {category}/{char_name} -"
                        f"metadata=({meta_w}x{meta_h}), actual=({actual_w}x{actual_h}) -"
                        f"{KNOWN_EXCEPTIONS[key]}"
                    )
                else:
                    errors.append(
                        f"PNG SIZE MISMATCH: {category}/{char_name} -"
                        f"metadata=({meta_w}x{meta_h}), actual_png=({actual_w}x{actual_h})"
                    )
            else:
                results.append(f"OK: {category}/{char_name} -({meta_w}x{meta_h})")
        else:
            warnings.append(f"NO south.png: {category}/{char_name}")
            results.append(f"OK (meta only): {category}/{char_name} -({meta_w}x{meta_h})")


# 특별 확인 대상
SPECIAL_CHARS = {
    ("bosses", "queen_of_taste"): (136, 136),
    ("bosses", "cuisine_god"): (136, 136),
    ("bosses", "sake_oni"): (112, 112),
    ("chefs", "yuki_chef"): (92, 92),
    ("chefs", "lao_chef"): (92, 92),
}


def check_special():
    """신규 생성 확인 대상의 metadata.json 존재 및 크기 확인."""
    print("\n=== SPECIAL CHARACTER CHECK ===")
    for (cat, name), (exp_w, exp_h) in SPECIAL_CHARS.items():
        meta_path = BASE / cat / name / "metadata.json"
        if not meta_path.exists():
            errors.append(f"SPECIAL MISSING: {cat}/{name}/metadata.json NOT FOUND")
            print(f"  FAIL: {cat}/{name} -metadata.json 없음")
            continue

        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)

        character = meta.get("character", {})
        size = character.get("size", {})
        w = size.get("width")
        h = size.get("height")

        if (w, h) == (exp_w, exp_h):
            print(f"  PASS: {cat}/{name} -({w}x{h}) matches expected ({exp_w}x{exp_h})")
        else:
            errors.append(f"SPECIAL SIZE MISMATCH: {cat}/{name} -got ({w}x{h}), expected ({exp_w}x{exp_h})")
            print(f"  FAIL: {cat}/{name} -got ({w}x{h}), expected ({exp_w}x{exp_h})")


if __name__ == "__main__":
    print("=== Phase 46 metadata.json Validation ===\n")

    for cat in ["enemies", "bosses", "chefs"]:
        print(f"\n--- {cat.upper()} ---")
        check_category(cat)

    check_special()

    # 집계
    print(f"\n\n=== SUMMARY ===")
    print(f"OK:       {len(results)}")
    print(f"Warnings: {len(warnings)}")
    print(f"Errors:   {len(errors)}")

    if warnings:
        print("\n--- WARNINGS ---")
        for w in warnings:
            print(f"  {w}")

    if errors:
        print("\n--- ERRORS ---")
        for e in errors:
            print(f"  {e}")
        sys.exit(1)
    else:
        print("\nAll checks PASSED.")
        sys.exit(0)
