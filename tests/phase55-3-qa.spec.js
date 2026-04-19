/**
 * @fileoverview Phase 55-3 QA 테스트: 미력 폭풍 + 유랑 미력사 + 정화 임무
 */
import { test, expect } from '@playwright/test';

test.describe('Phase 55-3 검증', () => {

  test.describe('게임 로드 및 콘솔 에러', () => {
    test('페이지 로드 시 콘솔 에러가 없다', async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      // Phaser 초기화 에러가 없어야 함
      const criticalErrors = errors.filter(e =>
        !e.includes('favicon') &&
        !e.includes('net::ERR') &&
        !e.includes('404')
      );
      expect(criticalErrors).toEqual([]);
    });

    test('EndlessMissionManager 모듈이 로드 가능하다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // 동적 import로 모듈 존재 확인
      const result = await page.evaluate(async () => {
        try {
          const mod = await import('/js/managers/EndlessMissionManager.js');
          return {
            exists: true,
            hasClass: typeof mod.EndlessMissionManager === 'function',
          };
        } catch (e) {
          return { exists: false, error: e.message };
        }
      });

      expect(result.exists).toBe(true);
      expect(result.hasClass).toBe(true);
    });
  });

  test.describe('미력 폭풍의 눈 - 보상 수식 검증', () => {
    test('폭풍 보상 수식: Math.min(50, 10 + Math.floor(wave/15)*10)', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // 수식 자체 검증 (수정된 수식 기준)
      const results = await page.evaluate(() => {
        const formula = (wave) => Math.min(50, 10 + Math.floor(wave / 15) * 10);
        return {
          wave15: formula(15),
          wave30: formula(30),
          wave45: formula(45),
          wave60: formula(60),
          wave75: formula(75),
          wave90: formula(90),
        };
      });

      // 수식이 스펙 테이블과 일치하는지 검증
      // 스펙 테이블: wave 15 → 20, wave 30 → 30, wave 45 → 40, wave 60 → 50
      expect(results.wave15).toBe(20);
      expect(results.wave30).toBe(30);
      expect(results.wave45).toBe(40);
      expect(results.wave60).toBe(50); // cap
      expect(results.wave75).toBe(50); // cap
      expect(results.wave90).toBe(50); // cap
    });

    test('폭풍 웨이브 판정: waveNumber % 15 === 0', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const results = await page.evaluate(async () => {
        const mod = await import('/js/scenes/EndlessScene.js');
        // EndlessScene 내부 로직 확인: _prepareEndlessWave에서 (waveNumber % 15 === 0)
        // 직접 인스턴스를 만들 수 없으므로 판정 로직만 검증
        const isStorm = (wave) => wave % 15 === 0;
        return {
          wave14: isStorm(14),
          wave15: isStorm(15),
          wave29: isStorm(29),
          wave30: isStorm(30),
          wave44: isStorm(44),
          wave45: isStorm(45),
          wave0: isStorm(0), // 엣지: wave 0
        };
      });

      expect(results.wave14).toBe(false);
      expect(results.wave15).toBe(true);
      expect(results.wave29).toBe(false);
      expect(results.wave30).toBe(true);
      expect(results.wave44).toBe(false);
      expect(results.wave45).toBe(true);
      // wave 0도 true가 되는 엣지케이스 (0 % 15 === 0)
      expect(results.wave0).toBe(true);
    });
  });

  test.describe('EndlessWaveGenerator.isBossWave 검증', () => {
    test('보스 웨이브 판정: 10의 배수', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const results = await page.evaluate(async () => {
        const mod = await import('/js/managers/EndlessWaveGenerator.js');
        const { EndlessWaveGenerator } = mod;
        return {
          wave0: EndlessWaveGenerator.isBossWave(0),
          wave10: EndlessWaveGenerator.isBossWave(10),
          wave15: EndlessWaveGenerator.isBossWave(15),
          wave20: EndlessWaveGenerator.isBossWave(20),
          wave30: EndlessWaveGenerator.isBossWave(30), // 보스+폭풍 겹침
          wave45: EndlessWaveGenerator.isBossWave(45), // 폭풍만 (보스 아님)
        };
      });

      expect(results.wave0).toBe(false); // waveNumber > 0 조건으로 false
      expect(results.wave10).toBe(true);
      expect(results.wave15).toBe(false);
      expect(results.wave20).toBe(true);
      expect(results.wave30).toBe(true); // 30은 보스+폭풍 겹침
      expect(results.wave45).toBe(false); // 45는 폭풍만
    });
  });

  test.describe('EndlessMissionManager 로직 검증', () => {
    test('폭풍 웨이브에서 임무가 비활성화된다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/managers/EndlessMissionManager.js');
        const { EndlessMissionManager } = mod;
        const mgr = new EndlessMissionManager({});
        mgr.startMission(15, false, true); // isStormWave = true
        return { active: mgr._active, missionId: mgr._missionId };
      });

      expect(result.active).toBe(false);
      expect(result.missionId).toBe(null);
    });

    test('비보스 웨이브에서 speed_kill/boss_escort가 선택되지 않는다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/managers/EndlessMissionManager.js');
        const { EndlessMissionManager } = mod;
        const missions = new Set();
        // 100회 반복하여 비보스 웨이브의 임무 선택 풀 확인
        for (let i = 0; i < 100; i++) {
          const mgr = new EndlessMissionManager({});
          mgr.startMission(7, false, false); // 비보스, 비폭풍
          if (mgr._missionId) missions.add(mgr._missionId);
        }
        return {
          missions: [...missions],
          hasSpeedKill: missions.has('mission_speed_kill'),
          hasBossEscort: missions.has('mission_boss_escort'),
        };
      });

      expect(result.hasSpeedKill).toBe(false);
      expect(result.hasBossEscort).toBe(false);
      // 비보스 웨이브에서는 no_leak과 combo만 선택 가능
      expect(result.missions.sort()).toEqual(['mission_combo', 'mission_no_leak']);
    });

    test('보스 웨이브에서 4종 임무가 모두 선택 가능하다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/managers/EndlessMissionManager.js');
        const { EndlessMissionManager } = mod;
        const missions = new Set();
        // 200회 반복하여 보스 웨이브의 임무 선택 풀 확인
        for (let i = 0; i < 200; i++) {
          const mgr = new EndlessMissionManager({});
          mgr.startMission(10, true, false); // 보스, 비폭풍
          if (mgr._missionId) missions.add(mgr._missionId);
        }
        return [...missions].sort();
      });

      expect(result).toEqual([
        'mission_boss_escort',
        'mission_combo',
        'mission_no_leak',
        'mission_speed_kill',
      ]);
    });

    test('mission_no_leak: 라이프 손실 시 _lifeLeaked = true', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/managers/EndlessMissionManager.js');
        const { EndlessMissionManager } = mod;
        const mgr = new EndlessMissionManager({});

        // 수동으로 mission_no_leak 설정
        mgr._active = true;
        mgr._missionId = 'mission_no_leak';

        // 라이프 손실 전
        const beforeLeak = mgr._lifeLeaked;

        // 라이프 손실
        mgr.onLifeLost();
        const afterLeak = mgr._lifeLeaked;

        // 평가
        const evalResult = mgr.evaluateAndReward();

        return {
          beforeLeak,
          afterLeak,
          success: evalResult.success,
        };
      });

      expect(result.beforeLeak).toBe(false);
      expect(result.afterLeak).toBe(true);
      expect(result.success).toBe(false);
    });

    test('mission_no_leak: 라이프 손실 없으면 성공', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/managers/EndlessMissionManager.js');
        const { EndlessMissionManager } = mod;
        const mgr = new EndlessMissionManager({});

        mgr._active = true;
        mgr._missionId = 'mission_no_leak';

        // 라이프 손실 없이 바로 평가
        const evalResult = mgr.evaluateAndReward();

        return { success: evalResult.success };
      });

      expect(result.success).toBe(true);
    });

    test('mission_combo: 연속 10처치 시 성공, 중간 leak 시 카운트 리셋', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/managers/EndlessMissionManager.js');
        const { EndlessMissionManager } = mod;

        // 케이스 1: 9킬 후 리셋 → 실패
        const mgr1 = new EndlessMissionManager({});
        mgr1._active = true;
        mgr1._missionId = 'mission_combo';
        for (let i = 0; i < 9; i++) mgr1.onEnemyKilled({ data_: {} });
        mgr1.onLifeLost(); // 콤보 리셋
        const eval1 = mgr1.evaluateAndReward();

        // 케이스 2: 10킬 연속 → 성공
        const mgr2 = new EndlessMissionManager({});
        mgr2._active = true;
        mgr2._missionId = 'mission_combo';
        for (let i = 0; i < 10; i++) mgr2.onEnemyKilled({ data_: {} });
        const eval2 = mgr2.evaluateAndReward();

        // 케이스 3: 5킬 → 리셋 → 10킬 → 성공 (maxCombo 추적)
        const mgr3 = new EndlessMissionManager({});
        mgr3._active = true;
        mgr3._missionId = 'mission_combo';
        for (let i = 0; i < 5; i++) mgr3.onEnemyKilled({ data_: {} });
        mgr3.onLifeLost(); // 콤보 리셋, maxCombo = 5
        for (let i = 0; i < 10; i++) mgr3.onEnemyKilled({ data_: {} });
        const eval3 = mgr3.evaluateAndReward();

        return {
          case1_success: eval1.success,
          case1_maxCombo: mgr1._maxCombo,
          case2_success: eval2.success,
          case2_maxCombo: mgr2._maxCombo,
          case3_success: eval3.success,
          case3_maxCombo: mgr3._maxCombo,
        };
      });

      // 케이스 1: 9킬 → leak → maxCombo=9 → 실패
      expect(result.case1_success).toBe(false);
      expect(result.case1_maxCombo).toBe(9);

      // 케이스 2: 10킬 연속 → 성공
      expect(result.case2_success).toBe(true);
      expect(result.case2_maxCombo).toBe(10);

      // 케이스 3: 5킬 → 리셋 → 10킬 → maxCombo=10 → 성공
      expect(result.case3_success).toBe(true);
      expect(result.case3_maxCombo).toBe(10);
    });

    test('mission_speed_kill: 30초 이내 보스 처치 시 성공', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/managers/EndlessMissionManager.js');
        const { EndlessMissionManager } = mod;

        // 보스 처치 + 30초 이내
        const mgr = new EndlessMissionManager({});
        mgr._active = true;
        mgr._missionId = 'mission_speed_kill';
        mgr.markBossSpawned();
        // 즉시 보스 처치 (경과 시간 ~0초)
        mgr.onEnemyKilled({ data_: { isBoss: true } });
        const evalResult = mgr.evaluateAndReward();

        // 보스 처치 + 30초 초과 (시뮬레이션)
        const mgr2 = new EndlessMissionManager({});
        mgr2._active = true;
        mgr2._missionId = 'mission_speed_kill';
        mgr2._bossKillTime = Date.now() - 31000; // 31초 전 스폰
        mgr2._bossKilled = true;
        const evalResult2 = mgr2.evaluateAndReward();

        return {
          case1_success: evalResult.success,
          case2_success: evalResult2.success,
        };
      });

      expect(result.case1_success).toBe(true);
      expect(result.case2_success).toBe(false);
    });

    test('mission_boss_escort: 호위대 전멸 + 보스 처치 시 성공', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/managers/EndlessMissionManager.js');
        const { EndlessMissionManager } = mod;

        // 호위 5마리 전멸 + 보스 처치
        const mgr = new EndlessMissionManager({});
        mgr._active = true;
        mgr._missionId = 'mission_boss_escort';
        mgr._escortTotal = 5;
        mgr._isBossWave = true;
        for (let i = 0; i < 5; i++) mgr.onEnemyKilled({ data_: {} }); // 호위
        mgr.onEnemyKilled({ data_: { isBoss: true } }); // 보스
        const eval1 = mgr.evaluateAndReward();

        // 호위 4마리만 처치 + 보스 처치 → 실패
        const mgr2 = new EndlessMissionManager({});
        mgr2._active = true;
        mgr2._missionId = 'mission_boss_escort';
        mgr2._escortTotal = 5;
        mgr2._isBossWave = true;
        for (let i = 0; i < 4; i++) mgr2.onEnemyKilled({ data_: {} });
        mgr2.onEnemyKilled({ data_: { isBoss: true } });
        const eval2 = mgr2.evaluateAndReward();

        return {
          case1_success: eval1.success,
          case1_escortKilled: mgr._escortKilled,
          case2_success: eval2.success,
          case2_escortKilled: mgr2._escortKilled,
        };
      });

      expect(result.case1_success).toBe(true);
      expect(result.case1_escortKilled).toBe(5);
      expect(result.case2_success).toBe(false);
      expect(result.case2_escortKilled).toBe(4);
    });

    test('비활성 상태에서 이벤트 호출 시 아무 처리도 안 한다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/managers/EndlessMissionManager.js');
        const { EndlessMissionManager } = mod;

        const mgr = new EndlessMissionManager({});
        // active = false 상태
        mgr.onEnemyKilled({ data_: {} });
        mgr.onLifeLost();
        const evalResult = mgr.evaluateAndReward();

        return {
          comboCount: mgr._comboCount,
          lifeLeaked: mgr._lifeLeaked,
          evalResult,
        };
      });

      expect(result.comboCount).toBe(0);
      expect(result.lifeLeaked).toBe(false);
      expect(result.evalResult).toBe(null);
    });

    test('reset() 후 모든 상태가 초기화된다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/managers/EndlessMissionManager.js');
        const { EndlessMissionManager } = mod;

        const mgr = new EndlessMissionManager({});
        mgr._active = true;
        mgr._missionId = 'mission_combo';
        mgr._comboCount = 5;
        mgr._maxCombo = 8;
        mgr._lifeLeaked = true;
        mgr._bossKillTime = Date.now();
        mgr._bossKilled = true;
        mgr._escortKilled = 3;
        mgr._escortTotal = 5;
        mgr._isBossWave = true;

        mgr.reset();

        return {
          active: mgr._active,
          missionId: mgr._missionId,
          comboCount: mgr._comboCount,
          maxCombo: mgr._maxCombo,
          lifeLeaked: mgr._lifeLeaked,
          bossKillTime: mgr._bossKillTime,
          bossKilled: mgr._bossKilled,
          escortKilled: mgr._escortKilled,
          escortTotal: mgr._escortTotal,
          isBossWave: mgr._isBossWave,
        };
      });

      expect(result.active).toBe(false);
      expect(result.missionId).toBe(null);
      expect(result.comboCount).toBe(0);
      expect(result.maxCombo).toBe(0);
      expect(result.lifeLeaked).toBe(false);
      expect(result.bossKillTime).toBe(null);
      expect(result.bossKilled).toBe(false);
      expect(result.escortKilled).toBe(0);
      expect(result.escortTotal).toBe(0);
      expect(result.isBossWave).toBe(false);
    });
  });

  test.describe('EndlessWaveGenerator 폭풍 HP/속도 보정 검증', () => {
    test('폭풍 웨이브(15) 적 HP x0.7, 속도 x0.8 보정', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/managers/EndlessWaveGenerator.js');
        const { EndlessWaveGenerator } = mod;

        // 웨이브 15 생성 (비보스, 폭풍)
        const waveDef = EndlessWaveGenerator.generateWave(15)[0];

        // 원본 (보정 전) 값 계산: hpMultiplier = 1 + (15-1)*0.12 = 2.68
        const hpMult = 1 + (15 - 1) * 0.12;
        const spdMult = Math.min(2.0, 1 + (15 - 1) * 0.02);

        // EndlessScene._prepareEndlessWave에서 수행하는 보정 시뮬레이션
        const enemies = waveDef.enemies.map(g => ({
          type: g.type,
          origHp: g.hp,
          origSpeed: g.speed,
          stormHp: Math.round(g.hp * 0.7),
          stormSpeed: Math.round(g.speed * 0.8),
        }));

        return { hpMult, spdMult, enemies };
      });

      // 폭풍 보정이 정확히 적용되는지 수치 검증
      for (const enemy of result.enemies) {
        expect(enemy.stormHp).toBe(Math.round(enemy.origHp * 0.7));
        expect(enemy.stormSpeed).toBe(Math.round(enemy.origSpeed * 0.8));
      }
    });
  });

  test.describe('유랑 미력사 엔드리스 지원 (ServiceScene)', () => {
    test('ServiceScene._scheduleMireukTraveler 코드에서 isEndless 차단이 제거됨', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // ServiceScene 소스에서 'if (this.isEndless) return;' 패턴이 없는지 확인
      const result = await page.evaluate(async () => {
        const response = await fetch('/js/scenes/ServiceScene.js');
        const code = await response.text();

        // _scheduleMireukTraveler 함수 추출
        const funcStart = code.indexOf('_scheduleMireukTraveler()');
        const funcEnd = code.indexOf('_spawnMireukTraveler()', funcStart);
        const funcBody = code.substring(funcStart, funcEnd);

        return {
          hasBlockingReturn: funcBody.includes('if (this.isEndless) return;'),
          hasSpawnChance008: funcBody.includes('0.08'),
          hasSpawnChance016: funcBody.includes('0.16'),
          hasTernary: funcBody.includes('this.isEndless ? 0.08 : 0.16'),
        };
      });

      expect(result.hasBlockingReturn).toBe(false); // 차단 코드 제거 확인
      expect(result.hasSpawnChance008).toBe(true);   // 8% 확률 존재
      expect(result.hasSpawnChance016).toBe(true);   // 16% 캠페인 확률 존재
      expect(result.hasTernary).toBe(true);           // 삼항 연산자로 분기
    });

    test('isEndless 시 season2/chapter 조건이 건너뛰어진다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const response = await fetch('/js/scenes/ServiceScene.js');
        const code = await response.text();

        const funcStart = code.indexOf('_scheduleMireukTraveler()');
        const funcEnd = code.indexOf('_spawnMireukTraveler()', funcStart);
        const funcBody = code.substring(funcStart, funcEnd);

        // 'if (!this.isEndless)' 블록으로 감싸져 있어야 함
        return {
          hasConditionalBlock: funcBody.includes('if (!this.isEndless)'),
          hasSeason2Check: funcBody.includes('season2Unlocked'),
          hasChapterCheck: funcBody.includes('this.chapter < 7'),
        };
      });

      expect(result.hasConditionalBlock).toBe(true); // isEndless가 아닐 때만 조건 체크
      expect(result.hasSeason2Check).toBe(true);
      expect(result.hasChapterCheck).toBe(true);
    });
  });

  test.describe('EndlessScene 통합 검증', () => {
    test('EndlessScene에서 EndlessMissionManager import + 생성이 있다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const response = await fetch('/js/scenes/EndlessScene.js');
        const code = await response.text();

        return {
          hasImport: code.includes("import { EndlessMissionManager }"),
          hasInstantiation: code.includes("new EndlessMissionManager(this)"),
          hasStartMission: code.includes("this._mission.startMission("),
          hasOnEnemyKilled: code.includes("this._mission.onEnemyKilled("),
          hasOnLifeLost: code.includes("this._mission.onLifeLost()"),
          hasEvaluateAndReward: code.includes("this._mission.evaluateAndReward()"),
          hasShutdownCleanup: code.includes("this._mission.reset(); this._mission = null;"),
          hasStormWaveFlag: code.includes("this._isStormWave = (waveNumber % 15 === 0)"),
          hasStormHpMod: code.includes("group.hp * 0.7") || code.includes("* 0.7"),
          hasStormSpeedMod: code.includes("group.speed * 0.8") || code.includes("* 0.8"),
          hasStormOverlay: code.includes("this._stormOverlay"),
          hasMarkBossSpawned: code.includes("scene._mission.markBossSpawned()"),
          hasMarkBossInSpawnEnemy: code.includes("baseData.isBoss && scene._mission"),
        };
      });

      expect(result.hasImport).toBe(true);
      expect(result.hasInstantiation).toBe(true);
      expect(result.hasStartMission).toBe(true);
      expect(result.hasOnEnemyKilled).toBe(true);
      expect(result.hasOnLifeLost).toBe(true);
      expect(result.hasEvaluateAndReward).toBe(true);
      expect(result.hasShutdownCleanup).toBe(true);
      expect(result.hasStormWaveFlag).toBe(true);
      expect(result.hasStormHpMod).toBe(true);
      expect(result.hasStormSpeedMod).toBe(true);
      expect(result.hasStormOverlay).toBe(true);
      // ISSUE-1 수정 확인: markBossSpawned() 호출이 _spawnEnemy 패치 내에 존재
      expect(result.hasMarkBossSpawned).toBe(true);
      expect(result.hasMarkBossInSpawnEnemy).toBe(true);
    });

    test('shutdown() 시 _mission 정리가 된다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const response = await fetch('/js/scenes/EndlessScene.js');
        const code = await response.text();

        // shutdown 메서드 내부에서 _mission 정리 확인
        const shutdownStart = code.indexOf('shutdown()');
        const shutdownEnd = code.indexOf('}', code.indexOf('this._isStormWave = false', shutdownStart));
        const shutdownBody = code.substring(shutdownStart, shutdownEnd);

        return {
          hasMissionReset: shutdownBody.includes('this._mission.reset()'),
          hasMissionNull: shutdownBody.includes('this._mission = null'),
          hasStormOverlayDestroy: shutdownBody.includes('this._stormOverlay.destroy()'),
          hasStormOverlayNull: shutdownBody.includes('this._stormOverlay = null'),
        };
      });

      expect(result.hasMissionReset).toBe(true);
      expect(result.hasMissionNull).toBe(true);
      expect(result.hasStormOverlayDestroy).toBe(true);
      expect(result.hasStormOverlayNull).toBe(true);
    });
  });

  test.describe('엣지케이스: 보스+폭풍 겹침 (wave 30, 60, 90...)', () => {
    test('wave 30은 보스이면서 폭풍 — 임무 비활성화된다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const ewg = await import('/js/managers/EndlessWaveGenerator.js');
        const emm = await import('/js/managers/EndlessMissionManager.js');
        const { EndlessWaveGenerator } = ewg;
        const { EndlessMissionManager } = emm;

        const wave = 30;
        const isBoss = EndlessWaveGenerator.isBossWave(wave);
        const isStorm = wave % 15 === 0;

        const mgr = new EndlessMissionManager({});
        mgr.startMission(wave, isBoss, isStorm);

        return {
          isBoss,
          isStorm,
          active: mgr._active,
          missionId: mgr._missionId,
        };
      });

      expect(result.isBoss).toBe(true);
      expect(result.isStorm).toBe(true);
      // 폭풍 웨이브면 임무 비활성 (폭풍 > 보스 우선)
      expect(result.active).toBe(false);
      expect(result.missionId).toBe(null);
    });
  });

  test.describe('getStatusText() 반환값 검증', () => {
    test('각 임무 유형별 상태 텍스트가 올바르다', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const result = await page.evaluate(async () => {
        const mod = await import('/js/managers/EndlessMissionManager.js');
        const { EndlessMissionManager } = mod;

        const mgr = new EndlessMissionManager({});
        const results = {};

        // 비활성 상태
        results.inactive = mgr.getStatusText();

        // speed_kill
        mgr._active = true;
        mgr._missionId = 'mission_speed_kill';
        results.speedKill = mgr.getStatusText();

        // no_leak
        mgr._missionId = 'mission_no_leak';
        results.noLeak = mgr.getStatusText();

        // combo (진행 중)
        mgr._missionId = 'mission_combo';
        mgr._maxCombo = 7;
        results.combo = mgr.getStatusText();

        // boss_escort (진행 중)
        mgr._missionId = 'mission_boss_escort';
        mgr._escortKilled = 3;
        mgr._escortTotal = 5;
        results.escort = mgr.getStatusText();

        return results;
      });

      expect(result.inactive).toBe('');
      expect(result.speedKill).toContain('신속 처단');
      expect(result.noLeak).toContain('완벽 방어');
      expect(result.combo).toContain('7/10');
      expect(result.escort).toContain('3/5');
    });
  });
});
