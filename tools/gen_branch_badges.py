"""
분기 카드 카테고리 배지 아이콘 4종 생성 스크립트 (Phase 58-2).

AD 모드1 컨셉에 맞춰 32x32 RGBA PNG 4장을 직접 픽셀 드로잉으로 생성한다.
  - branch_badge_mutation.png : 불꽃 + 소용돌이 (오렌지 #ff6600)
  - branch_badge_recipe.png   : 요리책 + 별   (초록   #22cc44)
  - branch_badge_bond.png     : 하트 + 셰프 모자 (하늘  #88aaff)
  - branch_badge_blessing.png : 물방울 + 광배 (금색   #ffcc00)

기존 assets/ui/icon_gold.png, icon_heart.png, chapter_icon_ch*.png와 동일한
32x32 투명 배경 + 검정 외곽선 픽셀아트 톤을 유지한다.

사용법:
  python tools/gen_branch_badges.py
  → kitchen-chaos/assets/ui/branch_badge_*.png 4장 저장
"""
from PIL import Image
import os

# ── 공통 설정 ──
SIZE = 32
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "ui")

BLACK = (0, 0, 0, 255)
TRANSP = (0, 0, 0, 0)


def new_canvas():
    """32x32 투명 캔버스를 생성한다."""
    return Image.new("RGBA", (SIZE, SIZE), TRANSP)


def put(px, x, y, color):
    """경계 밖은 무시하고 단일 픽셀을 찍는다."""
    if 0 <= x < SIZE and 0 <= y < SIZE:
        px[x, y] = color


def fill_rect(px, x0, y0, x1, y1, color):
    """폐구간 [x0,x1] x [y0,y1] 픽셀 사각형을 채운다."""
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            put(px, x, y, color)


def outline_pixels(img, pixels, outline_color=BLACK):
    """주어진 채색 좌표 집합의 외곽(상하좌우 이웃 중 빈 칸)에 검정 외곽선을 얹는다.
    이미 채색된 자리는 덮지 않는다.
    """
    px = img.load()
    target = set(pixels)
    for (x, y) in list(target):
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < SIZE and 0 <= ny < SIZE and (nx, ny) not in target:
                # 해당 위치가 투명이면 검정으로 외곽선을 그린다.
                if px[nx, ny][3] == 0:
                    px[nx, ny] = outline_color


def save(img, name):
    """assets/ui/{name} 경로로 PNG 저장."""
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, name)
    img.save(path, "PNG")
    print(f"[ok] {path}", flush=True)


# ── 1. Mutation (변이) : 불꽃 + 소용돌이 ──────────────────────────────

