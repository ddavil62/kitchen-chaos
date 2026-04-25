#!/usr/bin/env python3
"""
Phase D 에셋 후처리 스크립트.
손님 10종 x 4종(walk_r, walk_l, seated_right, seated_left) = 40장 재처리 +
가구 3종(bench_l, bench_r, table) PIL NEAREST 확장.

사용법: python _postprocess_phase_d.py
입력: .zips-b6/_extract_*/ (기존 68x68 소스, 재다운로드 없음)
출력: 부모 디렉토리(tavern/)에 최종 에셋 PNG 파일

변경점 (vs B-6):
  - NEAREST 스케일: 68->64px (94% 다운스케일, 거의 원본 해상도)
  - 캔버스: 64x64 (4채널 RGBA)
  - walk 시트: 256x64 (4프레임 x 64px)
  - Y_OFFSET: 0 (64px 꽉 채움)
  - 가구: bench 28x96->80x200, table 44x96->64x200 (PIL NEAREST 확장)
"""

from PIL import Image
import os
import sys
import shutil
import json

TAVERN_DIR = os.path.dirname(os.path.abspath(__file__))
ZIP_DIR = os.path.join(TAVERN_DIR, '.zips-b6')
LEGACY_DIR = os.path.join(TAVERN_DIR, '.legacy-phase-d')

# -- 손님 캔버스 규격 --
CANVAS_W = 64
CANVAS_H = 64
CHAR_SIZE = 64   # resize 타겟 (NEAREST)
SOURCE_SIZE = 68 # 소스 원본 크기

# -- 손님 10종 character_id --
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


def count_opaque(img):
    """불투명 픽셀 수를 세어 반환한다."""
    return sum(1 for p in img.getdata() if p[3] > 0)


def find_rotation(extract_dir, direction):
    """rotations/{direction}.png 경로를 찾는다."""
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

    return frames


def process_static(raw_img):
    """68x68 원본 -> 64x64 NEAREST 다운스케일. alpha 채널 보존."""
    img = raw_img.convert('RGBA')
    resized = img.resize((CHAR_SIZE, CHAR_SIZE), Image.NEAREST)
    return resized  # 64x64


def process_walk_sheet(frame_paths):
    """4프레임 각각 68x68 -> 64x64 NEAREST -> 256x64 가로 결합."""
    sheet = Image.new('RGBA', (CANVAS_W * 4, CANVAS_H), (0, 0, 0, 0))
    for i, fp in enumerate(frame_paths[:4]):
        raw = Image.open(fp).convert('RGBA')
        cell = process_static(raw)
        sheet.paste(cell, (i * CANVAS_W, 0), cell)
    return sheet  # 256x64


# -- 백업 --

def backup():
    """기존 에셋을 .legacy-phase-d/ 에 백업한다."""
    os.makedirs(LEGACY_DIR, exist_ok=True)

    # 손님 에셋 백업 (seated + walk = 40장)
    for ctype in CUSTOMER_CHARACTERS:
        for suffix in ['seated_right', 'seated_left', 'walk_r', 'walk_l']:
            fname = f'customer_{ctype}_{suffix}.png'
            src = os.path.join(TAVERN_DIR, fname)
            dst = os.path.join(LEGACY_DIR, fname)
            if os.path.exists(src) and not os.path.exists(dst):
                shutil.copy2(src, dst)

    # 가구 에셋 백업 (3종)
    for fname in ['bench_vertical_l_v12.png', 'bench_vertical_r_v12.png', 'table_vertical_v12.png']:
        src = os.path.join(TAVERN_DIR, fname)
        dst = os.path.join(LEGACY_DIR, fname)
        if os.path.exists(src) and not os.path.exists(dst):
            shutil.copy2(src, dst)

    print(f'[backup] 기존 에셋 백업 완료 -> {LEGACY_DIR}')


# -- 손님 처리 --

