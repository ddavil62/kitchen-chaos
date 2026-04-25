#!/usr/bin/env python3
"""
Phase B-6-2 태번 가구 에셋 업스케일 후처리 스크립트.
bench 14x76 -> 28x96 (width 2x + height 연장)
table 44x72 -> 44x96 (height 연장)
bench_r = bench_l 수평 플립
"""
import shutil, os
from PIL import Image

ASSET_DIR = os.path.dirname(os.path.abspath(__file__))
LEGACY_DIR = os.path.join(ASSET_DIR, ".legacy-b6-2")

def backup():
    os.makedirs(LEGACY_DIR, exist_ok=True)
    for f in ["bench_vertical_l_v12.png", "bench_vertical_r_v12.png", "table_vertical_v12.png"]:
        src = os.path.join(ASSET_DIR, f)
        dst = os.path.join(LEGACY_DIR, f)
        if not os.path.exists(dst):  # 이미 백업된 경우 덮어쓰지 않음
            shutil.copy2(src, dst)
    print("[backup] 3종 백업 완료 ->", LEGACY_DIR)

def make_bench_l():
    img = Image.open(os.path.join(LEGACY_DIR, "bench_vertical_l_v12.png")).convert("RGBA")
    w, h = img.size
    bench_wide = img.resize((28, h), Image.NEAREST)
    canvas = Image.new("RGBA", (28, 96), (0, 0, 0, 0))
    # 상단 테두리 (2px)
    canvas.paste(bench_wide.crop((0, 0, 28, 2)), (0, 0))
    # 중간 나무결 (92px = 2~94)
    mid = bench_wide.crop((0, 2, 28, h - 2))
    canvas.paste(mid.resize((28, 92), Image.NEAREST), (0, 2))
    # 하단 테두리 (2px)
    canvas.paste(bench_wide.crop((0, h - 2, 28, h)), (0, 94))
    out = os.path.join(ASSET_DIR, "bench_vertical_l_v12.png")
    canvas.save(out)
    print(f"[bench_l] saved -> 28x96")
    return canvas

def make_bench_r(bench_l_img):
    bench_r = bench_l_img.transpose(Image.FLIP_LEFT_RIGHT)
    out = os.path.join(ASSET_DIR, "bench_vertical_r_v12.png")
    bench_r.save(out)
    print(f"[bench_r] saved -> 28x96 (bench_l 플립)")

def make_table():
    img = Image.open(os.path.join(LEGACY_DIR, "table_vertical_v12.png")).convert("RGBA")
    w, h = img.size
    canvas = Image.new("RGBA", (44, 96), (0, 0, 0, 0))
    # 상단 테두리 (4px)
    canvas.paste(img.crop((0, 0, 44, 4)), (0, 0))
    # 중간 나무판 (88px = 4~92)
    mid = img.crop((0, 4, 44, h - 4))
    canvas.paste(mid.resize((44, 88), Image.NEAREST), (0, 4))
    # 하단 테두리 (4px)
    canvas.paste(img.crop((0, h - 4, 44, h)), (0, 92))
    out = os.path.join(ASSET_DIR, "table_vertical_v12.png")
    canvas.save(out)
    print(f"[table] saved -> 44x96")

def verify():
    checks = [
        ("bench_vertical_l_v12.png", 28, 96),
        ("bench_vertical_r_v12.png", 28, 96),
        ("table_vertical_v12.png", 44, 96),
    ]
    all_ok = True
    for fname, exp_w, exp_h in checks:
        img = Image.open(os.path.join(ASSET_DIR, fname))
        ok = img.size == (exp_w, exp_h)
        print(f"[verify] {fname}: {img.size} {'OK' if ok else 'FAIL'}")
        if not ok:
            all_ok = False
    return all_ok

if __name__ == "__main__":
    backup()
    bench_l = make_bench_l()
    make_bench_r(bench_l)
    make_table()
    ok = verify()
    print("[result]", "ALL PASS" if ok else "FAIL")