def draw_mutation():
    """오렌지 불꽃 형태에 중앙 소용돌이 문양을 얹은 32x32 배지.
    키컬러: #ff3300 (코어), #ff6600 (본체), #ffaa44 (하이라이트)
    """
    CORE = (0xff, 0x33, 0x00, 255)
    BODY = (0xff, 0x66, 0x00, 255)
    HIGHLIGHT = (0xff, 0xaa, 0x44, 255)

    img = new_canvas()
    px = img.load()

    colored = set()

    def paint(x, y, c):
        put(px, x, y, c)
        colored.add((x, y))

    # 불꽃 형태 (행 단위로 정의). 중앙 x=16 기준 좌우 대칭의 물방울형.
    # y는 상단(뾰족)에서 하단(둥근 기저)로 내려온다.
    flame_rows = [
        (5, 16, 16),    # y=5: 중앙 1px
        (6, 15, 17),    # y=6: 3px
        (7, 14, 18),
        (8, 13, 19),
        (9, 12, 20),
        (10, 11, 21),
        (11, 10, 22),
        (12, 9, 23),
        (13, 9, 23),
        (14, 8, 24),
        (15, 8, 24),
        (16, 8, 24),
        (17, 8, 24),
        (18, 8, 24),
        (19, 9, 23),
        (20, 9, 23),
        (21, 10, 22),
        (22, 11, 21),
        (23, 13, 19),
        (24, 15, 17),
    ]

    # 본체 오렌지 채움
    for (y, xl, xr) in flame_rows:
        for x in range(xl, xr + 1):
            paint(x, y, BODY)

    # 내부 코어(진한 빨강) — 중앙 약간 아래쪽 타원
    core_rows = [
        (11, 15, 17),
        (12, 14, 18),
        (13, 13, 19),
        (14, 12, 20),
        (15, 12, 20),
        (16, 12, 20),
        (17, 12, 20),
        (18, 13, 19),
        (19, 14, 18),
        (20, 15, 17),
    ]
    for (y, xl, xr) in core_rows:
        for x in range(xl, xr + 1):
            paint(x, y, CORE)

    # 소용돌이 문양 (하이라이트, 중앙 회오리)
    swirl_pixels = [
        (16, 12), (17, 12), (18, 13),
        (18, 14), (17, 15), (16, 15),
        (15, 15), (14, 14), (14, 13),
        (15, 12), (16, 11),
        # 꼬리 부분(우하단)
        (19, 15), (19, 16), (20, 16),
        (18, 17), (17, 17),
    ]
    for (x, y) in swirl_pixels:
        paint(x, y, HIGHLIGHT)

    # 불꽃 상단 하이라이트 (왼쪽 상단 큰 불꽃 모서리)
    for (x, y) in [(13, 9), (12, 10), (11, 11), (10, 12), (14, 10)]:
        paint(x, y, HIGHLIGHT)

    # 검정 외곽선 추가
    outline_pixels(img, colored)
    return img


# ── 2. Recipe (레시피 해금) : 요리책 + 별 ─────────────────────────────

def draw_recipe():
    """초록 요리책 + 우상단 4점 별.
    키컬러: #117722 (표지), #22cc44 (하이라이트/테두리 내측), #eeffee (페이지), #ffff88 (별)
    """
    COVER_DARK = (0x11, 0x77, 0x22, 255)
    COVER_LIGHT = (0x22, 0xcc, 0x44, 255)
    PAGE = (0xee, 0xff, 0xee, 255)
    PAGE_LINE = (0xaa, 0xcc, 0xaa, 255)
    STAR = (0xff, 0xff, 0x88, 255)
    STAR_CORE = (0xff, 0xcc, 0x00, 255)

    img = new_canvas()
    px = img.load()
    colored = set()

    def paint(x, y, c):
        put(px, x, y, c)
        colored.add((x, y))

    # 펼쳐진 책 (Y 12~26, 가로 5~27).
    # 상단 반(책 내부 페이지)은 밝은 색, 하단 반은 표지 두께감.
    book_top = 12
    book_bot = 25
    book_left = 5
    book_right = 26

    # 표지 전체(진녹색 프레임)
    for y in range(book_top, book_bot + 1):
        for x in range(book_left, book_right + 1):
            paint(x, y, COVER_DARK)

    # 페이지 2면 (내부 밝은색)
    page_top = 13
    page_bot = 22
    # 왼쪽 페이지: x 7~15
    for y in range(page_top, page_bot + 1):
        for x in range(7, 15 + 1):
            paint(x, y, PAGE)
    # 오른쪽 페이지: x 17~24
    for y in range(page_top, page_bot + 1):
        for x in range(17, 24 + 1):
            paint(x, y, PAGE)
    # 중앙 접힘선 (진녹색)
    for y in range(page_top, page_bot + 1):
        paint(16, y, COVER_DARK)

    # 페이지 줄 (레시피 줄 표시)
    for y in (15, 17, 19):
        for x in range(8, 14 + 1):
            paint(x, y, PAGE_LINE)
        for x in range(18, 24 + 1):
            paint(x, y, PAGE_LINE)

    # 책 상단 하이라이트(펼친 안쪽 가장자리)
    for x in range(book_left + 1, book_right):
        paint(x, book_top, COVER_LIGHT)

    # 책 하단 표지 두께(바닥 그림자)
    for x in range(book_left, book_right + 1):
        paint(x, book_bot, COVER_DARK)
    for x in range(book_left + 1, book_right):
        paint(x, book_bot - 1, COVER_LIGHT)

    # 4점 별 (우상단) — 십자형
    star_center = (24, 7)
    cx, cy = star_center
    star_pixels = [
        (cx, cy - 2), (cx, cy - 1), (cx, cy), (cx, cy + 1), (cx, cy + 2),
        (cx - 2, cy), (cx - 1, cy), (cx + 1, cy), (cx + 2, cy),
    ]
    for (x, y) in star_pixels:
        paint(x, y, STAR)
    # 별 중심 골드 하이라이트
    paint(cx, cy, STAR_CORE)

    outline_pixels(img, colored)
    return img