def process_customer(ctype, character_id, results):
    """손님 1종 처리: seated_right, seated_left, walk_r, walk_l (4장)."""
    print(f'\n=== Customer: {ctype} ({character_id[:8]}...) ===')

    extract_dir = os.path.join(ZIP_DIR, f'_extract_{character_id}')
    if not os.path.exists(extract_dir):
        print(f'  ERROR: extract dir not found: {extract_dir}')
        for suffix in ['seated_right', 'seated_left', 'walk_r', 'walk_l']:
            results.append({
                'file': f'customer_{ctype}_{suffix}.png',
                'size': 'N/A', 'opaque': 0, 'status': 'FAIL (no extract dir)'
            })
        return

    # -- seated (east -> seated_right, west -> seated_left) --
    for direction, suffix in [('east', 'seated_right'), ('west', 'seated_left')]:
        out_name = f'customer_{ctype}_{suffix}.png'
        out_path = os.path.join(TAVERN_DIR, out_name)

        rotation_path = find_rotation(extract_dir, direction)

        # west 없으면 east 수평 플립으로 fallback
        if not rotation_path and direction == 'west':
            east_path = find_rotation(extract_dir, 'east')
            if east_path:
                print(f'  {out_name}: west rotation 없음 -> east 수평 플립 fallback')
                raw = Image.open(east_path).convert('RGBA')
                raw = raw.transpose(Image.FLIP_LEFT_RIGHT)
                result = process_static(raw)
                result.save(out_path)
                w, h = result.size
                opaque = count_opaque(result)
                status = 'PASS' if w == CANVAS_W and h == CANVAS_H else 'FAIL'
                print(f'  {out_name}: {w}x{h}, opaque={opaque} -- {status} (flip fallback)')
                results.append({'file': out_name, 'size': f'{w}x{h}', 'opaque': opaque, 'status': f'{status} (flip fallback)'})
                continue

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

    # -- walk (east -> walk_r, west -> walk_l) --
    for direction, suffix in [('east', 'walk_r'), ('west', 'walk_l')]:
        out_name = f'customer_{ctype}_{suffix}.png'
        out_path = os.path.join(TAVERN_DIR, out_name)

        frames = find_animation_frames(extract_dir, direction)

        if len(frames) >= 4:
            sheet = process_walk_sheet(frames)
            sheet.save(out_path)
            w, h = sheet.size
            opaque = count_opaque(sheet)
            status = 'PASS' if w == CANVAS_W * 4 and h == CANVAS_H else 'FAIL'
            print(f'  {out_name}: {w}x{h}, opaque={opaque} -- {status}')
            results.append({'file': out_name, 'size': f'{w}x{h}', 'opaque': opaque, 'status': status})
        else:
            print(f'  WARNING: Only {len(frames)} {direction} frames for {ctype}')
            # fallback: east 프레임을 수평 플립 (walk_l에서 west 없을 때)
            if direction == 'west':
                east_frames = find_animation_frames(extract_dir, 'east')
                if len(east_frames) >= 4:
                    print(f'  -> east 프레임 수평 플립으로 walk_l 생성')
                    sheet = Image.new('RGBA', (CANVAS_W * 4, CANVAS_H), (0, 0, 0, 0))
                    for i, fp in enumerate(east_frames[:4]):
                        raw = Image.open(fp).convert('RGBA')
                        raw = raw.transpose(Image.FLIP_LEFT_RIGHT)
                        cell = process_static(raw)
                        sheet.paste(cell, (i * CANVAS_W, 0), cell)
                    sheet.save(out_path)
                    w, h = sheet.size
                    opaque = count_opaque(sheet)
                    status = 'PASS' if w == CANVAS_W * 4 and h == CANVAS_H else 'FAIL'
                    print(f'  {out_name}: {w}x{h}, opaque={opaque} -- {status} (east flip fallback)')
                    results.append({'file': out_name, 'size': f'{w}x{h}', 'opaque': opaque, 'status': f'{status} (east flip fallback)'})
                    continue

            # 최후 fallback: rotation 이미지 4회 복제
            rotation_path = find_rotation(extract_dir, direction)
            if not rotation_path and direction == 'west':
                rotation_path = find_rotation(extract_dir, 'east')
            if rotation_path:
                raw = Image.open(rotation_path).convert('RGBA')
                if direction == 'west' and not find_rotation(extract_dir, 'west'):
                    raw = raw.transpose(Image.FLIP_LEFT_RIGHT)
                base = process_static(raw)
                sheet = Image.new('RGBA', (CANVAS_W * 4, CANVAS_H), (0, 0, 0, 0))
                for fi in range(4):
                    sheet.paste(base, (fi * CANVAS_W, 0), base)
                sheet.save(out_path)
                w, h = sheet.size
                opaque = count_opaque(sheet)
                status = 'PASS' if w == CANVAS_W * 4 and h == CANVAS_H else 'FAIL'
                print(f'  {out_name}: {w}x{h}, opaque={opaque} -- {status} (rotation fallback)')
                results.append({'file': out_name, 'size': f'{w}x{h}', 'opaque': opaque, 'status': f'{status} (rotation fallback)'})
            else:
                print(f'  ERROR: No source for {direction} walk')
                results.append({'file': out_name, 'size': 'N/A', 'opaque': 0, 'status': 'FAIL (no source)'})


