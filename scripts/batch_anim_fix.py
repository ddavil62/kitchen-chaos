#!/usr/bin/env python3
"""
Phase 58: 19개 몬스터 walk/death 애니메이션 92px 리뉴얼 추적 스크립트.
PixelLab ZIP을 받으면 이 스크립트로 자동 추출+복사+해시 파악.

사용법:
  python3 scripts/batch_anim_fix.py <enemy_id> <zip_path> [walk|death]
"""
import sys, os, zipfile, shutil
from PIL import Image

ENEMIES_ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'enemies')

def process_zip(enemy_id, zip_path, anim_type):
    out_dir = f'/tmp/anim_fix_{enemy_id}_{anim_type}'
    os.makedirs(out_dir, exist_ok=True)

    with zipfile.ZipFile(zip_path) as zf:
        zf.extractall(out_dir)

    anim_dir = os.path.join(out_dir, 'animations')
    if not os.path.exists(anim_dir):
        print(f'ERROR: animations/ not found in ZIP for {enemy_id}')
        sys.exit(1)

    # 해당 타입의 해시 폴더 찾기
    found_hash = None
    for h in os.listdir(anim_dir):
        if anim_type == 'walk' and ('walking' in h or 'animating' in h):
            found_hash = h
        elif anim_type == 'death' and 'falling' in h:
            found_hash = h

    if not found_hash:
        print(f'ERROR: {anim_type} hash folder not found for {enemy_id}')
        print(f'  Available: {os.listdir(anim_dir)}')
        sys.exit(1)

    # 크기 확인
    src = os.path.join(anim_dir, found_hash, 'south', 'frame_000.png')
    if os.path.exists(src):
        size = Image.open(src).size
        print(f'[{enemy_id}] {anim_type} hash: {found_hash}  size: {size}')
    else:
        print(f'[{enemy_id}] {anim_type} hash: {found_hash}  (no south/frame_000 to check)')

    # 복사
    dst_anim = os.path.join(ENEMIES_ROOT, enemy_id, 'animations')
    dst = os.path.join(dst_anim, found_hash)
    if os.path.exists(dst):
        print(f'  Already exists: {dst}')
    else:
        shutil.copytree(os.path.join(anim_dir, found_hash), dst)
        print(f'  Copied to: {dst}')

    print(f'  => Update SpriteLoader ENEMY_{anim_type.upper()}_HASHES["{enemy_id}"] = "{found_hash}"')
    return found_hash

if __name__ == '__main__':
    if len(sys.argv) < 4:
        print('Usage: python3 batch_anim_fix.py <enemy_id> <zip_path> <walk|death>')
        sys.exit(1)
    enemy_id, zip_path, anim_type = sys.argv[1], sys.argv[2], sys.argv[3]
    process_zip(enemy_id, zip_path, anim_type)
