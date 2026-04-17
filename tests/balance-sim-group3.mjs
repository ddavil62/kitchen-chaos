/**
 * @fileoverview Kitchen Chaos 그룹3(16~24장) 밸런스 시뮬레이션 스크립트.
 * Phase 39-1: 적 HP 총량 곡선, 이상치 탐지, 보스 검증, 그룹2 연속성 확인.
 *
 * 실행: cd kitchen-chaos && node tests/balance-sim-group3.mjs
 */

import { STAGES, STAGE_ORDER } from '../js/data/stageData.js';
import { ENEMY_TYPES } from '../js/data/gameData.js';

// ── 보조 HP 테이블: ENEMY_TYPES에 누락된 적 (그룹2 이행 적 등) ──
// ROADMAP.md 기준값 + stageData에서 사용되는 적 중 gameData에 미등록된 항목
const FALLBACK_HP = {
  cellar_phantom:    400,   // ROADMAP ~400
  sommelier_wraith:  380,   // ROADMAP ~380
  chef_noir:         9000,  // 15-6 boss (stageData에 인라인 정의)
};

// ── 유효 HP 계산 (특수 메카닉 보정) ──

/**
 * 적 타입 ID로 base HP를 조회한다.
 * @param {string} type - 적 타입 ID
 * @returns {number} base HP
 */
function getBaseHp(type) {
  const enemy = ENEMY_TYPES[type];
  if (enemy) return enemy.hp;
  if (FALLBACK_HP[type]) return FALLBACK_HP[type];
  return 0;
}

/**
 * 적 1마리의 유효 HP를 계산한다 (특수 메카닉 보정 포함).
 * @param {string} type - 적 타입 ID
 * @returns {number} 유효 HP
 */
function getEffectiveHp(type) {
  const enemy = ENEMY_TYPES[type];
  const baseHp = getBaseHp(type);
  if (!enemy || baseHp === 0) return baseHp;

  let effectiveHp = baseHp;

  // 회피 (dodgeOnHit): 유효 HP = HP / (1 - dodgeChance)
  if (enemy.dodgeOnHit && enemy.dodgeChance) {
    effectiveHp = effectiveHp / (1 - enemy.dodgeChance);
  }

  // 피해 감소 (damageReduction): 유효 HP = HP / (1 - damageReduction)
  if (enemy.damageReduction) {
    effectiveHp = effectiveHp / (1 - enemy.damageReduction);
  }

  // 마법 저항 (magicResistance): 유효 HP x 1.3 근사 (전체 타워 중 마법 계열 비율 고려)
  if (enemy.magicResistance) {
    effectiveHp = effectiveHp * 1.3;
  }

  // 전방 방어 (shieldFrontHeavy): 유효 HP x 1.4 근사 (전면 피격 비율 약 60% 가정)
  if (enemy.shieldFrontHeavy) {
    effectiveHp = effectiveHp * (1 + enemy.shieldFrontHeavy * 0.6);
  }

  // 분열 사망 (splitOnDeath): 원본 HP + 소형체 HP x count
  if (enemy.splitOnDeath) {
    const miniHp = baseHp * enemy.splitOnDeath.hpRatio;
    effectiveHp += miniHp * enemy.splitOnDeath.count;
  }

  return Math.round(effectiveHp);
}

// ── 그룹3 스테이지 범위 ──
// 15-6 (그룹2 마지막) + 16-1~24-6 (그룹3 전체)
const GROUP3_START = '15-6';  // 연속성 비교용
const GROUP3_STAGES = [];

// 15-6을 먼저 추가 (연속성 참조용)
GROUP3_STAGES.push('15-6');

// 16-1 ~ 24-6
for (let ch = 16; ch <= 24; ch++) {
  for (let st = 1; st <= 6; st++) {
    GROUP3_STAGES.push(`${ch}-${st}`);
  }
}

// ── 스테이지 분석 ──

/**
 * @typedef {object} StageResult
 * @property {string} id
 * @property {number} waveCount
 * @property {number} enemyCount
 * @property {number} totalHp
 * @property {number} goldReward
 * @property {boolean} isBoss
 * @property {string} bossType
 * @property {boolean} isPlaceholder
 */

/**
 * 스테이지 데이터를 분석하여 HP 총량과 골드 보상을 계산한다.
 * @param {string} stageId - 스테이지 ID
 * @returns {StageResult}
 */
