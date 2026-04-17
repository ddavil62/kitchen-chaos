#!/usr/bin/env python3
"""
Phase 46: metadata.json size 필드 일괄 갱신 스크립트.

Phase 44~45 아트 리워크 후 metadata.json의 size 필드가 구 해상도로 남아있는 문제를 수정한다.
- enemies 일반 적 전종: 92x92
- bosses 일반 9종 + maharaja: 112x112
- bosses cuisine_god: 136x136
- bosses queen_of_taste (신규): 136x136
- bosses sake_oni (신규): 112x112
- chefs 3종: 92x92
- chefs yuki_chef, lao_chef (신규): 92x92

실행 전 Pillow로 rotations/south.png 실제 크기를 검증한다.
"""

import json
import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow가 설치되어 있지 않습니다. pip install Pillow")
    sys.exit(1)

# ── 경로 설정 ──
ASSETS_ROOT = Path(__file__).resolve().parent.parent / "assets"

# ── 대상 및 목표 크기 정의 ──

# 보스별 특수 크기 (나머지는 default 112x112)
BOSS_SPECIAL_SIZES = {
    "cuisine_god": (136, 136),
    "queen_of_taste": (136, 136),
}
BOSS_DEFAULT_SIZE = (112, 112)

ENEMY_DEFAULT_SIZE = (92, 92)
CHEF_DEFAULT_SIZE = (92, 92)

# metadata.json이 없는 캐릭터 (신규 생성 필요)
NEW_METADATA_TARGETS = {
    "enemies": ["macaron_knight", "sugar_specter", "sushi_ninja", "tempura_monk"],
    "bosses": ["queen_of_taste", "sake_oni"],
    "chefs": ["yuki_chef", "lao_chef"],
}

# ── 신규 metadata.json 템플릿 ──
def make_new_metadata(folder_name, width, height):
    """metadata.json이 없는 캐릭터용 최소 구조를 생성한다."""
    return {
        "character": {
            "id": "unknown",
            "name": folder_name,
            "prompt": "",
            "size": {"width": width, "height": height},
            "directions": 8,
            "view": "low top-down",
        },
        "export_version": "2.0",
        "export_date": "2026-04-17",
    }


def get_target_size(category, folder_name):
    """카테고리와 폴더명으로 목표 크기를 결정한다."""
    if category == "enemies":
        return ENEMY_DEFAULT_SIZE
    elif category == "bosses":
        return BOSS_SPECIAL_SIZES.get(folder_name, BOSS_DEFAULT_SIZE)
    elif category == "chefs":
        return CHEF_DEFAULT_SIZE
    return None


def verify_png_size(char_dir, target_w, target_h):
    """rotations/south.png 실제 크기를 읽어 목표와 비교한다."""
    south_png = char_dir / "rotations" / "south.png"
    if not south_png.exists():
        return None, None, f"south.png 없음: {south_png}"
    try:
        with Image.open(south_png) as img:
            actual_w, actual_h = img.size
        if actual_w != target_w or actual_h != target_h:
            return actual_w, actual_h, f"크기 불일치: 실제 {actual_w}x{actual_h} != 목표 {target_w}x{target_h}"
        return actual_w, actual_h, None
    except Exception as e:
        return None, None, f"이미지 읽기 실패: {e}"


def process_category(category):
    """한 카테고리(enemies/bosses/chefs)의 모든 하위 폴더를 처리한다."""
    cat_dir = ASSETS_ROOT / category
    if not cat_dir.exists():
        print(f"  [SKIP] 카테고리 디렉토리 없음: {cat_dir}")
        return 0, 0, 0

    updated = 0
    created = 0
    skipped = 0
    errors = []

    # .zip 파일과 기타 비폴더 항목 제외
    subdirs = sorted([d for d in cat_dir.iterdir() if d.is_dir()])

    new_targets = NEW_METADATA_TARGETS.get(category, [])

    for char_dir in subdirs:
        folder_name = char_dir.name
        target_size = get_target_size(category, folder_name)
        if target_size is None:
            continue
        target_w, target_h = target_size

        meta_path = char_dir / "metadata.json"

        # PNG 크기 검증
        actual_w, actual_h, err = verify_png_size(char_dir, target_w, target_h)
        if err:
            # 크기 불일치도 경고만 남기고 metadata는 목표 크기로 갱신
            if actual_w is not None:
                print(f"  [WARN] {category}/{folder_name}: {err} (목표 크기로 metadata 갱신)")
            else:
                print(f"  [WARN] {category}/{folder_name}: {err}")
                if actual_w is None:
                    # south.png 자체가 없으면 건너뛰기
                    skipped += 1
                    continue

        if meta_path.exists():
            # 기존 파일: size 필드만 갱신
            try:
                with open(meta_path, "r", encoding="utf-8") as f:
                    data = json.load(f)

                # 구 포맷 (character 키 없이 canvas_size만 있는 경우) 처리
                if "character" not in data:
                    old_size = data.get("canvas_size", "?")
                    # 구 포맷을 신 포맷으로 마이그레이션: character 블록 추가
                    data["character"] = {
                        "id": data.get("character_id", "unknown"),
                        "name": folder_name,
                        "prompt": "",
                        "size": {"width": target_w, "height": target_h},
                        "directions": 8,
                        "view": "low top-down",
                    }
                    with open(meta_path, "w", encoding="utf-8") as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                        f.write("\n")
                    print(f"  [MIG]  {category}/{folder_name}: 구 포맷(canvas_size={old_size}) -> 신 포맷 {target_w}x{target_h}")
                    updated += 1
                    continue

                old_w = data.get("character", {}).get("size", {}).get("width", "?")
                old_h = data.get("character", {}).get("size", {}).get("height", "?")

                if old_w == target_w and old_h == target_h:
                    print(f"  [OK]   {category}/{folder_name}: 이미 {target_w}x{target_h}")
                    skipped += 1
                    continue

                data["character"]["size"]["width"] = target_w
                data["character"]["size"]["height"] = target_h

                with open(meta_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                    f.write("\n")

                print(f"  [UPD]  {category}/{folder_name}: {old_w}x{old_h} -> {target_w}x{target_h}")
                updated += 1

            except Exception as e:
                print(f"  [ERR]  {category}/{folder_name}: {e}")
                errors.append(f"{category}/{folder_name}: {e}")
        else:
            # 신규 생성 (명시적 대상만)
            if folder_name in new_targets:
                new_data = make_new_metadata(folder_name, target_w, target_h)
                with open(meta_path, "w", encoding="utf-8") as f:
                    json.dump(new_data, f, indent=2, ensure_ascii=False)
                    f.write("\n")
                print(f"  [NEW]  {category}/{folder_name}: 신규 생성 ({target_w}x{target_h})")
                created += 1
            else:
                print(f"  [SKIP] {category}/{folder_name}: metadata.json 없음 (신규 생성 대상 아님)")
                skipped += 1

    return updated, created, skipped


def main():
    print("=" * 60)
    print("Phase 46: metadata.json size 필드 일괄 갱신")
    print("=" * 60)
    print(f"Assets root: {ASSETS_ROOT}")
    print()

    total_updated = 0
    total_created = 0
    total_skipped = 0

    for category in ["enemies", "bosses", "chefs"]:
        print(f"\n--- {category} ---")
        u, c, s = process_category(category)
        total_updated += u
        total_created += c
        total_skipped += s

    print(f"\n{'=' * 60}")
    print(f"완료: 갱신 {total_updated}건, 신규 생성 {total_created}건, 건너뜀 {total_skipped}건")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
