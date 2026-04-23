"""
Phase B-2 에셋 후처리 스크립트.
PixelLab 재발주 출력물을 native 크기로 리사이즈/크롭하여 최종 에셋을 생성한다.

사용법: python _postprocess_b2.py
입력: _raw/ 디렉토리의 *_b2.png 파일
출력: 부모 디렉토리(tavern/)에 최종 에셋 PNG 파일

후처리 전략:
  - customer_normal_seated_left: 32x32 -> 16x16 (NEAREST 1/2 다운스케일)
      -> 16x22 캔버스에 하단 정렬 (상단 6px 투명 패딩)
  - chef_rin_idle_side: 36x36 -> 18x18 (NEAREST 1/2 다운스케일)
      -> 16x24 캔버스에 하단 중앙 배치 (너비 1px 양쪽 crop, 상단 6px 투명 패딩)
  - bench_l/r: 32x76 -> 14x76 (NEAREST 가로 스케일 다운, 높이 유지)
"""

from PIL import Image
import os
import sys

RAW_DIR = os.path.join(os.path.dirname(__file__), '_raw')
OUT_DIR = os.path.dirname(__file__)  # tavern/ 디렉토리

# B-2 에셋별 후처리 명세
ASSETS_B2 = [
    {
        'raw_name': 'customer_normal_seated_left_b2.png',
        'out_name': 'customer_normal_seated_left.png',
        'target': (16, 22),
        'method': 'char_downscale_crop',
    },
    {
        'raw_name': 'chef_rin_idle_side_b2.png',
        'out_name': 'chef_rin_idle_side.png',
        'target': (16, 24),
        'method': 'char_downscale_crop',
    },
    {
        'raw_name': 'bench_vertical_l_v12_b2.png',
        'out_name': 'bench_vertical_l_v12.png',
        'target': (14, 76),
        'method': 'width_scale_down',
    },
    {
        'raw_name': 'bench_vertical_r_v12_b2.png',
        'out_name': 'bench_vertical_r_v12.png',
        'target': (14, 76),
        'method': 'width_scale_down',
    },
]


def process_char_downscale_crop(img, target_w, target_h):
    """캐릭터: NEAREST 1/2 다운스케일 후 target 크기에 맞춰 크롭/패딩.

    전략:
    1. 원본을 가로 1/2 NEAREST 다운스케일 (32->16, 36->18)
    2. 가로가 target_w보다 크면 center crop
    3. 세로가 target_h보다 작으면 하단 정렬 투명 패딩
    4. 세로가 target_h보다 크면 하단 기준 crop (상단 잘라냄)
    """
    src_w, src_h = img.size

    # 1) 1/2 다운스케일
    half_w = src_w // 2
    half_h = src_h // 2
    scaled = img.resize((half_w, half_h), Image.NEAREST)

    # 2) 가로 center crop (필요 시)
    sw, sh = scaled.size
    if sw > target_w:
        left = (sw - target_w) // 2
        scaled = scaled.crop((left, 0, left + target_w, sh))
    elif sw < target_w:
        # 가로가 부족하면 투명 패딩
        canvas = Image.new('RGBA', (target_w, sh), (0, 0, 0, 0))
        paste_x = (target_w - sw) // 2
        canvas.paste(scaled, (paste_x, 0))
        scaled = canvas

    # 3) 세로 맞춤: 하단 정렬
    sw, sh = scaled.size
    if sh < target_h:
        canvas = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
        canvas.paste(scaled, (0, target_h - sh))
        return canvas
    elif sh > target_h:
        # 상단을 잘라냄 (하단 유지)
        return scaled.crop((0, sh - target_h, target_w, sh))
    return scaled


def process_width_scale_down(img, target_w, target_h):
    """벤치: 전체 가로를 NEAREST로 target_w로 스케일 다운. 높이 유지.

    center crop이 아닌 전체 압축이므로 측면 음영이 보존된다.
    """
    src_w, src_h = img.size
    # 가로만 target_w로 스케일, 세로는 유지
    result = img.resize((target_w, src_h), Image.NEAREST)
    # 세로가 다르면 리사이즈
    if result.size[1] != target_h:
        result = result.resize((target_w, target_h), Image.NEAREST)
    return result


METHODS_B2 = {
    'char_downscale_crop': process_char_downscale_crop,
    'width_scale_down': process_width_scale_down,
}


def main():
    errors = []
    results = []

    for asset in ASSETS_B2:
        raw_name = asset['raw_name']
        out_name = asset['out_name']
        target_w, target_h = asset['target']
        method = asset['method']

        raw_path = os.path.join(RAW_DIR, raw_name)
        out_path = os.path.join(OUT_DIR, out_name)

        if not os.path.exists(raw_path):
            errors.append(f'[MISSING] {raw_name}: 원본 파일 없음')
            continue

        img = Image.open(raw_path).convert('RGBA')
        print(f'[INPUT]  {raw_name}: {img.size[0]}x{img.size[1]} mode={img.mode}')

        processor = METHODS_B2[method]
        result = processor(img, target_w, target_h)

        # 검증: 정확한 크기 일치
        if result.size != (target_w, target_h):
            errors.append(
                f'[SIZE MISMATCH] {out_name}: '
                f'expected {target_w}x{target_h}, got {result.size[0]}x{result.size[1]}'
            )
            continue

        # RGBA 모드 보장
        if result.mode != 'RGBA':
            result = result.convert('RGBA')

        result.save(out_path, 'PNG')
        results.append(f'[OK]     {out_name}: {result.size[0]}x{result.size[1]}')

    # 결과 출력
    print()
    print('=== B-2 POST-PROCESS RESULTS ===')
    for r in results:
        print(r)

    if errors:
        print()
        print('=== ERRORS ===')
        for e in errors:
            print(e)
        sys.exit(1)
    else:
        print()
        print(f'ALL {len(results)} B-2 ASSETS PROCESSED SUCCESSFULLY')

    # 최종 검증: 출력 파일 크기 재확인
    print()
    print('=== FINAL VERIFICATION ===')
    all_ok = True
    for asset in ASSETS_B2:
        out_name = asset['out_name']
        target_w, target_h = asset['target']
        out_path = os.path.join(OUT_DIR, out_name)
        if os.path.exists(out_path):
            verify = Image.open(out_path)
            w, h = verify.size
            status = 'PASS' if (w == target_w and h == target_h) else 'FAIL'
            if status == 'FAIL':
                all_ok = False
            print(f'  {status}: {out_name} -> {w}x{h} (target: {target_w}x{target_h})')
        else:
            print(f'  FAIL: {out_name} -> FILE NOT FOUND')
            all_ok = False

    if not all_ok:
        print('\nVERIFICATION FAILED')
        sys.exit(1)
    else:
        print('\nALL VERIFICATIONS PASSED')


if __name__ == '__main__':
    main()