function analyzeStage(stageId) {
  const stage = STAGES[stageId];
  if (!stage || stage.theme === 'placeholder') {
    return {
      id: stageId,
      waveCount: 0,
      enemyCount: 0,
      totalHp: 0,
      goldReward: 0,
      isBoss: false,
      bossType: '-',
      isPlaceholder: true,
    };
  }

  let totalHp = 0;
  let totalEnemies = 0;

  for (const wave of stage.waves) {
    for (const eg of wave.enemies) {
      const effHp = getEffectiveHp(eg.type);
      if (effHp === 0) {
        console.warn(`  [WARN] 미등록 적 타입: ${eg.type} (스테이지 ${stageId})`);
        continue;
      }

      const enemy = ENEMY_TYPES[eg.type];
      const isBossEnemy = enemy?.isBoss;

      if (isBossEnemy) {
        // 보스는 1마리 기준
        totalHp += effHp;
        totalEnemies += eg.count;
      } else {
        totalHp += effHp * eg.count;
        totalEnemies += eg.count;
      }
    }
  }

  // 골드 보상 총량: customers 배열의 baseReward 합산
  let goldReward = 0;
  if (stage.customers) {
    for (const waveCustomers of stage.customers) {
      if (waveCustomers.customers) {
        for (const c of waveCustomers.customers) {
          goldReward += c.baseReward || 0;
        }
      }
    }
  }

  // 보스 판별
  const isBoss = !!stage.isBossBattle || !!stage.bossStage ||
    stage.waves.some(w => w.enemies.some(e => ENEMY_TYPES[e.type]?.isBoss));
  const bossType = stage.bossType || stage.boss?.type ||
    (isBoss ? stage.waves.flatMap(w => w.enemies).find(e => ENEMY_TYPES[e.type]?.isBoss)?.type : null) || '-';

  return {
    id: stageId,
    waveCount: stage.waves.length,
    enemyCount: totalEnemies,
    totalHp,
    goldReward,
    isBoss,
    bossType,
    isPlaceholder: false,
  };
}

// ── 메인 실행 ──

console.log('='.repeat(72));
console.log('  Kitchen Chaos Tycoon -- 그룹3 밸런스 시뮬레이션 (Phase 39-1)');
console.log('='.repeat(72));

const results = [];
const unknownTypes = new Set();

for (const stageId of GROUP3_STAGES) {
  const result = analyzeStage(stageId);
  results.push(result);
}

// ── 출력 1: 스테이지별 HP/골드 표 ──

console.log('\n--- 스테이지별 HP 총량 / 골드 보상 ---');
console.log(
  'Stage'.padEnd(8) + ' | ' +
  'Wave'.padStart(4) + ' | ' +
  'Enemies'.padStart(7) + ' | ' +
  'Total HP'.padStart(12) + ' | ' +
  'Change%'.padStart(8) + ' | ' +
  'Gold'.padStart(8) + ' | ' +
  'Boss'.padStart(20) + ' | ' +
  'Verdict'
);
console.log('-'.repeat(90));

let prevHp = 0;
let prevNonBossResult = null;
const warnings = [];

for (const r of results) {
  if (r.isPlaceholder) {
    console.log(`${r.id.padEnd(8)} | ${'PLACEHOLDER -- 미구현'.padStart(70)}`);
    continue;
  }

  const changeStr = prevHp > 0
    ? ((r.totalHp / prevHp - 1) * 100).toFixed(1) + '%'
    : '-';
  const changeVal = prevHp > 0 ? (r.totalHp / prevHp - 1) * 100 : 0;

  // 판정 기준
  let verdict = 'OK';
  const isFirst = r.id === '15-6';

  // WARN: 변화율 절대값 > 30% (첫 스테이지와 placeholder 다음 제외)
  if (!isFirst && prevHp > 0 && Math.abs(changeVal) > 30) {
    verdict = 'WARN';
    warnings.push({
      stage: r.id,
      reason: `HP 변화율 ${changeVal > 0 ? '+' : ''}${changeVal.toFixed(1)}% (기준: +-30%)`,
      prevHp,
      curHp: r.totalHp,
    });
  }

  // 보스 검증: 직전 일반 스테이지 HP의 2~5배 범위
  if (r.isBoss && prevNonBossResult) {
    const ratio = r.totalHp / prevNonBossResult.totalHp;
    if (ratio < 2.0 || ratio > 5.0) {
      verdict = 'WARN';
      warnings.push({
        stage: r.id,
        reason: `보스 HP 비율 ${ratio.toFixed(2)}x (기준: 2.0~5.0x, 기준 스테이지: ${prevNonBossResult.id})`,
        prevHp: prevNonBossResult.totalHp,
        curHp: r.totalHp,
      });
    }
  }

  console.log(
    `${r.id.padEnd(8)} | ` +
    `${String(r.waveCount).padStart(4)} | ` +
    `${String(r.enemyCount).padStart(7)} | ` +
    `${String(r.totalHp).padStart(12)} | ` +
    `${changeStr.padStart(8)} | ` +
    `${String(r.goldReward).padStart(8)} | ` +
    `${(r.isBoss ? r.bossType : '-').padStart(20)} | ` +
    `${verdict}`
  );

  prevHp = r.totalHp;
  if (!r.isBoss && !r.isPlaceholder) {
    prevNonBossResult = r;
  }
}

// ── 출력 2: 그룹2 연속성 확인 ──

