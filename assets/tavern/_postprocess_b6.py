"""
Phase B-6 에셋 후처리 스크립트.
PixelLab size=48 캐릭터 15명의 ZIP을 다운로드하고, 32x48 캔버스로 후처리한다.

사용법: python _postprocess_b6.py
입력: PixelLab API (https://api.pixellab.ai/mcp/characters/{id}/download)
출력: 부모 디렉토리(tavern/)에 최종 에셋 PNG 파일

후처리 전략:
  - 정지 프레임 (seated/idle): raw 68x68 -> resize((32, 32), NEAREST) -> 32x48 캔버스 y=8
  - Walk 시트 (4프레임): 각 프레임 raw 68x68 -> resize((32, 32), NEAREST) -> 32x48 셀 -> 128x48 가로 결합

Manifest (15 characters, 55 output files):
  손님 10종: normal/vip/gourmet/rushed/group/critic/regular/student/traveler/business
  셰프 5명: mage/yuki/lao/andre/arjun
"""

from PIL import Image
import os
import sys
import urllib.request
import zipfile
import tempfile
import shutil
import json

TAVERN_DIR = os.path.dirname(os.path.abspath(__file__))
ZIP_DIR = os.path.join(TAVERN_DIR, '.zips-b6')
os.makedirs(ZIP_DIR, exist_ok=True)

# ── 캔버스 규격 ──
CANVAS_W = 32
CANVAS_H = 48
CHAR_SIZE = 32   # resize 타겟 (정사각)
Y_OFFSET = 8     # 캔버스 상단 여백 (캐릭터를 하단 정렬)

# ── 손님 10종 character_id (size=48, B-6) ──
CUSTOMER_CHARACTERS = {
    'normal':   '67dbef8e-4985-47e2-b5aa-75f4750d9020',
    'vip':      '633772df-5076-4f5a-b262-3af68e31cebc',
    'gourmet':  'b65f4421-064d-4c81-8fdc-c2fc85ec9ab6',
    'rushed':   '24699eec-148a-4656-adb4-8e2af2940285',
    'group':    '15732555-79bc-414a-acc0-4bf76209e206',
    'critic':   '756e8ad5-6fe3-4fac-8586-75ec7504736d',
    'regular':  'fda0e32c-cb81-4b0d-9dc4-e859ec6b65a9',
    'student':  'fa96eca1-ece4-4036-ae48-c3301a1cd860',
    'traveler': 'c47f1960-6d41-4ba5-8a86-f8f861026896',
    'business': 'f7acbad0-0442-4dd2-bfcd-ea7244ad9641',
}

# ── 셰프 5명 character_id (size=48, B-6) ──
CHEF_CHARACTERS = {
    'mage':  'c5f1008b-132d-4633-85f0-7990417ec4d5',
    'yuki':  '76832491-e77d-41d5-a582-303c81cb5a06',
    'lao':   '1ea0950e-bd1a-4c3a-ac8e-e6dc563d2c1c',
    'andre': '5584b6fa-4b3b-4d1f-9285-bdc454f2dc8d',
    'arjun': '9b70e140-4a4b-4fb6-9344-79c86377c166',
}


def download_zip(character_id):
    """PixelLab에서 character ZIP을 다운로드한다."""
    zip_path = os.path.join(ZIP_DIR, f'{character_id}.zip')
    if os.path.exists(zip_path) and os.path.getsize(zip_path) > 1024:
        print(f'  ZIP cached: {character_id} ({os.path.getsize(zip_path)} bytes)')
        return zip_path

    url = f'https://api.pixellab.ai/mcp/characters/{character_id}/download'
    print(f'  Downloading {character_id}...')
    urllib.request.urlretrieve(url, zip_path)
    size = os.path.getsize(zip_path)
    if size < 1024:
        raise RuntimeError(f'ZIP too small: {size} bytes for {character_id}')
    print(f'  Downloaded: {size} bytes')
    return zip_path


def extract_zip(zip_path, character_id):
    """ZIP을 임시 디렉토리에 추출한다."""
    extract_dir = os.path.join(ZIP_DIR, f'_extract_{character_id}')
    if os.path.exists(extract_dir):
        shutil.rmtree(extract_dir)
    os.makedirs(extract_dir)
    with zipfile.ZipFile(zip_path) as zf:
        zf.extractall(extract_dir)
    return extract_dir


def list_dir_tree(path, prefix=''):
    """디렉토리 트리를 출력한다."""
    for root, dirs, files in os.walk(path):
        level = root.replace(path, '').count(os.sep)
        indent = '  ' * (level + 1)
        subdir = os.path.basename(root)
        if level > 0:
            print(f'{prefix}{indent}{subdir}/')
        for f in sorted(files):
            print(f'{prefix}{indent}  {f}')


def find_rotation(extract_dir, direction):
    """rotations/{direction}.png 경로를 찾는다."""
    # 패턴 1: rotations/{direction}.png
    rotation_path = os.path.join(extract_dir, 'rotations', f'{direction}.png')
    if os.path.exists(rotation_path):
        return rotation_path
    # 패턴 2: 디렉토리 내 탐색
    for root, dirs, files in os.walk(extract_dir):
        for f in files:
            if f.lower() == f'{direction}.png' and 'rotation' in root.lower():
                return os.path.join(root, f)
    return None


