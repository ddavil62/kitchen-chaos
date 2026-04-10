#!/bin/bash
# Kitchen Chaos Phase 9 - PixelLab Asset Download Script
# 모든 캐릭터 ZIP, 타일셋 PNG, 재료 아이콘 PNG를 다운로드한다.

ASSETS_DIR="$(dirname "$0")/assets"
mkdir -p "$ASSETS_DIR"/{enemies,bosses,towers,chefs,tilesets,ingredients}

# ── 일반 적 16종 (ZIP, walk 애니메이션 포함) ──
declare -A ENEMIES=(
  ["carrot_goblin"]="e7a69ba9-9631-4482-9869-743326becf94"
  ["meat_ogre"]="686691d4-4922-4cbb-b1b3-a21d2616c269"
  ["octopus_mage"]="1345b61b-e3be-40ae-9870-5af771e12944"
  ["chili_demon"]="c5367f3f-68a0-4986-9c8e-5aad2684b8c4"
  ["cheese_golem"]="2a35b108-251c-4250-b99a-f7848f4253e3"
  ["flour_ghost"]="89043d7e-de15-4076-a2cb-e3f405402abd"
  ["egg_sprite"]="a147ce0c-adbd-485a-b2fe-e1b05060a37e"
  ["rice_slime"]="07b253e2-5d64-44f6-bbb5-6c8f461e1972"
  ["fish_knight"]="ca7f046e-d457-4380-a4bc-f2b6ee377547"
  ["mushroom_scout"]="8439bb1e-0373-47a7-8211-0a8aa5c56045"
  ["cheese_rat"]="b2a2da18-84fb-4b7d-bb45-04d547bd5e72"
  ["shrimp_samurai"]="113d26e1-f570-4b7f-bc36-f9dc0e656e25"
  ["tomato_bomber"]="c4cd46e0-faa6-4b74-837c-e6e21ef7fa31"
  ["butter_ghost"]="f49f4d0e-79dc-44b3-9bbc-09e56868782e"
  ["sugar_fairy"]="c366c4fd-45f9-4340-942e-469ed2d62cad"
  ["milk_phantom"]="506eb798-3428-4848-8a3f-8367456cfe80"
)

# ── 보스 4종 ──
declare -A BOSSES=(
  ["pasta_boss"]="de0ae71e-8c47-490c-9eab-59765fa16117"
  ["dragon_ramen"]="c8bb1e3f-6226-4b8d-9cb2-b6d4416143ed"
  ["seafood_kraken"]="eff49e68-59e1-4e43-8c91-2b0d0f73761b"
  ["lava_dessert_golem"]="3a6f9202-d5ce-4dab-9d2b-dd89b7a68a44"
)

# ── 타워 6종 ──
declare -A TOWERS=(
  ["pan"]="b5cc356c-5804-4a08-953d-1dc4bb8685c0"
  ["salt"]="c8240cf6-3817-4438-99eb-85fa229f3fcb"
  ["grill"]="05bf89fb-2a17-469a-a24d-34d72021890f"
  ["delivery"]="e614df62-ed99-48e5-8c65-f0106c700fe1"
  ["freezer"]="0f42febc-fefe-4257-8a04-7bfcc425782f"
  ["soup_pot"]="2bbd502e-1382-4c7e-8017-fa12df5af9f9"
)

# ── 셰프 3종 ──
declare -A CHEFS=(
  ["petit_chef"]="d7c3c520-ccca-4c10-ad94-fba36dbb7dee"
  ["flame_chef"]="c035367b-0eeb-449b-9115-3e11f01dd6ab"
  ["ice_chef"]="15b5e80b-1af7-4967-891a-547a09201917"
)

# ── 타일셋 4종 ──
declare -A TILESETS=(
  ["pasta_field"]="8fabafb8-6fff-45ef-ad22-a1634feb3f51"
  ["oriental_bamboo"]="c766c21d-ba1e-4e45-9b02-08c32be84da6"
  ["seafood_beach"]="d3217ae7-b04a-49d9-be2f-c1080fa591f0"
  ["volcano_lava"]="38820cf8-f791-425a-98f1-b92b44724d51"
)