console.log('\n--- 그룹2 -> 그룹3 연속성 확인 ---');
const stage15_6 = results.find(r => r.id === '15-6');
const stage16_1 = results.find(r => r.id === '16-1');
if (stage15_6 && stage16_1 && !stage16_1.isPlaceholder) {
  const ratio = (stage16_1.totalHp / stage15_6.totalHp * 100).toFixed(1);
  const changeRatio = ((stage16_1.totalHp / stage15_6.totalHp - 1) * 100).toFixed(1);
  console.log(`  15-6 HP: ${stage15_6.totalHp.toLocaleString()}`);
  console.log(`  16-1 HP: ${stage16_1.totalHp.toLocaleString()}`);
  console.log(`  비율: ${ratio}% (변화: ${changeRatio > 0 ? '+' : ''}${changeRatio}%)`);
  if (Math.abs(parseFloat(changeRatio)) > 30) {
    console.log(`  [WARN] 그룹 전환 시 HP 점프가 +-30% 초과`);
  } else {
    console.log(`  [OK] 그룹 전환 연속성 양호`);
  }
}

// ── 출력 3: 보스 스테이지 검증 ──

console.log('\n--- 보스 스테이지 검증 (18-6, 21-6, 24-6) ---');
const bossStages = ['18-6', '21-6', '24-6'];
for (const bossId of bossStages) {
  const bossResult = results.find(r => r.id === bossId);
  if (!bossResult || bossResult.isPlaceholder) {
    console.log(`  ${bossId}: PLACEHOLDER -- 건너뜀`);
    continue;
  }

  // 직전 일반 스테이지 찾기 (-1 번호)
  const ch = parseInt(bossId.split('-')[0]);
  const prevStageId = `${ch}-5`;
  const prevResult = results.find(r => r.id === prevStageId);

  if (prevResult && !prevResult.isPlaceholder) {
    const ratio = (bossResult.totalHp / prevResult.totalHp).toFixed(2);
    console.log(`  ${bossId} (${bossResult.bossType}): HP ${bossResult.totalHp.toLocaleString()} / ${prevStageId} HP ${prevResult.totalHp.toLocaleString()} = ${ratio}x`);
    if (parseFloat(ratio) < 2.0) {
      console.log(`    [WARN] 보스 HP 비율이 2.0x 미만 -- 너무 쉬움`);
    } else if (parseFloat(ratio) > 5.0) {
      console.log(`    [WARN] 보스 HP 비율이 5.0x 초과 -- 너무 어려움`);
    } else {
      console.log(`    [OK] 보스 HP 비율 정상 범위 (2.0~5.0x)`);
    }
  }
}

// ── 출력 4: WARN 이상치 목록 ──

console.log('\n--- WARN 이상치 목록 ---');
if (warnings.length === 0) {
  console.log('  이상치 없음 -- 모든 스테이지 정상 범위');
} else {
  for (const w of warnings) {
    console.log(`  [WARN] ${w.stage}: ${w.reason}`);
    console.log(`         이전 HP: ${w.prevHp.toLocaleString()} -> 현재 HP: ${w.curHp.toLocaleString()}`);
  }
}

// ── 출력 5: 적 타입별 HP 테이블 (검증용) ──

console.log('\n--- 적 타입별 유효 HP (특수 메카닉 보정 포함) ---');
const allTypes = new Set();
for (const stageId of GROUP3_STAGES) {
  const stage = STAGES[stageId];
  if (!stage || stage.theme === 'placeholder') continue;
  for (const wave of stage.waves) {
    for (const eg of wave.enemies) {
      allTypes.add(eg.type);
    }
  }
}

console.log('Type'.padEnd(24) + ' | ' + 'Base HP'.padStart(8) + ' | ' + 'Eff HP'.padStart(8) + ' | ' + 'Modifiers');
console.log('-'.repeat(70));

for (const type of [...allTypes].sort()) {
  const baseHp = getBaseHp(type);
  const effHp = getEffectiveHp(type);
  const enemy = ENEMY_TYPES[type];
  const mods = [];
  if (enemy?.dodgeOnHit) mods.push(`dodge ${(enemy.dodgeChance * 100).toFixed(0)}%`);
  if (enemy?.damageReduction) mods.push(`dmgRed ${(enemy.damageReduction * 100).toFixed(0)}%`);
  if (enemy?.magicResistance) mods.push(`magicRes ${(enemy.magicResistance * 100).toFixed(0)}%`);
  if (enemy?.shieldFrontHeavy) mods.push(`frontShield ${(enemy.shieldFrontHeavy * 100).toFixed(0)}%`);
  if (enemy?.splitOnDeath) mods.push(`split x${enemy.splitOnDeath.count}`);
  if (enemy?.isBoss) mods.push('BOSS');
  if (!enemy) mods.push('FALLBACK');

  console.log(
    `${type.padEnd(24)} | ` +
    `${String(baseHp).padStart(8)} | ` +
    `${String(effHp).padStart(8)} | ` +
    `${mods.join(', ') || '-'}`
  );
}

console.log('\n' + '='.repeat(72));
console.log('  시뮬레이션 완료');
console.log('='.repeat(72));
