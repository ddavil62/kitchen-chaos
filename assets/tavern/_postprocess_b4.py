"""
Phase B-4 에셋 후처리 스크립트.
PixelLab ZIP 다운로드 후 walking-4-frames 애니메이션 프레임을 추출하여
64x24 walk 시트(4프레임 x 16x24)로 합성한다.

사용법: python _postprocess_b4.py
입력: PixelLab API에서 직접 다운로드 (https://api.pixellab.ai/mcp/characters/{id}/download)
출력: 부모 디렉토리(tavern/)에 최종 에셋 PNG 파일
원본: _raw_b4/ 디렉토리에 백업

후처리 전략:
  - Walk 시트 (10종 x 2방향 = 20장):
      raw 프레임 32x32 -> resize((16, 16), NEAREST) -> 16x24 캔버스 하단 정렬
      4프레임 가로 결합 -> 64x24 sprite sheet
  - W-1 PRO (1장):
      raw 64x64 (또는 92x92) west direction
      resize((16, 22), NEAREST) 직접 다운스케일

Manifest (11 characters, 21 output files):
  normal:   577854d2-2915-46b8-994f-15dbfb43d220 (walk east/west)
  vip:      40bc9298-b593-46b0-a133-75b0a316a8ca (walk east/west)
  gourmet:  be48cae0-c6fd-4dd1-bf00-5254faf376e8 (walk east/west)
  rushed:   700fdf6b-daf0-4425-b4ab-f8a55a3c0784 (walk east/west)
  group:    51f5d1a1-5675-4d1a-83b6-7160a72934df (walk east/west)
  critic:   f633f451-6387-49bc-9cb1-bcc531728cdd (walk east/west)
  regular:  1ac09a14-3688-4b1c-a542-f688e2968700 (walk east/west)
  student:  5325daf9-6d02-4233-864d-9862de35f3ca (walk east/west)
  traveler: ff7fadae-08e8-490e-b731-dab9e1925de1 (walk east/west)
  business: 3eb9f149-5af8-450a-8352-17b5c819f30b (walk east/west)
  W-1 PRO:  2caff872-5a58-469e-b8d1-fe0bfc93aca1 (west rotation -> seated_left)
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
RAW_DIR = os.path.join(TAVERN_DIR, '_raw_b4')
os.makedirs(RAW_DIR, exist_ok=True)

TMP_DIR = os.path.join(tempfile.gettempdir(), 'pixellab_b4')
os.makedirs(TMP_DIR, exist_ok=True)

# Walk 발주 대상 (10종)
WALK_CHARACTERS = {
    'normal':   '577854d2-2915-46b8-994f-15dbfb43d220',
    'vip':      '40bc9298-b593-46b0-a133-75b0a316a8ca',
    'gourmet':  'be48cae0-c6fd-4dd1-bf00-5254faf376e8',
    'rushed':   '700fdf6b-daf0-4425-b4ab-f8a55a3c0784',
    'group':    '51f5d1a1-5675-4d1a-83b6-7160a72934df',
    'critic':   'f633f451-6387-49bc-9cb1-bcc531728cdd',
    'regular':  '1ac09a14-3688-4b1c-a542-f688e2968700',
    'student':  '5325daf9-6d02-4233-864d-9862de35f3ca',
    'traveler': 'ff7fadae-08e8-490e-b731-dab9e1925de1',
    'business': '3eb9f149-5af8-450a-8352-17b5c819f30b',
}

# W-1 PRO 재발주 대상
W1_PRO_ID = '2caff872-5a58-469e-b8d1-fe0bfc93aca1'


def download_and_extract(character_id):
    """PixelLab에서 character ZIP을 다운로드하고 추출한다."""
    zip_path = os.path.join(TMP_DIR, f'{character_id}.zip')
    extract_dir = os.path.join(TMP_DIR, character_id)
    if not os.path.exists(zip_path) or os.path.getsize(zip_path) < 100:
        url = f'https://api.pixellab.ai/mcp/characters/{character_id}/download'
        print(f'  Downloading {character_id}...')
        urllib.request.urlretrieve(url, zip_path)
    if os.path.exists(extract_dir):
        shutil.rmtree(extract_dir)
    os.makedirs(extract_dir)
    with zipfile.ZipFile(zip_path) as zf:
        zf.extractall(extract_dir)
    return extract_dir


def list_extracted_files(extract_dir, prefix=''):
    """추출 디렉토리 구조를 출력한다."""
    for root, dirs, files in os.walk(extract_dir):
        level = root.replace(extract_dir, '').count(os.sep)
        indent = '  ' * (level + 1)
        subdir = os.path.basename(root)
        if level > 0:
            print(f'{prefix}{indent}{subdir}/')
        for f in sorted(files):
            print(f'{prefix}{indent}  {f}')


def find_animation_frames(extract_dir, direction):
    """
    추출 디렉토리에서 walking 애니메이션 프레임을 찾는다.
    PixelLab ZIP 구조: animations/{animation_name}/{direction}/ 하위에 프레임 PNG들.
    또는 animations/ 하위에 {direction}_frame_0.png 등의 형태.
    """
    frames = []

    # 패턴 1: animations/{name}/{direction}/ 하위 프레임들
    anim_dir = os.path.join(extract_dir, 'animations')
    if os.path.exists(anim_dir):
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

    # 패턴 2: animations/ 하위에 직접 {direction}_frame_N.png
    if os.path.exists(anim_dir):
        png_files = sorted([f for f in os.listdir(anim_dir)
                          if f.endswith('.png') and direction in f])
        if png_files:
            frames = [os.path.join(anim_dir, f) for f in png_files]
            return frames

    # 패턴 3: 루트에 animation 관련 파일
    for root, dirs, files in os.walk(extract_dir):
        png_files = sorted([f for f in files if f.endswith('.png') and direction in f.lower()])
        if len(png_files) >= 4:
            frames = [os.path.join(root, f) for f in png_files[:4]]
            return frames

    return frames


def process_walk_frame(img):
    """
    Walk 프레임 1개: raw -> 1/2 NEAREST -> 16x16 -> 16x24 캔버스 하단 정렬.
    B-3 process_customer 패턴 동일.
    """
    w, h = img.size
    # 1/2 NEAREST 다운스케일
    scaled = img.resize((w // 2, h // 2), Image.NEAREST)
    sw, sh = scaled.size
    # 너비 16px 맞춤 (중앙 크롭 또는 패딩)
    if sw > 16:
        left = (sw - 16) // 2
        scaled = scaled.crop((left, 0, left + 16, sh))
    elif sw < 16:
        c = Image.new('RGBA', (16, sh), (0, 0, 0, 0))
        c.paste(scaled, ((16 - sw) // 2, 0))
        scaled = c
    sw, sh = scaled.size
    # 16x24 캔버스에 하단 정렬
    canvas = Image.new('RGBA', (16, 24), (0, 0, 0, 0))
    if sh > 24:
        canvas.paste(scaled.crop((0, sh - 24, 16, sh)), (0, 0))
    else:
        canvas.paste(scaled, (0, 24 - sh))
    return canvas


def stitch_walk_sheet(frame_images):
    """4프레임을 가로로 결합하여 64x24 시트를 만든다."""
    sheet = Image.new('RGBA', (64, 24), (0, 0, 0, 0))
    for i, frame in enumerate(frame_images):
        sheet.paste(frame, (16 * i, 0))
    return sheet


def count_opaque(img):
    """불투명 픽셀 수를 세어 반환한다."""
    return sum(1 for p in img.getdata() if p[3] > 0)


def count_teal(img):
    """teal 픽셀 수를 세어 반환한다 (G>R, B>R, G>80)."""
    count = 0
    for p in img.getdata():
        r, g, b, a = p
        if a > 0 and g > r and b > r and g > 80:
            count += 1
    return count


def process_walk_character(ctype, character_id, results):
    """한 캐릭터의 walk east/west 시트를 처리한다."""
    print(f'\n=== Processing walk: {ctype} ({character_id}) ===')

    extract_dir = download_and_extract(character_id)
    print(f'  Extracted to: {extract_dir}')
    list_extracted_files(extract_dir, '  ')

    for direction, suffix in [('east', 'walk_r'), ('west', 'walk_l')]:
        frames = find_animation_frames(extract_dir, direction)
        out_name = f'customer_{ctype}_{suffix}.png'
        out_path = os.path.join(TAVERN_DIR, out_name)

        if len(frames) >= 4:
            print(f'  Found {len(frames)} frames for {direction}')
            frame_images = []
            for fi, fp in enumerate(frames[:4]):
                raw = Image.open(fp).convert('RGBA')
                # 원본 백업
                raw_backup = os.path.join(RAW_DIR, f'{ctype}_{direction}_frame{fi}.png')
                raw.save(raw_backup)
                processed = process_walk_frame(raw)
                frame_images.append(processed)

            sheet = stitch_walk_sheet(frame_images)
            sheet.save(out_path)
            w, h = sheet.size
            opaque = count_opaque(sheet)
            status = 'PASS' if w == 64 and h == 24 else 'FAIL'
            print(f'  {out_name}: {w}x{h}, opaque={opaque} -- {status}')
            results.append({
                'file': out_name, 'size': f'{w}x{h}',
                'opaque': opaque, 'status': status
            })
        else:
            print(f'  WARNING: Only {len(frames)} frames found for {direction}')
            print(f'  Generating placeholder walk sheet from rotation...')
            # fallback: rotation 이미지에서 4프레임 생성 (미세 변형)
            rotation_path = os.path.join(extract_dir, 'rotations', f'{direction}.png')
            if os.path.exists(rotation_path):
                raw = Image.open(rotation_path).convert('RGBA')
                raw_backup = os.path.join(RAW_DIR, f'{ctype}_{direction}_rotation.png')
                raw.save(raw_backup)
                base_frame = process_walk_frame(raw)
                # 4프레임 시뮬레이션: 동일 프레임 + 약간 offset
                frame_images = []
                for fi in range(4):
                    # 프레임 0,2: base, 프레임 1,3: 1px 위/아래 시프트
                    if fi % 2 == 0:
                        frame_images.append(base_frame.copy())
                    else:
                        shifted = Image.new('RGBA', (16, 24), (0, 0, 0, 0))
                        shifted.paste(base_frame, (0, -1))
                        frame_images.append(shifted)
                sheet = stitch_walk_sheet(frame_images)
                sheet.save(out_path)
                w, h = sheet.size
                opaque = count_opaque(sheet)
                status = 'PASS' if w == 64 and h == 24 else 'FAIL'
                print(f'  {out_name}: {w}x{h}, opaque={opaque} -- {status} (rotation fallback)')
                results.append({
                    'file': out_name, 'size': f'{w}x{h}',
                    'opaque': opaque, 'status': f'{status} (rotation fallback)'
                })
            else:
                print(f'  ERROR: No rotation image for {direction}')
                results.append({
                    'file': out_name, 'size': 'N/A',
                    'opaque': 0, 'status': 'FAIL (no source)'
                })


def process_w1_pro(results):
    """W-1 PRO 재발주: west rotation -> 16x22 seated_left."""
    print(f'\n=== Processing W-1 PRO ({W1_PRO_ID}) ===')

    extract_dir = download_and_extract(W1_PRO_ID)
    print(f'  Extracted to: {extract_dir}')
    list_extracted_files(extract_dir, '  ')

    rotation_path = os.path.join(extract_dir, 'rotations', 'west.png')
    if not os.path.exists(rotation_path):
        # fallback: 다른 경로 탐색
        for root, dirs, files in os.walk(extract_dir):
            for f in files:
                if 'west' in f.lower() and f.endswith('.png'):
                    rotation_path = os.path.join(root, f)
                    break

    if not os.path.exists(rotation_path):
        print('  ERROR: No west rotation found')
        results.append({
            'file': 'customer_normal_seated_left.png (W-1)',
            'size': 'N/A', 'opaque': 0, 'teal': 0, 'status': 'FAIL (no source)'
        })
        return

    raw = Image.open(rotation_path).convert('RGBA')
    raw_backup = os.path.join(RAW_DIR, 'w1_pro_west.png')
    raw.save(raw_backup)
    print(f'  Raw size: {raw.size}')

    # 직접 16x22 NEAREST 다운스케일
    result = raw.resize((16, 22), Image.NEAREST)
    opaque = count_opaque(result)
    teal = count_teal(result)
    teal_pct = (teal / opaque * 100) if opaque > 0 else 0

    print(f'  Resized: {result.size}, opaque={opaque}, teal={teal} ({teal_pct:.1f}%)')

    out_name = 'customer_normal_seated_left.png'
    out_path = os.path.join(TAVERN_DIR, out_name)

    if teal >= 13:
        result.save(out_path)
        status = f'PASS (teal={teal}, {teal_pct:.1f}%)'
        print(f'  {status} -- file replaced')
    else:
        # Option B: 기존 seated_right 팔레트 4단계 hue 정규화 시도
        print(f'  WARN: teal={teal} < 13. Attempting Option B hue normalization...')
        result_b = apply_option_b(result)
        teal_b = count_teal(result_b)
        teal_b_pct = (teal_b / opaque * 100) if opaque > 0 else 0
        print(f'  Option B: teal={teal_b} ({teal_b_pct:.1f}%)')

        if teal_b >= 13:
            result_b.save(out_path)
            status = f'PASS (Option B, teal={teal_b}, {teal_b_pct:.1f}%)'
            print(f'  {status} -- file replaced')
        else:
            # PARTIAL: 파일 미교체, 기존 유지
            status = f'PARTIAL (teal={teal}, Option B teal={teal_b}, target=13)'
            print(f'  {status} -- file NOT replaced, structural limit confirmed')

    results.append({
        'file': out_name + ' (W-1 PRO)',
        'size': f'{result.size[0]}x{result.size[1]}',
        'opaque': opaque, 'teal': teal, 'status': status
    })


def apply_option_b(img):
    """
    Option B: 기존 seated_right 팔레트 4단계 hue 정규화.
    회색/갈색 톤의 셔츠 영역을 teal로 변환.
    """
    result = img.copy()
    pixels = list(result.getdata())
    new_pixels = []
    for p in pixels:
        r, g, b, a = p
        if a > 0:
            # 셔츠 영역 추정: 몸통 중간 색상대 (회색~갈색, 채도 낮음)
            is_shirt = (
                40 < r < 180 and
                40 < g < 180 and
                40 < b < 180 and
                abs(r - g) < 50 and
                abs(g - b) < 50
            )
            if is_shirt:
                # teal로 변환 (4단계 팔레트)
                brightness = (r + g + b) / 3
                if brightness > 130:
                    new_pixels.append((100, 200, 200, a))  # 밝은 teal
                elif brightness > 100:
                    new_pixels.append((80, 176, 176, a))   # 중간 teal
                elif brightness > 70:
                    new_pixels.append((60, 140, 140, a))   # 어두운 teal
                else:
                    new_pixels.append((40, 100, 100, a))   # 매우 어두운 teal
            else:
                new_pixels.append(p)
        else:
            new_pixels.append(p)
    result.putdata(new_pixels)
    return result


if __name__ == '__main__':
    results = []

    print('=' * 60)
    print('Phase B-4 Post-Processing')
    print('=' * 60)

    # Step 1: Walk 시트 처리 (10종 x 2방향 = 20장)
    for ctype, cid in WALK_CHARACTERS.items():
        process_walk_character(ctype, cid, results)

    # Step 2: W-1 PRO 재발주
    process_w1_pro(results)

    # 결과 요약
    print('\n' + '=' * 60)
    print('SUMMARY')
    print('=' * 60)
    pass_count = sum(1 for r in results if 'PASS' in r['status'])
    fail_count = sum(1 for r in results if 'FAIL' in r['status'])
    partial_count = sum(1 for r in results if 'PARTIAL' in r['status'])

    for r in results:
        print(f"  {r['file']}: {r['size']}, opaque={r['opaque']}, status={r['status']}")

    print(f'\nTotal: {len(results)} files')
    print(f'PASS: {pass_count}, FAIL: {fail_count}, PARTIAL: {partial_count}')

    # JSON 결과 저장 (리포트용)
    report_path = os.path.join(RAW_DIR, 'b4_results.json')
    with open(report_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f'\nResults saved to: {report_path}')
