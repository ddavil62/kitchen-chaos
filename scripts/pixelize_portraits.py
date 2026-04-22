"""
Phase 62-2 — Portrait Pixelization (단기 임시처리)

AD 리포트 FIX-10: 고해상도 애니메 일러스트 포트레이트 8종이 픽셀 UI와 스타일 충돌하는 문제.
Phase 64 pro 재발주 전까지의 단기 해결책으로, nearest-neighbor 리샘플링으로
픽셀화된 버전을 생성한다.

알고리즘:
- 512×512 원본 → 128×128 nearest 다운샘플 (가상 4×4 픽셀 효과)
- 128×128 → 512×512 nearest 업샘플
- 알파 채널을 128 기준으로 이진화하여 가장자리 정리

입력: assets/portraits/portrait_*.png (8종)
출력: 같은 경로에 덮어쓰기. 원본은 _archive/pre_pixelize_20260422/ 에 백업.
"""

from __future__ import annotations

import shutil
import sys
from datetime import datetime
from pathlib import Path

from PIL import Image

# 8종 캐릭터 (mimi/rin/mage/yuki/lao/andre/arjun/poco)
PORTRAIT_IDS = ["mimi", "rin", "mage", "yuki", "lao", "andre", "arjun", "poco"]

# 다운샘플 타깃 — 128이면 ×4 픽셀, 96이면 더 거칠게, 160이면 부드럽게
# 96은 chef_sprite 92px 해상도와 유사하여 픽셀 UI와 매칭도 최상 (샘플 비교 결과)
DOWNSCALE = 96
ALPHA_THRESHOLD = 128


def pixelize(src: Path, dst: Path) -> None:
    """단일 포트레이트를 픽셀화한다."""
    with Image.open(src) as im:
        im = im.convert("RGBA")
        w, h = im.size

        # 다운샘플 (nearest) — 세부 표현 압축
        small = im.resize((DOWNSCALE, DOWNSCALE), Image.NEAREST)
        # 업샘플 (nearest) — 선명한 픽셀 블록
        large = small.resize((w, h), Image.NEAREST)

        # 알파 이진화 — 반투명 안티에일리어스 제거
        r, g, b, a = large.split()
        a = a.point(lambda v: 255 if v >= ALPHA_THRESHOLD else 0)
        out = Image.merge("RGBA", (r, g, b, a))
        out.save(dst, "PNG")


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    portraits_dir = root / "assets" / "portraits"
    if not portraits_dir.exists():
        print(f"[ERROR] {portraits_dir} not found", file=sys.stderr)
        return 1

    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = portraits_dir / "_archive" / f"pre_pixelize_{stamp}"
    backup_dir.mkdir(parents=True, exist_ok=True)

    ok = 0
    for pid in PORTRAIT_IDS:
        src = portraits_dir / f"portrait_{pid}.png"
        if not src.exists():
            print(f"[SKIP] {src.name} missing")
            continue
        shutil.copy2(src, backup_dir / src.name)
        pixelize(src, src)
        print(f"[OK] portrait_{pid}.png pixelized ({DOWNSCALE}px virtual)")
        ok += 1

    print(f"\n{ok}/{len(PORTRAIT_IDS)} portraits pixelized.")
    print(f"Originals backed up to: {backup_dir}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
