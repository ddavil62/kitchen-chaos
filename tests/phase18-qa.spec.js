/**
 * @fileoverview Phase 18 레거시 정리 + 기술 부채 QA 테스트.
 * 레거시 씬 삭제, 참조 정리, config.js 정리, JSDoc 보강 검증.
 *
 * 참고: Phaser 게임 초기화가 headless 환경에서 타임아웃되는 기존 이슈로 인해
 * 런타임 테스트 대신 정적 검증(import 구조, config 확인 등)으로 대체한다.
 */
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(process.cwd());
const JS_DIR = path.join(PROJECT_ROOT, 'js');
const SCENES_DIR = path.join(JS_DIR, 'scenes');

test.describe('Phase 18: 레거시 파일 삭제 검증', () => {
  test('StageSelectScene.js가 존재하지 않는다', () => {
    expect(fs.existsSync(path.join(SCENES_DIR, 'StageSelectScene.js'))).toBe(false);
  });

  test('MarketScene.js가 존재하지 않는다', () => {
    expect(fs.existsSync(path.join(SCENES_DIR, 'MarketScene.js'))).toBe(false);
  });

  test('GameScene.js가 존재하지 않는다', () => {
    expect(fs.existsSync(path.join(SCENES_DIR, 'GameScene.js'))).toBe(false);
  });

  test('GameOverScene.js가 존재하지 않는다', () => {
    expect(fs.existsSync(path.join(SCENES_DIR, 'GameOverScene.js'))).toBe(false);
  });
});