# ── 재료 아이콘 15종 ──
declare -A INGREDIENTS=(
  ["carrot"]="17118900-d972-4f67-86b7-5591765fa109"
  ["meat"]="7a8ccaa0-1c60-498e-b95d-e9fccdb3d0e3"
  ["octopus"]="49c2daef-3daf-4ec7-9cec-1809df2c5311"
  ["chili"]="b1e95c14-7712-40e5-af70-8a68591e505d"
  ["cheese"]="7846426b-d2f0-498a-8225-19ec94193fe9"
  ["flour"]="7fd6165c-26ce-4a3a-88f9-d5c5c8c116d1"
  ["egg"]="14506eb1-0c55-40fb-8900-bfe52286cee9"
  ["rice"]="04ff9f98-85b9-4865-8ed3-c29699722c76"
  ["fish"]="66f7f944-66ed-43e4-a116-b3853790787b"
  ["mushroom"]="94458df8-a6d9-481d-a5b6-f1cad3b6c251"
  ["shrimp"]="e8db0523-b654-42ef-b1f5-9744989bb6aa"
  ["tomato"]="9ad3b370-d9ad-49a2-8aef-2a35dc74e525"
  ["butter"]="17db713b-f23b-40fc-b64d-3a52985bdfda"
  ["sugar"]="5b898df3-04b6-46d9-94bc-e47a48890659"
  ["milk"]="6580a94f-3fee-4082-80e1-f33701f8a5d7"
)

echo "=== Kitchen Chaos Phase 9 Asset Download ==="

# 캐릭터 ZIP 다운로드 함수
download_character() {
  local name=$1
  local id=$2
  local dir=$3
  local out="$dir/${name}.zip"
  if [ -f "$out" ] && [ $(stat -c%s "$out" 2>/dev/null || stat -f%z "$out" 2>/dev/null) -gt 1024 ]; then
    echo "  SKIP $name (already downloaded)"
    return
  fi
  echo "  Downloading $name..."
  curl --fail -sL "https://api.pixellab.ai/mcp/characters/${id}/download" -o "$out" 2>/dev/null
  if [ $? -ne 0 ] || [ ! -f "$out" ] || [ $(stat -c%s "$out" 2>/dev/null || stat -f%z "$out" 2>/dev/null) -lt 1024 ]; then
    echo "  WARN: $name download failed or still processing"
    rm -f "$out"
  fi
}

echo ""
echo "--- Enemies (16) ---"
for name in "${!ENEMIES[@]}"; do
  download_character "$name" "${ENEMIES[$name]}" "$ASSETS_DIR/enemies"
done

echo ""
echo "--- Bosses (4) ---"
for name in "${!BOSSES[@]}"; do
  download_character "$name" "${BOSSES[$name]}" "$ASSETS_DIR/bosses"
done

echo ""
echo "--- Towers (6) ---"
for name in "${!TOWERS[@]}"; do
  download_character "$name" "${TOWERS[$name]}" "$ASSETS_DIR/towers"
done

echo ""
echo "--- Chefs (3) ---"
for name in "${!CHEFS[@]}"; do
  download_character "$name" "${CHEFS[$name]}" "$ASSETS_DIR/chefs"
done

echo ""
echo "--- Tilesets (4) ---"
for name in "${!TILESETS[@]}"; do
  id="${TILESETS[$name]}"
  out="$ASSETS_DIR/tilesets/${name}.png"
  if [ -f "$out" ]; then
    echo "  SKIP $name (already downloaded)"
    continue
  fi
  echo "  Downloading tileset $name..."
  curl --fail -sL "https://api.pixellab.ai/mcp/topdown-tilesets/${id}/download/png" -o "$out" 2>/dev/null
  if [ $? -ne 0 ]; then
    echo "  WARN: $name tileset download failed"
    rm -f "$out"
  fi
done

echo ""
echo "--- Ingredient Icons (15) ---"
for name in "${!INGREDIENTS[@]}"; do
  id="${INGREDIENTS[$name]}"
  out="$ASSETS_DIR/ingredients/${name}.png"
  if [ -f "$out" ]; then
    echo "  SKIP $name (already downloaded)"
    continue
  fi
  echo "  Downloading icon $name..."
  curl --fail -sL "https://api.pixellab.ai/mcp/isometric-tiles/${id}/download" -o "$out" 2>/dev/null
  if [ $? -ne 0 ]; then
    echo "  WARN: $name icon download failed"
    rm -f "$out"
  fi
done

echo ""
echo "=== Download Complete ==="
echo "Assets saved to: $ASSETS_DIR"
ls -la "$ASSETS_DIR"/enemies/ | wc -l
ls -la "$ASSETS_DIR"/bosses/ | wc -l
ls -la "$ASSETS_DIR"/towers/ | wc -l
ls -la "$ASSETS_DIR"/chefs/ | wc -l
ls -la "$ASSETS_DIR"/tilesets/ | wc -l
ls -la "$ASSETS_DIR"/ingredients/ | wc -l