def find_animation_frames(extract_dir, direction):
    """walking 애니메이션 프레임을 동적으로 탐색한다."""
    frames = []
    anim_dir = os.path.join(extract_dir, 'animations')
    if not os.path.exists(anim_dir):
        return frames

    # 패턴 1: animations/{anim_name}/{direction}/ 하위 프레임
    for anim_name in os.listdir(anim_dir):
        anim_path = os.path.join(anim_dir, anim_name)
        if not os.path.isdir(anim_path):
            continue
        dir_path = os.path.join(anim_path, direction)
        if os.path.isdir(dir_path):
            png_files = sorted([f for f in os.listdir(dir_path) if f.endswith('.png')])
            frames = [os.path.join(dir_path, f) for f in png_files]
            if frames:
                return frames

    # 패턴 2: animations/ 하위 직접
    png_files = sorted([f for f in os.listdir(anim_dir)
                       if f.endswith('.png') and direction in f])
    if png_files:
        return [os.path.join(anim_dir, f) for f in png_files]

    return frames


def process_static(raw_img):
    """정지 프레임 1장 처리: raw -> resize((32,32), NEAREST) -> 32x48 캔버스 y=8."""
    char = raw_img.resize((CHAR_SIZE, CHAR_SIZE), Image.NEAREST)
    canvas = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    canvas.paste(char, (0, Y_OFFSET), char)
    return canvas  # 32x48


def process_walk_sheet(frame_paths):
    """4프레임 -> 128x48 RGBA 가로 결합."""
    sheet = Image.new('RGBA', (CANVAS_W * 4, CANVAS_H), (0, 0, 0, 0))
    for i, fp in enumerate(frame_paths[:4]):
        raw = Image.open(fp).convert('RGBA')
        cell = process_static(raw)
        sheet.paste(cell, (i * CANVAS_W, 0), cell)
    return sheet  # 128x48


def count_opaque(img):
    """불투명 픽셀 수를 세어 반환한다."""
    return sum(1 for p in img.getdata() if p[3] > 0)


def process_customer(ctype, character_id, results):
    """손님 1명: seated_r, seated_l, walk_r, walk_l (4장)."""
    print(f'\n=== Customer: {ctype} ({character_id}) ===')

    zip_path = download_zip(character_id)
    extract_dir = extract_zip(zip_path, character_id)
    list_dir_tree(extract_dir, '  ')

    # ── seated (east -> r, west -> l) ──
    for direction, suffix in [('east', 'seated_r'), ('west', 'seated_l')]:
        rotation_path = find_rotation(extract_dir, direction)
        out_name = f'customer_{ctype}_{suffix}.png'
        out_path = os.path.join(TAVERN_DIR, out_name)

        if rotation_path:
            raw = Image.open(rotation_path).convert('RGBA')
            result = process_static(raw)
            result.save(out_path)
            w, h = result.size
            opaque = count_opaque(result)
            status = 'PASS' if w == CANVAS_W and h == CANVAS_H else 'FAIL'
            print(f'  {out_name}: {w}x{h}, opaque={opaque} -- {status}')
            results.append({'file': out_name, 'size': f'{w}x{h}', 'opaque': opaque, 'status': status})
        else:
            print(f'  ERROR: No {direction} rotation for {ctype}')
            results.append({'file': out_name, 'size': 'N/A', 'opaque': 0, 'status': 'FAIL (no source)'})

    # ── walk (east -> walk_r, west -> walk_l) ──
    for direction, suffix in [('east', 'walk_r'), ('west', 'walk_l')]:
        frames = find_animation_frames(extract_dir, direction)
        out_name = f'customer_{ctype}_{suffix}.png'
        out_path = os.path.join(TAVERN_DIR, out_name)

        if len(frames) >= 4:
            sheet = process_walk_sheet(frames)
            sheet.save(out_path)
            w, h = sheet.size
            opaque = count_opaque(sheet)
            status = 'PASS' if w == CANVAS_W * 4 and h == CANVAS_H else 'FAIL'
            print(f'  {out_name}: {w}x{h}, opaque={opaque} -- {status}')
            results.append({'file': out_name, 'size': f'{w}x{h}', 'opaque': opaque, 'status': status})
        else:
            print(f'  WARNING: Only {len(frames)} frames for {direction}')
            # fallback: rotation 이미지로 4프레임 생성
            rotation_path = find_rotation(extract_dir, direction)
            if rotation_path:
                raw = Image.open(rotation_path).convert('RGBA')
                base = process_static(raw)
                sheet = Image.new('RGBA', (CANVAS_W * 4, CANVAS_H), (0, 0, 0, 0))
                for fi in range(4):
                    if fi % 2 == 0:
                        sheet.paste(base, (fi * CANVAS_W, 0), base)
                    else:
                        shifted = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
                        shifted.paste(base, (0, -1), base)
                        sheet.paste(shifted, (fi * CANVAS_W, 0), shifted)
                sheet.save(out_path)
                w, h = sheet.size
                opaque = count_opaque(sheet)
                status = 'PASS' if w == CANVAS_W * 4 and h == CANVAS_H else 'FAIL'
                print(f'  {out_name}: {w}x{h}, opaque={opaque} -- {status} (rotation fallback)')
                results.append({'file': out_name, 'size': f'{w}x{h}', 'opaque': opaque, 'status': f'{status} (rotation fallback)'})
            else:
                print(f'  ERROR: No source for {direction} walk')
                results.append({'file': out_name, 'size': 'N/A', 'opaque': 0, 'status': 'FAIL (no source)'})


