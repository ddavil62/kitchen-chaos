"""
Phase B-1 에셋 후처리 스크립트.
PixelLab 출력물을 native 크기로 리사이즈/크롭하여 최종 에셋을 생성한다.

사용법: python _postprocess.py
입력: _raw/ 디렉토리의 원본 PNG 파일
출력: 부모 디렉토리(tavern/)에 최종 에셋 PNG 파일
"""

from PIL import Image
import os
import sys

RAW_DIR = os.path.join(os.path.dirname(__file__), '_raw')
OUT_DIR = os.path.dirname(__file__)  # tavern/ 디렉토리

# 에셋별 후처리 명세: (파일명, 목표 크기, 후처리 방식)
ASSETS = [
    # 캐릭터: 32xN -> 16x(N/2), 정확히 절반 NEAREST 다운스케일
    {
        'name': 'customer_normal_seated_right.png',
        'target': (16, 22),
        'method': 'half_downscale',
    },
    {
        'name': 'customer_normal_seated_left.png',
        'target': (16, 22),
        'method': 'half_downscale',
    },
    {
        'name': 'chef_mimi_idle_side.png',
        'target': (16, 24),
        'method': 'half_downscale',
    },
    # 가구: 이미 정확한 크기 -> 복사만
    {
        'name': 'counter_v12.png',
        'target': (40, 100),
        'method': 'passthrough',
    },
    {
        'name': 'table_vertical_v12.png',
        'target': (44, 72),
        'method': 'passthrough',
    },
    # 벤치: 32x76 -> 14x76 center crop
    {
        'name': 'bench_vertical_l_v12.png',
        'target': (14, 76),
        'method': 'center_crop_width',
    },
    {
        'name': 'bench_vertical_r_v12.png',
        'target': (14, 76),
        'method': 'center_crop_width',
    },
    # 입구: 이미 정확한 크기 -> 복사만
    {
        'name': 'entrance_v12.png',
        'target': (32, 40),
        'method': 'passthrough',
    },
]


def process_half_downscale(img, target_w, target_h):
    """32xN -> 16x(N/2) 정확히 절반 NEAREST 다운스케일."""
    return img.resize((target_w, target_h), Image.NEAREST)


def process_center_crop_width(img, target_w, target_h):
    """가로를 center crop하여 target_w로 줄임. 세로는 유지."""
    src_w, src_h = img.size
    # center crop: 좌우 균등 자르기
    left = (src_w - target_w) // 2
    right = left + target_w
    cropped = img.crop((left, 0, right, src_h))
    # 세로가 다르면 NEAREST 리사이즈
    if cropped.size[1] != target_h:
        cropped = cropped.resize((target_w, target_h), Image.NEAREST)
    return cropped


def process_passthrough(img, target_w, target_h):
    """이미 정확한 크기일 때 그대로 반환. 크기가 다르면 NEAREST 리사이즈."""
    if img.size == (target_w, target_h):
        return img.copy()
    return img.resize((target_w, target_h), Image.NEAREST)


METHODS = {
    'half_downscale': process_half_downscale,
    'center_crop_width': process_center_crop_width,
    'passthrough': process_passthrough,
}


def main():
    errors = []
    results = []

    for asset in ASSETS:
        name = asset['name']
        target_w, target_h = asset['target']
        method = asset['method']

        raw_path = os.path.join(RAW_DIR, name)
        out_path = os.path.join(OUT_DIR, name)

        if not os.path.exists(raw_path):
            errors.append(f'[MISSING] {name}: 원본 파일 없음')
            continue

        img = Image.open(raw_path).convert('RGBA')
        print(f'[INPUT]  {name}: {img.size[0]}x{img.size[1]} mode={img.mode}')

        processor = METHODS[method]
        result = processor(img, target_w, target_h)

        # 검증: 정확한 크기 일치
        if result.size != (target_w, target_h):
            errors.append(
                f'[SIZE MISMATCH] {name}: '
                f'expected {target_w}x{target_h}, got {result.size[0]}x{result.size[1]}'
            )
            continue

        # RGBA 모드 보장
        if result.mode != 'RGBA':
            result = result.convert('RGBA')

        result.save(out_path, 'PNG')
        results.append(f'[OK]     {name}: {result.size[0]}x{result.size[1]}')

    # 결과 출력
    print()
    print('=== POST-PROCESS RESULTS ===')
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
        print(f'ALL {len(results)} ASSETS PROCESSED SUCCESSFULLY')

    # 최종 검증: 출력 파일 크기 재확인
    print()
    print('=== FINAL VERIFICATION ===')
    all_ok = True
    for asset in ASSETS:
        name = asset['name']
        target_w, target_h = asset['target']
        out_path = os.path.join(OUT_DIR, name)
        if os.path.exists(out_path):
            verify = Image.open(out_path)
            w, h = verify.size
            status = 'PASS' if (w == target_w and h == target_h) else 'FAIL'
            if status == 'FAIL':
                all_ok = False
            print(f'  {status}: {name} -> {w}x{h} (target: {target_w}x{target_h})')
        else:
            print(f'  FAIL: {name} -> FILE NOT FOUND')
            all_ok = False

    if not all_ok:
        print('\nVERIFICATION FAILED')
        sys.exit(1)
    else:
        print('\nALL VERIFICATIONS PASSED')


if __name__ == '__main__':
    main()
