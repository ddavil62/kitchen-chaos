#!/bin/bash
# Phase 47-3: 일반 적 41종 falling-back-death 애니메이션 다운로드 + 배치
# 각 캐릭터 ZIP에서 falling_backward-* 폴더의 south/north/east/west 방향만 추출

set -e

ASSETS_DIR="$(dirname "$0")/../assets/enemies"
TMP_DIR="/tmp/phase47_3_death"
mkdir -p "$TMP_DIR"

declare -A ENEMIES=(
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
  ["sushi_ninja"]="c4476864-ec20-40d0-83d6-0c698cb20e3a"
  ["tempura_monk"]="0ab7dcb6-9039-494d-9a6b-aee27412e0b9"
  ["dumpling_warrior"]="ad639a19-0c36-460e-aff0-339390c06f6f"
  ["mini_dumpling"]="a3124b91-4d3d-4e02-b551-ed6d35428fbb"
  ["wok_phantom"]="14173553-91f3-4e76-b7d5-4aec5a1572b8"
  ["sake_specter"]="efe5d25a-2930-4ffb-952b-2fd3ac3b4a6e"
  ["oni_minion"]="9cbea71e-78a5-4367-a10b-35e696025cad"
  ["shadow_dragon_spawn"]="08983815-9751-476a-90b6-b5f6a8ee8802"
  ["wok_guardian"]="9c33ea4c-e9b0-4fe3-a09c-5dc97400e416"
  ["wine_specter"]="221fb5e7-b66b-4234-90ab-0ec90d92842f"
  ["foie_gras_knight"]="0099975d-6266-487b-985a-7bed0f001b1d"
  ["cellar_phantom"]="f4f05c85-4b09-4470-b2e0-93bd8c8be3af"
  ["sommelier_wraith"]="2e8136ec-abff-4d93-b738-d0970170b3d3"
  ["curry_djinn"]="b4121df4-8d19-454f-8f9c-bdede689ea17"
  ["naan_golem"]="bca2435b-2463-4a8b-a583-536602d15fb4"
  ["incense_specter"]="7591ad60-0a68-487a-b4c5-9e1f0eec7a76"
  ["spice_elemental"]="f66e0679-9502-4d71-be3c-f83f2cf3b509"
  ["masala_guide"]="dff7a45a-b971-4ddb-a15f-33b1b42f6ec2"
  ["taco_bandit"]="27728028-c6b9-4735-95ba-2aa35848022f"
  ["burrito_juggernaut"]="72a14f20-c8b6-40f4-ad23-d9d50545bf08"
  ["cactus_wraith"]="7f7a69df-01ff-493e-9ade-e616fb9b9174"
  ["luchador_ghost"]="fbc217b5-533d-4823-ab09-82eb1e595127"
  ["candy_soldier"]="e2852138-49f1-46eb-b402-154ffdd00f98"
  ["cake_witch"]="33b9b6c9-c9cb-4318-9f71-68cd7078029d"
  ["macaron_knight"]="b2e798bf-ee02-461d-80f0-2900b825da7a"
  ["sugar_specter"]="45090305-b9c7-4358-a69d-269a9e79dce6"
)

HASH_LOG="$TMP_DIR/hashes.txt"
> "$HASH_LOG"

DEATH_DIRS=("south" "north" "east" "west")

echo "=== Phase 47-3: Death Animation Download ==="
echo "Total: ${#ENEMIES[@]} enemies"
echo ""

process_enemy() {
  local name=$1
  local id=$2
  local zip="$TMP_DIR/${name}.zip"
  local extract="$TMP_DIR/extract_${name}"

  echo -n "  [$name] Downloading..."
  curl --fail -sL "https://api.pixellab.ai/mcp/characters/${id}/download" -o "$zip" 2>/dev/null
  if [ $? -ne 0 ] || [ ! -f "$zip" ] || [ $(stat -c%s "$zip" 2>/dev/null || stat -f%z "$zip" 2>/dev/null) -lt 1024 ]; then
    echo " FAILED (download error or still processing)"
    rm -f "$zip"
    echo "${name}=FAILED" >> "$HASH_LOG"
    return 1
  fi
  echo -n " OK. Extracting..."

  rm -rf "$extract"
  mkdir -p "$extract"
  unzip -q "$zip" -d "$extract" 2>/dev/null

  # falling_backward-* 폴더 찾기
  local death_folder
  death_folder=$(find "$extract/animations" -maxdepth 1 -type d -name "falling_backward-*" 2>/dev/null | head -1)
  if [ -z "$death_folder" ]; then
    echo " FAILED (no falling_backward folder found)"
    echo "${name}=NO_FOLDER" >> "$HASH_LOG"
    return 1
  fi

  local hash
  hash=$(basename "$death_folder")
  echo -n " hash=$hash. Placing..."

  local dest="$ASSETS_DIR/${name}/animations/${hash}"
  for dir in "${DEATH_DIRS[@]}"; do
    local src_dir="$death_folder/$dir"
    if [ -d "$src_dir" ]; then
      mkdir -p "$dest/$dir"
      cp "$src_dir"/frame_*.png "$dest/$dir/" 2>/dev/null
    else
      echo " WARN: missing dir $dir"
    fi
  done

  echo " DONE ($hash)"
  echo "${name}=${hash}" >> "$HASH_LOG"
  rm -f "$zip"
  rm -rf "$extract"
}

# 순차 처리 (HTTP 요청 병렬화 불필요)
for name in "${!ENEMIES[@]}"; do
  process_enemy "$name" "${ENEMIES[$name]}" || true
done

echo ""
echo "=== Download Complete ==="
echo "Hash map (for ENEMY_DEATH_HASHES):"
cat "$HASH_LOG"
