"""
portrait 6종 일괄 생성 스크립트
SD Forge Counterfeit V3 / 메이지 스타일 통일
"""
import requests, json, base64, io, sys
from PIL import Image
import numpy as np

SD_API = "http://192.168.219.100:7860/sdapi/v1/txt2img"
OUT_DIR = "C:/antigravity/kitchen-chaos/assets/portraits"

BASE_POS = "(masterpiece, best quality, official art), cute chibi anime style, bust portrait, white background, simple background, soft anime shading, big round eyes, detailed cute face, clean lineart, 2d illustration, smile"
BASE_NEG = "nsfw, bad quality, worst quality, low quality, blurry, realistic, 3d, photo, dark background, complex background, full body, chibi body, lowres, bad anatomy, bad hands, multiple views"

CHARACTERS = [
    {
        "id": "mimi",
        "prompt": f"{BASE_POS}, 1girl, black short bob haircut, green chef apron over white dress shirt, small white chef hat, cheerful protagonist chef, green accent colors",
        "negative": BASE_NEG,
    },
    {
        "id": "rin",
        "prompt": f"{BASE_POS}, 1girl, short spiky red orange hair, red bandana around neck, fiery energetic expression, red and orange color scheme, flame motif chef",
        "negative": BASE_NEG,
    },
    {
        "id": "yuki",
        "prompt": f"{BASE_POS}, 1girl, long light blue hair, ice crystal hair ornament, gentle calm expression, pale blue and white color scheme, snowflake motif chef, soft gentle smile",
        "negative": BASE_NEG,
    },
    {
        "id": "lao",
        "prompt": f"{BASE_POS}, 1boy, black hair tied back, orange chinese-style chef jacket, dragon embroidery on collar, calm confident expression, warm orange color scheme",
        "negative": BASE_NEG,
    },
    {
        "id": "andre",
        "prompt": f"{BASE_POS}, 1boy, dark wavy hair, elegant gold and white chef coat, croissant or bread motif, charming smile, European pastry chef, golden color scheme",
        "negative": BASE_NEG,
    },
    {
        "id": "arjun",
        "prompt": f"{BASE_POS}, 1boy, orange turban, short beard, warm dark skin, Indian spice chef, colorful spice motif on outfit, friendly confident smile, orange and saffron color scheme",
        "negative": BASE_NEG,
    },
]

def remove_white_bg(img_bytes):
    img = Image.open(io.BytesIO(img_bytes)).convert("RGBA")
    arr = np.array(img)
    mask = (arr[:, :, 0] > 240) & (arr[:, :, 1] > 240) & (arr[:, :, 2] > 240)
    arr[mask, 3] = 0
    return Image.fromarray(arr)

def generate(char):
    print(f"[{char['id']}] 생성 중...", flush=True)
    payload = {
        "prompt": char["prompt"],
        "negative_prompt": char["negative"],
        "width": 512,
        "height": 512,
        "steps": 28,
        "cfg_scale": 7.5,
        "sampler_name": "DPM++ 2M Karras",
        "seed": -1,
        "batch_size": 1,
        "override_settings": {
            "sd_model_checkpoint": "counterfeitV30_v30.safetensors [cbfba64e66]"
        }
    }
    resp = requests.post(SD_API, json=payload, timeout=120)
    resp.raise_for_status()
    data = resp.json()
    img_b64 = data["images"][0]
    img_bytes = base64.b64decode(img_b64)

    # 배경 제거
    result = remove_white_bg(img_bytes)
    out_path = f"{OUT_DIR}/portrait_{char['id']}.png"
    result.save(out_path, "PNG")
    print(f"[{char['id']}] 저장 완료: {out_path}", flush=True)
    return out_path

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "all"
    chars = CHARACTERS if target == "all" else [c for c in CHARACTERS if c["id"] == target]
    for char in chars:
        try:
            generate(char)
        except Exception as e:
            print(f"[{char['id']}] 오류: {e}", flush=True)
    print("완료")