# ── 3. Bond (셰프 인연) : 하트 + 셰프 모자 ────────────────────────────

def draw_bond():
    """하늘색 하트 위에 흰 셰프 모자(토크).
    키컬러: #88aaff (하트), #cc88ff (하트 음영), #ffffff (모자), #224488 (모자 밴드)
    """
    HEART = (0x88, 0xaa, 0xff, 255)
    HEART_SHADE = (0x66, 0x88, 0xdd, 255)
    HAT_WHITE = (0xff, 0xff, 0xff, 255)
    HAT_SHADE = (0xcc, 0xcc, 0xee, 255)
    HAT_BAND = (0x22, 0x44, 0x88, 255)

    img = new_canvas()
    px = img.load()
    colored = set()

    def paint(x, y, c):
        put(px, x, y, c)
        colored.add((x, y))

    # 하트 (하단) — 고전 픽셀아트 하트. 16x13 정도.
    heart_rows = [
        # y, (list of (xl, xr) pairs) — 양 로브를 위해 두 구간
        (17, [(9, 13), (18, 22)]),
        (18, [(8, 14), (17, 23)]),
        (19, [(8, 23)]),
        (20, [(8, 23)]),
        (21, [(9, 22)]),
        (22, [(10, 21)]),
        (23, [(11, 20)]),
        (24, [(12, 19)]),
        (25, [(13, 18)]),
        (26, [(14, 17)]),
        (27, [(15, 16)]),
    ]
    for (y, intervals) in heart_rows:
        for (xl, xr) in intervals:
            for x in range(xl, xr + 1):
                paint(x, y, HEART)

    # 하트 음영 (우측 하단)
    shade_pixels = [
        (22, 20), (21, 21), (20, 22), (19, 23),
        (18, 24), (17, 25), (16, 26),
    ]
    for (x, y) in shade_pixels:
        paint(x, y, HEART_SHADE)

    # 셰프 모자 (상단) — 부푼 머리 + 밴드.
    # 머리(둥근 부풀림)
    hat_top_rows = [
        (4, [(13, 18)]),
        (5, [(11, 20)]),
        (6, [(10, 21)]),
        (7, [(10, 21)]),
        (8, [(11, 20)]),
    ]
    for (y, intervals) in hat_top_rows:
        for (xl, xr) in intervals:
            for x in range(xl, xr + 1):
                paint(x, y, HAT_WHITE)
    # 모자 머리 음영
    for (x, y) in [(19, 5), (20, 6), (20, 7), (19, 8)]:
        paint(x, y, HAT_SHADE)

    # 모자 몸통(좁은 기둥)
    for y in range(9, 13 + 1):
        for x in range(12, 19 + 1):
            paint(x, y, HAT_WHITE)
    # 밴드 (상단 파랑 두께 2줄)
    for y in (12, 13):
        for x in range(12, 19 + 1):
            paint(x, y, HAT_BAND)

    # 모자와 하트 사이 연결 여백은 자연스럽게 두되, 외곽선이 이어지도록 살짝 겹치게 배치됨.

    outline_pixels(img, colored)
    return img