# -- 가구 처리 --

def make_bench_l():
    """bench_l: 28x96 -> 80x200 (NEAREST width 확장 + 테두리 보존 height 연장)."""
    src_path = os.path.join(LEGACY_DIR, 'bench_vertical_l_v12.png')
    if not os.path.exists(src_path):
        # legacy가 아직 없으면 현재 파일에서 읽기
        src_path = os.path.join(TAVERN_DIR, 'bench_vertical_l_v12.png')
    img = Image.open(src_path).convert('RGBA')
    w, h = img.size  # 28x96

    # Step 1: width 28 -> 80 (NEAREST stretch)
    wide = img.resize((80, h), Image.NEAREST)

    # Step 2: height 96 -> 200 (테두리 2px 보존 + 중간 연장)
    BORDER = 2
    canvas = Image.new('RGBA', (80, 200), (0, 0, 0, 0))
    # 상단 테두리 (2px)
    canvas.paste(wide.crop((0, 0, 80, BORDER)), (0, 0))
    # 중간 나무결 (196px = 2 ~ 198)
    mid = wide.crop((0, BORDER, 80, h - BORDER))
    canvas.paste(mid.resize((80, 200 - BORDER * 2), Image.NEAREST), (0, BORDER))
    # 하단 테두리 (2px)
    canvas.paste(wide.crop((0, h - BORDER, 80, h)), (0, 200 - BORDER))

    out_path = os.path.join(TAVERN_DIR, 'bench_vertical_l_v12.png')
    canvas.save(out_path)
    print(f'[bench_l] saved -> {canvas.size}')
    return canvas


def make_bench_r(bench_l_img):
    """bench_l 수평 플립 -> bench_r."""
    bench_r = bench_l_img.transpose(Image.FLIP_LEFT_RIGHT)
    out_path = os.path.join(TAVERN_DIR, 'bench_vertical_r_v12.png')
    bench_r.save(out_path)
    print(f'[bench_r] saved -> {bench_r.size} (bench_l 플립)')