def process_chef(name, character_id, results):
    """셰프 1명: idle_side, walk_r, walk_l (3장)."""
    print(f'\n=== Chef: {name} ({character_id}) ===')

    zip_path = download_zip(character_id)
    extract_dir = extract_zip(zip_path, character_id)
    list_dir_tree(extract_dir, '  ')

    # ── idle_side (east rotation) ──
    rotation_path = find_rotation(extract_dir, 'east')
    out_name = f'chef_{name}_idle_side.png'
    out_path = os.path.join(TAVERN_DIR, out_name)

    if rotation_path:
        raw = Image.open(rotation_path).convert('RGBA')
        result = process_static(raw)
        result.save(out_path)
        w, h = result.size
        opaque = count_opaque(result)
        status = 'PASS' if w == CANVAS_W and h == CANVAS_H else 'FAIL'
        print(f'  {out_name}: {w}x{h}, opaque={opaque} -- {status}')
        results.append({'file': out_name, 'size': f'{w}x{h}', 'opaque': opaque, 'status': status})
    else:
        print(f'  ERROR: No east rotation for {name}')
        results.append({'file': out_name, 'size': 'N/A', 'opaque': 0, 'status': 'FAIL (no source)'})

    # ── walk (east -> walk_r, west -> walk_l) ──
    for direction, suffix in [('east', 'walk_r'), ('west', 'walk_l')]:
        frames = find_animation_frames(extract_dir, direction)
        out_name = f'chef_{name}_{suffix}.png'
        out_path = os.path.join(TAVERN_DIR, out_name)

        if len(frames) >= 4:
            sheet = process_walk_sheet(frames)
            sheet.save(out_path)
            w, h = sheet.size
            opaque = count_opaque(sheet)
            status = 'PASS' if w == CANVAS_W * 4 and h == CANVAS_H else 'FAIL'
            print(f'  {out_name}: {w}x{h}, opaque={opaque} -- {status}')
            results.append({'file': out_name, 'size': f'{w}x{h}', 'opaque': opaque, 'status': status})
        else:
            print(f'  WARNING: Only {len(frames)} frames for {direction}')
            rotation_path = find_rotation(extract_dir, direction)
            if rotation_path:
                raw = Image.open(rotation_path).convert('RGBA')
                base = process_static(raw)
                sheet = Image.new('RGBA', (CANVAS_W * 4, CANVAS_H), (0, 0, 0, 0))
                for fi in range(4):
                    if fi % 2 == 0:
                        sheet.paste(base, (fi * CANVAS_W, 0), base)
                    else:
                        shifted = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
                        shifted.paste(base, (0, -1), base)
                        sheet.paste(shifted, (fi * CANVAS_W, 0), shifted)
                sheet.save(out_path)
                w, h = sheet.size
                opaque = count_opaque(sheet)
                status = 'PASS' if w == CANVAS_W * 4 and h == CANVAS_H else 'FAIL'
                print(f'  {out_name}: {w}x{h}, opaque={opaque} -- {status} (rotation fallback)')
                results.append({'file': out_name, 'size': f'{w}x{h}', 'opaque': opaque, 'status': f'{status} (rotation fallback)'})
            else:
                print(f'  ERROR: No source for {direction} walk')
                results.append({'file': out_name, 'size': 'N/A', 'opaque': 0, 'status': 'FAIL (no source)'})


if __name__ == '__main__':
    results = []

    print('=' * 60)
    print('Phase B-6 Post-Processing (size=48 -> 32x48 canvas)')
    print('=' * 60)

    # Step 1: 손님 10종 (seated + walk = 40장)
    for ctype, cid in CUSTOMER_CHARACTERS.items():
        process_customer(ctype, cid, results)

    # Step 2: 셰프 5명 (idle_side + walk = 15장)
    for name, cid in CHEF_CHARACTERS.items():
        process_chef(name, cid, results)

    # 결과 요약
    print('\n' + '=' * 60)
    print('SUMMARY')
    print('=' * 60)
    pass_count = sum(1 for r in results if 'PASS' in r['status'])
    fail_count = sum(1 for r in results if 'FAIL' in r['status'])

    for r in results:
        print(f"  {r['file']}: {r['size']}, opaque={r['opaque']}, status={r['status']}")

    print(f'\nTotal: {len(results)} files')
    print(f'PASS: {pass_count}, FAIL: {fail_count}')

    # JSON 결과 저장
    report_path = os.path.join(ZIP_DIR, 'b6_results.json')
    with open(report_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f'\nResults saved to: {report_path}')