test.describe('Phase 18: main.js 참조 정리 검증', () => {
  const mainContent = fs.readFileSync(path.join(JS_DIR, 'main.js'), 'utf-8');

  test('main.js에 StageSelectScene import가 없다', () => {
    expect(mainContent).not.toContain("import { StageSelectScene }");
    expect(mainContent).not.toContain("'./scenes/StageSelectScene.js'");
  });

  test('main.js에 MarketScene import가 없다', () => {
    expect(mainContent).not.toContain("import { MarketScene }");
    expect(mainContent).not.toContain("'./scenes/MarketScene.js'");
  });

  test('main.js scene 배열에 StageSelectScene이 없다', () => {
    expect(mainContent).not.toMatch(/scene:\s*\[.*StageSelectScene/);
  });

  test('main.js scene 배열에 MarketScene이 없다', () => {
    expect(mainContent).not.toMatch(/scene:\s*\[.*MarketScene/);
  });

  test('main.js scene 배열에 WorldMapScene이 존재한다', () => {
    expect(mainContent).toMatch(/scene:\s*\[.*WorldMapScene/);
  });
});

test.describe('Phase 18: ResultScene.js 참조 교체 검증', () => {
  const resultContent = fs.readFileSync(path.join(SCENES_DIR, 'ResultScene.js'), 'utf-8');

  test('ResultScene에 StageSelectScene 런타임 참조가 없다', () => {
    // 주석이 아닌 실행 코드에서 StageSelectScene 문자열이 없어야 함
    const lines = resultContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
      expect(trimmed).not.toContain("'StageSelectScene'");
      expect(trimmed).not.toContain('"StageSelectScene"');
    }
  });

  test('ResultScene에 WorldMapScene 전환이 존재한다', () => {
    expect(resultContent).toContain("_fadeToScene('WorldMapScene')");
  });

  test('ResultScene 버튼 레이블이 "월드맵으로"로 변경되었다', () => {
    // 두 곳 모두 확인 (장보기 실패 + 정상 정산)
    const matches = resultContent.match(/월드맵으로/g);
    expect(matches).not.toBeNull();
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Phase 18: config.js 정리 검증', () => {
  const configContent = fs.readFileSync(path.join(JS_DIR, 'config.js'), 'utf-8');

  test('STARTING_GOLD가 제거되었다', () => {
    expect(configContent).not.toMatch(/export\s+const\s+STARTING_GOLD/);
  });

  test('WAVE_CLEAR_BONUS가 제거되었다', () => {
    expect(configContent).not.toMatch(/export\s+const\s+WAVE_CLEAR_BONUS/);
  });

  test('INGREDIENT_SELL_PRICE가 제거되었다', () => {
    expect(configContent).not.toMatch(/export\s+const\s+INGREDIENT_SELL_PRICE/);
  });

  test('STARTING_LIVES가 유지된다', () => {
    expect(configContent).toMatch(/export\s+const\s+STARTING_LIVES\s*=\s*15/);
  });

  test('FRESHNESS_WINDOW_MS가 유지된다', () => {
    expect(configContent).toMatch(/export\s+const\s+FRESHNESS_WINDOW_MS\s*=\s*5000/);
  });

  test('MarketScene 레이아웃 주석이 제거되었다', () => {
    expect(configContent).not.toContain('MarketScene 레이아웃');
    expect(configContent).not.toContain('MarketScene 풀스크린');
    expect(configContent).not.toContain('HUD (MarketScene)');
  });

  test('fileoverview가 현행화되었다', () => {
    expect(configContent).toContain('화면 크기, 게임 씬 레이아웃');
  });

  test('레이아웃 섹션 주석이 현행화되었다', () => {
    expect(configContent).toContain('게임 씬 레이아웃 (GatheringScene / EndlessScene)');
  });

  test('하위 호환용 주석이 제거되었다', () => {
    expect(configContent).not.toContain('Phase 13에서 도구 시스템으로 대체됨');
    expect(configContent).not.toContain('하위 호환용 유지');
  });

  test('RestaurantScene 레이아웃 상수는 유지된다 (활성 사용 중)', () => {
    // KitchenPanelUI, CustomerZoneUI, RestaurantScene에서 사용 중
    expect(configContent).toMatch(/export\s+const\s+RESTAURANT_Y/);
    expect(configContent).toMatch(/export\s+const\s+KITCHEN_PANEL_Y/);
    expect(configContent).toMatch(/export\s+const\s+CUSTOMER_ZONE_HEIGHT/);
  });

  test('RestaurantScene 레이아웃 주석이 현행화되었다', () => {
    // "Phase 7-2에서 제거 예정" 주석이 아닌 현행 사용처를 반영한 주석
    expect(configContent).not.toContain('Phase 7-2에서 제거 예정');
    expect(configContent).toContain('KitchenPanelUI');
  });
});

test.describe('Phase 18: js/ 디렉토리 전체 참조 정리', () => {
  // js/ 디렉토리 하위의 모든 .js 파일에서 비주석 라인의 런타임 참조 검사
  function collectJsFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...collectJsFiles(full));
      } else if (entry.name.endsWith('.js')) {
        files.push(full);
      }
    }
    return files;
  }

  const allJsFiles = collectJsFiles(JS_DIR);

  test('어떤 활성 파일도 scene.start로 삭제된 씬을 호출하지 않는다', () => {
    const deletedScenes = ['MarketScene', 'StageSelectScene', 'GameScene', 'GameOverScene'];
    const issues = [];

    for (const file of allJsFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('//') || line.startsWith('*')) continue;
        for (const scene of deletedScenes) {
          if (line.includes(`scene.start('${scene}')`) || line.includes(`scene.start("${scene}")`)) {
            issues.push(`${path.relative(PROJECT_ROOT, file)}:${i + 1} -> ${line}`);
          }
          if (line.includes(`_fadeToScene('${scene}')`) || line.includes(`_fadeToScene("${scene}")`)) {
            issues.push(`${path.relative(PROJECT_ROOT, file)}:${i + 1} -> ${line}`);
          }
        }
      }
    }

    expect(issues).toEqual([]);
  });

  test('어떤 활성 파일도 삭제된 씬 파일을 import하지 않는다', () => {
    const deletedFiles = ['StageSelectScene.js', 'MarketScene.js', 'GameScene.js', 'GameOverScene.js'];
    const issues = [];

    for (const file of allJsFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const deleted of deletedFiles) {
        if (content.includes(`from './${deleted}'`) || content.includes(`from "../${deleted}"`) ||
            content.includes(`from './scenes/${deleted}'`) || content.includes(`from '../scenes/${deleted}'`)) {
          issues.push(`${path.relative(PROJECT_ROOT, file)} imports ${deleted}`);
        }
      }
    }

    expect(issues).toEqual([]);
  });
});

test.describe('Phase 18: 테스트 파일 정리 검증', () => {
  const worldmapContent = fs.readFileSync(path.join(PROJECT_ROOT, 'tests', 'worldmap-qa.spec.js'), 'utf-8');
  const endlessContent = fs.readFileSync(path.join(PROJECT_ROOT, 'tests', 'endless-mode-qa.spec.js'), 'utf-8');

  test('worldmap-qa에서 회귀 테스트 섹션이 삭제되었다', () => {
    expect(worldmapContent).not.toContain("StageSelectScene이 여전히 scene 배열에 존재");
    expect(worldmapContent).not.toContain("직접 StageSelectScene 전환 시 정상 동작");
  });

  test('worldmap-qa에서 StageSelectScene 런타임 참조가 없다', () => {
    // 테스트 코드에서 StageSelectScene 문자열이 없어야 함
    expect(worldmapContent).not.toContain("'StageSelectScene'");
    expect(worldmapContent).not.toContain("stageSelectActive");
  });

  test('worldmap-qa 테스트 이름에서 StageSelectScene 괄호 내용이 제거되었다', () => {
    expect(worldmapContent).not.toContain("(StageSelectScene 진입 안됨)");
  });

  test('endless-mode-qa에서 StageSelectScene 전환 테스트가 WorldMapScene으로 교체되었다', () => {
    expect(endlessContent).not.toContain("game.scene.start('StageSelectScene')");
    expect(endlessContent).not.toContain("getScene('StageSelectScene')");
    expect(endlessContent).toContain("game.scene.start('WorldMapScene')");
  });

  test('endless-mode-qa 캠페인 회귀 테스트 이름이 갱신되었다', () => {
    expect(endlessContent).toContain("캠페인 모드 시작 시 WorldMapScene으로 진입");
    expect(endlessContent).not.toContain("캠페인 모드 시작이 기존과 동일하게 동작");
  });
});