def make_table():
    """table: 44x96 -> 64x200 (NEAREST width 확장 + 테두리 4px 보존 height 연장)."""
    src_path = os.path.join(LEGACY_DIR, 'table_vertical_v12.png')
    if not os.path.exists(src_path):
        src_path = os.path.join(TAVERN_DIR, 'table_vertical_v12.png')
    img = Image.open(src_path).convert('RGBA')
    w, h = img.size  # 44x96

    # Step 1: width 44 -> 64 (NEAREST stretch)
    wide = img.resize((64, h), Image.NEAREST)

    # Step 2: height 96 -> 200 (테두리 4px 보존 + 중간 연장)
    BORDER = 4
    canvas = Image.new('RGBA', (64, 200), (0, 0, 0, 0))
    # 상단 테두리 (4px)
    canvas.paste(wide.crop((0, 0, 64, BORDER)), (0, 0))
    # 중간 나무판 (192px = 4 ~ 196)
    mid = wide.crop((0, BORDER, 64, h - BORDER))
    canvas.paste(mid.resize((64, 200 - BORDER * 2), Image.NEAREST), (0, BORDER))
    # 하단 테두리 (4px)
    canvas.paste(wide.crop((0, h - BORDER, 64, h)), (0, 200 - BORDER))

    out_path = os.path.join(TAVERN_DIR, 'table_vertical_v12.png')
    canvas.save(out_path)
    print(f'[table] saved -> {canvas.size}')


# -- 검증 --

def verify_all(results):
    """생성된 에셋 전수 크기 검증."""
    print('\n' + '=' * 60)
    print('VERIFICATION')
    print('=' * 60)

    all_ok = True

    # 손님 에셋 검증 (40장)
    for ctype in CUSTOMER_CHARACTERS:
        for suffix, exp_w, exp_h in [
            ('seated_right', 64, 64),
            ('seated_left', 64, 64),
            ('walk_r', 256, 64),
            ('walk_l', 256, 64),
        ]:
            fname = f'customer_{ctype}_{suffix}.png'
            fpath = os.path.join(TAVERN_DIR, fname)
            if os.path.exists(fpath):
                img = Image.open(fpath)
                ok = img.size == (exp_w, exp_h)
                print(f'  {fname}: {img.size} {"OK" if ok else "FAIL"}')
                if not ok:
                    all_ok = False
            else:
                print(f'  {fname}: MISSING')
                all_ok = False

    # 가구 에셋 검증 (3종)
    furniture_checks = [
        ('bench_vertical_l_v12.png', 80, 200),
        ('bench_vertical_r_v12.png', 80, 200),
        ('table_vertical_v12.png', 64, 200),
    ]
    for fname, exp_w, exp_h in furniture_checks:
        fpath = os.path.join(TAVERN_DIR, fname)
        if os.path.exists(fpath):
            img = Image.open(fpath)
            ok = img.size == (exp_w, exp_h)
            print(f'  {fname}: {img.size} {"OK" if ok else "FAIL"}')
            if not ok:
                all_ok = False
        else:
            print(f'  {fname}: MISSING')
            all_ok = False

    return all_ok


# -- 메인 --

if __name__ == '__main__':
    results = []

    print('=' * 60)
    print('Phase D Post-Processing (68x68 -> 64px NEAREST + furniture)')
    print('=' * 60)

    # Step 0: 백업
    backup()

    # Step 1: 손님 10종 처리 (seated + walk = 40장)
    for ctype, cid in CUSTOMER_CHARACTERS.items():
        process_customer(ctype, cid, results)

    # Step 2: 가구 3종 처리
    print('\n' + '=' * 60)
    print('FURNITURE PROCESSING')
    print('=' * 60)
    bench_l = make_bench_l()
    make_bench_r(bench_l)
    make_table()

    # Step 3: 전수 검증
    all_ok = verify_all(results)

    # 결과 요약
    print('\n' + '=' * 60)
    print('SUMMARY')
    print('=' * 60)
    pass_count = sum(1 for r in results if 'PASS' in r['status'])
    fail_count = sum(1 for r in results if 'FAIL' in r['status'])

    for r in results:
        print(f"  {r['file']}: {r['size']}, opaque={r['opaque']}, status={r['status']}")

    print(f'\nCustomer assets: {len(results)} files')
    print(f'PASS: {pass_count}, FAIL: {fail_count}')
    print(f'Verification: {"ALL PASS" if all_ok else "FAIL"}')

    # JSON 결과 저장
    report_path = os.path.join(ZIP_DIR, 'phase_d_results.json')
    with open(report_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f'\nResults saved to: {report_path}')
