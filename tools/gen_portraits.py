"""
portrait 생성 스크립트 - Phase 58
SD Forge Counterfeit V3 / 메이지 스타일 통일
img2img 모드: 미미 구도를 레퍼런스로 사용하여 얼굴 크기/비율 통일
"""
import requests, base64, io, sys
from PIL import Image, ImageDraw, ImageChops

SD_TXT2IMG = "http://192.168.219.100:7860/sdapi/v1/txt2img"
SD_IMG2IMG  = "http://192.168.219.100:7860/sdapi/v1/img2img"
OUT_DIR     = "C:/antigravity/kitchen-chaos/assets/portraits"

# ── 공통 프롬프트 ──
BASE_POS = (
    "(masterpiece, best quality, official art), cute chibi anime style, "
    "(upper body portrait:1.3), white background, simple background, "
    "soft anime shading, big round eyes, detailed cute face, clean lineart, "
    "2d illustration, smile, centered composition, "
    "face and upper torso visible, waist up, looking at viewer"
)
BASE_NEG = (
    "nsfw, bad quality, worst quality, low quality, blurry, realistic, 3d, photo, "
    "dark background, complex background, chibi body, lowres, "
    "bad anatomy, bad hands, multiple views, "
    "extreme close-up, head only, face only, shoulders only, cropped at neck, off-center"
)
NO_BG_DECO = (
    "circular frame, circle background, ornamental background, decorative frame, "
    "frame border, badge shape, emblem, halo, pattern background, "
    "background illustration, background art, gradient circle, colored background, "
    "yellow background, orange background, gradient background, background color, "
    "shadow on background, any background except pure white"
)

CHARACTERS = [
    {
        "id": "mimi",
        "prompt": f"{BASE_POS}, (pure white background:1.5), 1girl, (black hair:1.5), short bob haircut, green chef apron over white dress shirt, small white chef hat, cheerful protagonist chef",
        "negative": f"{BASE_NEG}, {NO_BG_DECO}, green hair, colored hair",
        "txt2img": True,
    },
    {
        "id": "rin",
        "prompt": f"{BASE_POS}, (pure white background:1.5), 1girl, short spiky red orange hair, red bandana around neck, fiery energetic expression, red and orange color scheme, flame motif chef",
        "negative": f"{BASE_NEG}, {NO_BG_DECO}",
    },
    {
        "id": "yuki",
        "prompt": f"{BASE_POS}, (pure white background:1.5), 1girl, medium length light blue hair, ice crystal hair ornament, gentle calm expression, pale blue and white color scheme, snowflake motif chef, soft gentle smile",
        "negative": f"{BASE_NEG}, {NO_BG_DECO}, very long hair, hair below waist",
    },
    {
        "id": "lao",
        "prompt": f"{BASE_POS}, (pure white background:1.5), (1boy:1.5), adult male, masculine face, black hair tied back in ponytail, (orange chinese chef jacket:1.3), red collar trim, calm confident expression, warm orange and red color scheme, male chef",
        "negative": f"{BASE_NEG}, {NO_BG_DECO}, girl, female, woman, feminine",
    },
    {
        "id": "andre",
        "prompt": f"{BASE_POS}, (pure white background:1.5), (1boy:1.5), adult male, masculine face, short dark brown wavy hair, elegant gold and white chef coat, charming confident smile, European pastry chef, golden color scheme, male character",
        "negative": f"{BASE_NEG}, {NO_BG_DECO}, girl, female, woman, feminine, long hair, blonde",
    },
    {
        "id": "arjun",
        "prompt": f"{BASE_POS}, (pure white background:1.5), 1boy, (orange dastar turban:1.4), short dark beard, warm dark skin, Indian spice chef, friendly confident smile, orange and saffron chef uniform",
        "negative": f"{BASE_NEG}, {NO_BG_DECO}, no turban, bare head, headband only",
    },
    {
        "id": "mage",
        "prompt": f"{BASE_POS}, (pure white background:1.5), 1girl, short wavy purple hair, round glasses, cute mage chef outfit with star motifs, soft lavender and white color scheme, gentle cheerful smile",
        "negative": f"{BASE_NEG}, {NO_BG_DECO}",
    },
    {
        "id": "poco",
        "prompt": f"(masterpiece, best quality, official art), cute chibi anime style, (upper body portrait:1.3), (pure white background:1.5), simple background, soft anime shading, clean lineart, 2d illustration, centered composition, (cat girl:1.3), nekomimi, (two pointy cat ears symmetrically on top of head:1.7), (ears not hidden by hair:1.5), short bob pink hair that does not cover ears, big expressive blue eyes, pink scarf, cute small vest, charming mischievous smile, waist up, directly facing viewer, front facing",
        "negative": f"{BASE_NEG}, {NO_BG_DECO}, human only, no cat ears, full body, (one ear hidden:1.5), (ear covered by hair:1.5), side view, profile, asymmetrical, long hair covering ears",
    },
]