test.describe('Phase 18: JSDoc 보강 스팟체크', () => {
  test('GatheringScene.create()에 @param JSDoc이 있다', () => {
    const content = fs.readFileSync(path.join(SCENES_DIR, 'GatheringScene.js'), 'utf-8');
    // create(data) 직전 JSDoc 블록에 @param이 포함되어야 함
    const createIdx = content.indexOf('create(data)');
    const beforeCreate = content.substring(Math.max(0, createIdx - 200), createIdx);
    expect(beforeCreate).toContain('@param');
  });

  test('MerchantScene.init()에 @param JSDoc이 있다', () => {
    const content = fs.readFileSync(path.join(SCENES_DIR, 'MerchantScene.js'), 'utf-8');
    const initIdx = content.indexOf('init(data)');
    const beforeInit = content.substring(Math.max(0, initIdx - 300), initIdx);
    expect(beforeInit).toContain('@param');
    expect(beforeInit).toContain('data.stageId');
  });

  test('StoryManager.checkTriggers()에 @param JSDoc이 있다', () => {
    const content = fs.readFileSync(path.join(JS_DIR, 'managers', 'StoryManager.js'), 'utf-8');
    const checkIdx = content.indexOf('static checkTriggers(');
    const beforeCheck = content.substring(Math.max(0, checkIdx - 400), checkIdx);
    expect(beforeCheck).toContain('@param {Phaser.Scene} scene');
    expect(beforeCheck).toContain('@param {string} triggerPoint');
    expect(beforeCheck).toContain('@param {object}');
  });

  test('DialogueManager.start()에 @param JSDoc이 있다', () => {
    const content = fs.readFileSync(path.join(JS_DIR, 'managers', 'DialogueManager.js'), 'utf-8');
    const startIdx = content.indexOf('static start(');
    const beforeStart = content.substring(Math.max(0, startIdx - 300), startIdx);
    expect(beforeStart).toContain('@param {Phaser.Scene} callerScene');
    expect(beforeStart).toContain('@param {string} dialogueId');
    expect(beforeStart).toContain('options.force');
  });

  test('ToolManager.buyTool()에 @returns JSDoc이 있다', () => {
    const content = fs.readFileSync(path.join(JS_DIR, 'managers', 'ToolManager.js'), 'utf-8');
    // buyTool 메서드 직전의 JSDoc 확인
    const buyIdx = content.indexOf('static buyTool(');
    const beforeBuy = content.substring(Math.max(0, buyIdx - 200), buyIdx);
    expect(beforeBuy).toContain('@returns');
  });

  test('DialogueScene.init()에 @param JSDoc이 있다', () => {
    const content = fs.readFileSync(path.join(SCENES_DIR, 'DialogueScene.js'), 'utf-8');
    const initIdx = content.indexOf('init(data)');
    const beforeInit = content.substring(Math.max(0, initIdx - 200), initIdx);
    expect(beforeInit).toContain('@param');
    expect(beforeInit).toContain('data.script');
  });

  test('WorldMapScene.create()에 JSDoc이 있다', () => {
    const content = fs.readFileSync(path.join(SCENES_DIR, 'WorldMapScene.js'), 'utf-8');
    const createIdx = content.indexOf('create()');
    if (createIdx > 0) {
      const beforeCreate = content.substring(Math.max(0, createIdx - 200), createIdx);
      // 최소 JSDoc 존재 여부 확인
      expect(beforeCreate).toContain('/**');
    }
  });
});

test.describe('Phase 18: 빌드 무결성', () => {
  test('dist/ 빌드 산출물이 존재한다', () => {
    expect(fs.existsSync(path.join(PROJECT_ROOT, 'dist', 'index.html'))).toBe(true);
  });

  test('빌드 산출물에 삭제된 씬 참조가 포함되지 않는다 (번들 내 문자열 검사)', () => {
    const distDir = path.join(PROJECT_ROOT, 'dist', 'assets');
    if (!fs.existsSync(distDir)) return; // dist가 없으면 스킵
    const jsFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));
    for (const f of jsFiles) {
      const content = fs.readFileSync(path.join(distDir, f), 'utf-8');
      // 번들 내에서 삭제된 씬 키 문자열로 scene.start를 호출하는 코드가 없어야 함
      expect(content).not.toContain("scene.start('MarketScene')");
      expect(content).not.toContain("scene.start('StageSelectScene')");
      expect(content).not.toContain("scene.start('GameScene')");
      expect(content).not.toContain("scene.start('GameOverScene')");
    }
  });
});