# ── 4. Blessing (미력의 축복) : 물방울 + 광배 ─────────────────────────

def draw_blessing():
    """금색 물방울 + 원형 광배.
    키컬러: #ffee88 (물방울 내부), #ffcc00 (테두리 내측), #ffaa00 (광환), #cc8800 (외측 어둡게)
    """
    DROP_CORE = (0xff, 0xee, 0x88, 255)
    DROP_MID = (0xff, 0xcc, 0x00, 255)
    DROP_SHADE = (0xcc, 0x88, 0x00, 255)
    HALO = (0xff, 0xaa, 0x00, 255)
    HIGHLIGHT = (0xff, 0xff, 0xff, 255)

    img = new_canvas()
    px = img.load()
    colored = set()

    def paint(x, y, c):
        put(px, x, y, c)
        colored.add((x, y))

    # 원형 광배 (반지름 14 원) — 물방울 뒤에 먼저 그린 뒤 물방울로 덮는다.
    cx, cy = 16, 17
    halo_r = 13
    for y in range(SIZE):
        for x in range(SIZE):
            dx, dy = x - cx, y - cy
            d2 = dx * dx + dy * dy
            if halo_r * halo_r - 8 <= d2 <= halo_r * halo_r:
                # 원주 근처만 링 형태
                paint(x, y, HALO)

    # 광배의 4방 키라 효과(윗/좌/우/아래 작은 반짝임)
    for (x, y) in [(16, 2), (16, 31), (2, 17), (29, 17)]:
        paint(x, y, HIGHLIGHT)

    # 물방울 (중앙). 상단 뾰족 → 하단 둥근 원.
    drop_rows = [
        (8, [(16, 16)]),
        (9, [(15, 17)]),
        (10, [(14, 18)]),
        (11, [(13, 19)]),
        (12, [(12, 20)]),
        (13, [(11, 21)]),
        (14, [(11, 21)]),
        (15, [(10, 22)]),
        (16, [(10, 22)]),
        (17, [(10, 22)]),
        (18, [(10, 22)]),
        (19, [(11, 21)]),
        (20, [(11, 21)]),
        (21, [(12, 20)]),
        (22, [(13, 19)]),
        (23, [(15, 17)]),
    ]
    for (y, intervals) in drop_rows:
        for (xl, xr) in intervals:
            for x in range(xl, xr + 1):
                paint(x, y, DROP_MID)

    # 내부 밝은 코어
    core_rows = [
        (12, [(15, 17)]),
        (13, [(14, 18)]),
        (14, [(13, 19)]),
        (15, [(13, 19)]),
        (16, [(12, 20)]),
        (17, [(13, 19)]),
        (18, [(13, 19)]),
        (19, [(14, 18)]),
        (20, [(15, 17)]),
    ]
    for (y, intervals) in core_rows:
        for (xl, xr) in intervals:
            for x in range(xl, xr + 1):
                paint(x, y, DROP_CORE)

    # 상단 흰 반사(작은 하이라이트)
    for (x, y) in [(14, 12), (15, 11), (14, 11)]:
        paint(x, y, HIGHLIGHT)

    # 우하단 그림자
    for (x, y) in [(20, 19), (20, 20), (19, 21), (18, 22), (21, 18)]:
        paint(x, y, DROP_SHADE)

    outline_pixels(img, colored)
    return img


# ── 메인 실행 ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    save(draw_mutation(), "branch_badge_mutation.png")
    save(draw_recipe(),   "branch_badge_recipe.png")
    save(draw_bond(),     "branch_badge_bond.png")
    save(draw_blessing(), "branch_badge_blessing.png")
    print("분기 카드 배지 아이콘 4종 생성 완료.")