def get_mimi_ref_b64():
    """미미 포트레이트를 흰 배경으로 합성 후 base64 반환 (img2img 레퍼런스용)"""
    mimi = Image.open(f"{OUT_DIR}/portrait_mimi.png").convert("RGBA")
    bg = Image.new("RGBA", mimi.size, (255, 255, 255, 255))
    bg.paste(mimi, mask=mimi.split()[3])
    buf = io.BytesIO()
    bg.convert("RGB").save(buf, "PNG")
    return base64.b64encode(buf.getvalue()).decode()


def remove_bg(img_bytes):
    """rembg AI 배경 제거"""
    from rembg import remove as rembg_remove
    result = rembg_remove(img_bytes)
    return Image.open(io.BytesIO(result)).convert("RGBA")


def apply_bottom_fade(img_rgba, fade_start=0.83, fade_end=0.97):
    """하단 그라디언트 페이드 - 얼굴 아래 어깨/가슴 영역만 페이드"""
    w, h = img_rgba.size
    r, g, b, a = img_rgba.split()

    mask = Image.new("L", (w, h), 255)
    draw = ImageDraw.Draw(mask)
    y_start = int(h * fade_start)
    y_end   = int(h * fade_end)
    for y in range(y_start, h):
        val = 0 if y >= y_end else int(255 * (1.0 - (y - y_start) / (y_end - y_start)))
        draw.line([(0, y), (w - 1, y)], fill=val)

    combined = ImageChops.multiply(a, mask)
    img_rgba.putalpha(combined)
    return img_rgba


def generate(char, mimi_ref_b64=None):
    cid = char["id"]
    print(f"[{cid}] 생성 중...", flush=True)

    use_txt2img = char.get("txt2img", False) or mimi_ref_b64 is None

    # 모든 캐릭터 txt2img (img2img는 색상 번짐 문제로 제외)
    payload = {
        "prompt": char["prompt"],
        "negative_prompt": char["negative"],
        "width": 512, "height": 512,
        "steps": 28, "cfg_scale": 7.5,
        "sampler_name": "DPM++ 2M Karras",
        "seed": -1, "batch_size": 1,
        "override_settings": {
            "sd_model_checkpoint": "counterfeitV30_v30.safetensors [cbfba64e66]"
        }
    }
    url = SD_TXT2IMG

    resp = requests.post(url, json=payload, timeout=120)
    resp.raise_for_status()
    img_bytes = base64.b64decode(resp.json()["images"][0])

    # 배경 제거 + 하단 페이드
    result = remove_bg(img_bytes)
    result = apply_bottom_fade(result)

    out_path = f"{OUT_DIR}/portrait_{cid}.png"
    result.save(out_path, "PNG")
    print(f"[{cid}] 저장: {out_path}", flush=True)
    return out_path


if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "all"
    chars = CHARACTERS if target == "all" else [c for c in CHARACTERS if c["id"] == target]

    # 미미 레퍼런스 로드 (미미 자신은 txt2img라 불필요하지만 다른 캐릭터에 사용)
    mimi_ref = None
    if any(not c.get("txt2img") for c in chars):
        try:
            mimi_ref = get_mimi_ref_b64()
            print("미미 레퍼런스 로드 완료", flush=True)
        except Exception as e:
            print(f"미미 레퍼런스 로드 실패 ({e}) → txt2img 모드로 진행", flush=True)

    for char in chars:
        try:
            generate(char, mimi_ref)
        except Exception as e:
            print(f"[{char['id']}] 오류: {e}", flush=True)
    print("완료")
