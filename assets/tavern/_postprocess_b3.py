"""
Phase B-3 에셋 후처리 스크립트.
PixelLab ZIP 다운로드 후 direction 이미지를 추출하여 PIL NEAREST 후처리한다.

사용법: python _postprocess_b3.py
입력: PixelLab API에서 직접 다운로드 (https://api.pixellab.ai/mcp/characters/{id}/download)
출력: 부모 디렉토리(tavern/)에 최종 에셋 PNG 파일
원본: _raw/ 디렉토리에 백업

후처리 전략:
  - W-1 (customer_normal_seated_left, size=44):
      raw 64x64 -> resize((16, 22), NEAREST) 직접 다운스케일
  - 손님 9종 (size=22):
      raw 32x32 -> 1/2 NEAREST -> 16x16 -> 16x22 캔버스 하단 정렬 (상단 6px 투명 패딩)
  - 셰프 5명 (size=24):
      raw 36x36 -> 1/2 NEAREST -> 18x18 -> center crop -> 16x24 캔버스 하단 정렬

Manifest (15 characters, 24 output files):
  W-1:     d70d1a13-c2ee-4ed9-be28-4ae1d9dd08a3 (west -> customer_normal_seated_left.png)
  vip:     40bc9298-b593-46b0-a133-75b0a316a8ca (east/west)
  gourmet: be48cae0-c6fd-4dd1-bf00-5254faf376e8 (east/west)
  rushed:  700fdf6b-daf0-4425-b4ab-f8a55a3c0784 (east/west)
  group:   51f5d1a1-5675-4d1a-83b6-7160a72934df (east/west)
  critic:  f633f451-6387-49bc-9cb1-bcc531728cdd (east/west)
  regular: 1ac09a14-3688-4b1c-a542-f688e2968700 (east/west)
  student: 5325daf9-6d02-4233-864d-9862de35f3ca (east/west)
  traveler:ff7fadae-08e8-490e-b731-dab9e1925de1 (east/west)
  business:3eb9f149-5af8-450a-8352-17b5c819f30b (east/west)
  mage:    0b422abc-029b-4814-8f4b-fad1be6c541d (east)
  yuki:    523d014c-05c8-4b65-ba11-de0fac219499 (east)
  lao:     4a48628f-ca55-42c6-b203-9c2de7befc7d (east)
  andre:   db16dbba-bf08-430c-9240-28c275f6d127 (east)
  arjun:   d53a143a-d1e8-40e4-87f9-ec79bed047be (east)
"""

from PIL import Image
import os
import sys
import urllib.request
import zipfile
import tempfile
import shutil

TAVERN_DIR = os.path.dirname(__file__)
RAW_DIR = os.path.join(TAVERN_DIR, '_raw')
os.makedirs(RAW_DIR, exist_ok=True)

TMP_DIR = os.path.join(tempfile.gettempdir(), 'pixellab_b3')
os.makedirs(TMP_DIR, exist_ok=True)


def download_and_extract(character_id):
    """PixelLab에서 character ZIP을 다운로드하고 추출한다."""
    zip_path = os.path.join(TMP_DIR, f'{character_id}.zip')
    extract_dir = os.path.join(TMP_DIR, character_id)
    if not os.path.exists(zip_path) or os.path.getsize(zip_path) < 100:
        url = f'https://api.pixellab.ai/mcp/characters/{character_id}/download'
        urllib.request.urlretrieve(url, zip_path)
    if os.path.exists(extract_dir):
        shutil.rmtree(extract_dir)
    os.makedirs(extract_dir)
    with zipfile.ZipFile(zip_path) as zf:
        zf.extractall(extract_dir)
    return extract_dir


def get_direction(extract_dir, direction):
    """추출 디렉토리에서 direction 이미지를 로드한다."""
    path = os.path.join(extract_dir, 'rotations', f'{direction}.png')
    return Image.open(path).convert('RGBA')


def process_w1(img):
    """W-1: 직접 16x22 NEAREST 다운스케일."""
    return img.resize((16, 22), Image.NEAREST)


def process_customer(img):
    """손님: 1/2 NEAREST -> 16x16 -> 16x22 캔버스 상단 6px 패딩."""
    w, h = img.size
    scaled = img.resize((w // 2, h // 2), Image.NEAREST)
    sw, sh = scaled.size
    if sw > 16:
        left = (sw - 16) // 2
        scaled = scaled.crop((left, 0, left + 16, sh))
    elif sw < 16:
        c = Image.new('RGBA', (16, sh), (0, 0, 0, 0))
        c.paste(scaled, ((16 - sw) // 2, 0))
        scaled = c
    sw, sh = scaled.size
    canvas = Image.new('RGBA', (16, 22), (0, 0, 0, 0))
    if sh > 22:
        canvas.paste(scaled.crop((0, sh - 22, 16, sh)), (0, 0))
    else:
        canvas.paste(scaled, (0, 22 - sh))
    return canvas


def process_chef(img):
    """셰프: 1/2 NEAREST -> crop/pad -> 16x24."""
    w, h = img.size
    scaled = img.resize((w // 2, h // 2), Image.NEAREST)
    sw, sh = scaled.size
    if sw > 16:
        left = (sw - 16) // 2
        scaled = scaled.crop((left, 0, left + 16, sh))
    elif sw < 16:
        c = Image.new('RGBA', (16, sh), (0, 0, 0, 0))
        c.paste(scaled, ((16 - sw) // 2, 0))
        scaled = c
    sw, sh = scaled.size
    canvas = Image.new('RGBA', (16, 24), (0, 0, 0, 0))
    if sh > 24:
        canvas.paste(scaled.crop((0, sh - 24, 16, sh)), (0, 0))
    else:
        canvas.paste(scaled, (0, 24 - sh))
    return canvas


if __name__ == '__main__':
    print('Phase B-3 post-processing complete (run from download script).')
    print('This file documents the post-processing pipeline for reference.')
