/**
 * @fileoverview 9-slice 및 공용 UI 위젯 팩토리 (Phase 60-2).
 * - Phaser 3.87의 네이티브 NineSlice 게임오브젝트를 래핑하여 manifest 메타(insets)를 자동 적용한다.
 * - Button / ProgressBar / Panel 등 고빈도 위젯 생성을 한 줄 API로 제공한다.
 * - 씬 단위 사용 예:
 *     import { NineSliceFactory } from '../ui/NineSliceFactory.js';
 *     const panel = NineSliceFactory.panel(scene, x, y, 300, 180, 'wood');
 *     const btn   = NineSliceFactory.button(scene, x, y, 200, 64, '확인', { variant: 'primary', onClick });
 *     const bar   = NineSliceFactory.progressBar(scene, x, y, 200, 20, { tint: TINT.HP });
 *
 * manifest는 BootScene에서 cache.json('ui_ns_manifest') 키로 로드된다.
 */

import Phaser from 'phaser';
import { NS_KEYS, TINT, TEXT_STYLE } from './UITheme.js';

/**
 * 매니페스트 캐시(런타임). 첫 호출 시 씬 cache에서 읽어온다.
 * @type {Record<string, { size:[number,number], insets:[number,number,number,number], tint:boolean, desc?:string }>|null}
 */
let _manifestCache = null;

/**
 * 씬의 cache에서 매니페스트를 가져온다.
 * 로드 성공 시 모듈 캐시에 저장하여 이후 호출은 즉시 반환한다.
 * 로드 실패 시 캐시하지 않고 빈 객체를 반환한다 — 다음 호출에서 재시도.
 * (BootScene.preload() 완료 전에 호출되면 실패할 수 있으므로 캐시 고정 금지)
 * @param {Phaser.Scene} scene
 * @returns {Record<string, any>}
 */
function getManifest(scene) {
  if (_manifestCache) return _manifestCache;
  const raw = scene.cache.json.get('ui_ns_manifest');
  if (!raw || !raw.assets) {
    // 캐시에 없으면 빈 객체 반환만 하고 _manifestCache는 건드리지 않는다.
    // 이후 호출에서 BootScene preload 완료 후 재시도된다.
    console.warn('[NineSliceFactory] manifest 로드 실패 - BootScene preload 확인');
    return {};
  }
  _manifestCache = raw.assets;
  return _manifestCache;
}

/**
 * manifest 엔트리에서 [left, right, top, bottom] 인셋을 읽어 Phaser nineslice 인자로 반환.
 * @param {string} manifestKey  예: 'panel_wood'
 * @param {Phaser.Scene} scene
 * @returns {{left:number, right:number, top:number, bottom:number}}
 */
function resolveInsets(manifestKey, scene) {
  const manifest = getManifest(scene);
  const entry = manifest[manifestKey];
  if (!entry) {
    console.warn(`[NineSliceFactory] manifest에 없는 키: ${manifestKey}`);
    return { left: 8, right: 8, top: 8, bottom: 8 };
  }
  const [left, right, top, bottom] = entry.insets;
  return { left, right, top, bottom };
}

/**
 * Canvas 호환 9-slice 구현.
 * Phaser 3.87의 네이티브 NineSlice는 WebGL 렌더러에서만 동작하지만, 본 프로젝트는
 * Android WebView 호환을 위해 `type: Phaser.CANVAS`로 강제한다.
 * 따라서 9개의 Image 자식으로 구성된 Container로 구현한다.
 *
 * 구조:
 *   TL TE TR
 *   LE CE RE
 *   BL BE BR
 * 코너 4종: 원본 크기 그대로
 * 엣지 4종: 한 축만 스케일
 * 센터 1종: 양 축 스케일
 *
 * 반환 Container는 네이티브 NineSlice와 유사한 API를 제공한다:
 *   - setTexture(key): 텍스처 교체
 *   - setSlices(l, r, t, b): 인셋 변경
 *   - width, height (setSize를 통해): 리사이즈
 *   - setTint(n): 9조각 모두에 적용
 *   - setAlpha(n)
 *
 * @param {Phaser.Scene} scene
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {string} textureKey   Phaser 텍스처 키(NS_KEYS 값)
 * @param {string} manifestKey  manifest JSON 키(파일명 stem)
 * @returns {Phaser.GameObjects.Container}
 */
function createNineSlice(scene, x, y, width, height, textureKey, manifestKey, originX = 0.5, originY = 0.5) {
  const { left, right, top, bottom } = resolveInsets(manifestKey, scene);

  // 텍스처 원본 크기
  const srcImg = scene.textures.get(textureKey).getSourceImage();
  const sw = srcImg.width;
  const sh = srcImg.height;

  // ── 9조각 Image 생성 (프레임 crop은 setCrop으로 구현할 수 없어 Texture 분할 캐시를 사용) ──
  // Phaser는 add.image()에 frame 인자로 원본 내 서브영역을 지정할 수 있다.
  // 원본 텍스처에 9조각 프레임을 동적으로 추가한다.
  const nsFramePrefix = `__ns__${textureKey}`;
  const tex = scene.textures.get(textureKey);
  const frameKeys = {
    tl: `${nsFramePrefix}_tl`, te: `${nsFramePrefix}_te`, tr: `${nsFramePrefix}_tr`,
    le: `${nsFramePrefix}_le`, ce: `${nsFramePrefix}_ce`, re: `${nsFramePrefix}_re`,
    bl: `${nsFramePrefix}_bl`, be: `${nsFramePrefix}_be`, br: `${nsFramePrefix}_br`,
  };
  if (!tex.has(frameKeys.tl)) {
    const cw = Math.max(1, sw - left - right); // 센터 너비
    const ch = Math.max(1, sh - top - bottom); // 센터 높이
    tex.add(frameKeys.tl, 0, 0,           0,            left,  top);
    tex.add(frameKeys.te, 0, left,        0,            cw,    top);
    tex.add(frameKeys.tr, 0, sw - right,  0,            right, top);
    tex.add(frameKeys.le, 0, 0,           top,          left,  ch);
    tex.add(frameKeys.ce, 0, left,        top,          cw,    ch);
    tex.add(frameKeys.re, 0, sw - right,  top,          right, ch);
    tex.add(frameKeys.bl, 0, 0,           sh - bottom,  left,  bottom);
    tex.add(frameKeys.be, 0, left,        sh - bottom,  cw,    bottom);
    tex.add(frameKeys.br, 0, sw - right,  sh - bottom,  right, bottom);
  }

  // 각 조각을 Image로 생성 (origin 0,0)
  const mk = (fk) => scene.add.image(0, 0, textureKey, fk).setOrigin(0, 0);
  const tl = mk(frameKeys.tl);
  const te = mk(frameKeys.te);
  const tr = mk(frameKeys.tr);
  const le = mk(frameKeys.le);
  const ce = mk(frameKeys.ce);
  const re = mk(frameKeys.re);
  const bl = mk(frameKeys.bl);
  const be = mk(frameKeys.be);
  const br = mk(frameKeys.br);

  const pieces = [tl, te, tr, le, ce, re, bl, be, br];
  const container = scene.add.container(x, y, pieces);
  container._nsTexture = textureKey;
  container._nsSlices = { left, right, top, bottom };
  container._nsPieces = { tl, te, tr, le, ce, re, bl, be, br };
  container._nsFrameKeys = frameKeys;
  container._nsSourceSize = { sw, sh };
  container._nsOriginX = originX;
  container._nsOriginY = originY;

  // Phase 92-D bugfix: 클릭 영역 불일치 수정.
  // Phaser의 pointWithinHitArea()는 hitArea 검사 전 좌표에 displayOriginX/Y를 더한다.
  // 이 Phaser 버전의 Container는 displayOriginX getter가 "return this.width * 0.5"로
  // 하드코딩되어 있어, hitArea Rectangle(-w/2,-h/2,w,h)가 실제로 좌상단으로 이동한다.
  // 인스턴스 레벨에서 getter를 0 반환으로 오버라이드하여 hitArea 보정을 무효화한다.
  Object.defineProperty(container, 'displayOriginX', { get: () => 0, configurable: true });
  Object.defineProperty(container, 'displayOriginY', { get: () => 0, configurable: true });

  /**
   * 9조각을 현재 container.width × container.height에 맞춰 재배치/스케일한다.
   */
  const layout = () => {
    const w = container.width;
    const h = container.height;
    const { left: L, right: R, top: T, bottom: B } = container._nsSlices;
    const cW = Math.max(0, w - L - R);
    const cH = Math.max(0, h - T - B);

    // originX/Y 기반으로 좌상단 좌표 결정
    // originX=0.5 → x0 = -w/2 (중심 정렬)
    // originX=0   → x0 = 0    (좌측 정렬)
    // Math.round()로 정수화: 서브픽셀 위치의 9조각 경계 블리딩 방지 (Phase 62)
    const oX = container._nsOriginX ?? 0.5;
    const oY = container._nsOriginY ?? 0.5;
    const x0 = Math.round(-w * oX);
    const y0 = Math.round(-h * oY);

    // 코너 크기 — 작은 버튼에서 겹칠 경우 비례 축소 (깨짐 방지)
    const cornerT = cH < 0 ? Math.round(h * T / (T + B)) : T;
    const cornerB = cH < 0 ? (h - cornerT) : B;
    const cornerL = cW < 0 ? Math.round(w * L / (L + R)) : L;
    const cornerR = cW < 0 ? (w - cornerL) : R;
    const edgeW = Math.max(0, w - cornerL - cornerR);
    const edgeH = Math.max(0, h - cornerT - cornerB);

    tl.setPosition(x0,                 y0);
    tr.setPosition(x0 + w - cornerR,   y0);
    bl.setPosition(x0,                 y0 + h - cornerB);
    br.setPosition(x0 + w - cornerR,   y0 + h - cornerB);
    tl.setDisplaySize(cornerL, cornerT);
    tr.setDisplaySize(cornerR, cornerT);
    bl.setDisplaySize(cornerL, cornerB);
    br.setDisplaySize(cornerR, cornerB);

    // 엣지
    te.setPosition(x0 + cornerL, y0);
    be.setPosition(x0 + cornerL, y0 + h - cornerB);
    le.setPosition(x0,           y0 + cornerT);
    re.setPosition(x0 + w - cornerR, y0 + cornerT);
    te.setDisplaySize(edgeW, cornerT);
    be.setDisplaySize(edgeW, cornerB);
    le.setDisplaySize(cornerL, edgeH);
    re.setDisplaySize(cornerR, edgeH);

    // 센터
    ce.setPosition(x0 + cornerL, y0 + cornerT);
    ce.setDisplaySize(edgeW, edgeH);

    // cW/cH가 0이면 숨김 (1px 이하)
    ce.setVisible(cW > 0 && cH > 0);
    te.setVisible(cW > 0);
    be.setVisible(cW > 0);
    le.setVisible(cH > 0);
    re.setVisible(cH > 0);
  };

  // Container.setSize가 호출되면 자동 재레이아웃
  const _origSetSize = container.setSize.bind(container);
  container.setSize = (w, h) => {
    _origSetSize(w, h);
    layout();
    return container;
  };

  // 네이티브 NineSlice 호환 API
  container.setSlices = (L, R, T, B) => {
    container._nsSlices = { left: L, right: R, top: T, bottom: B };
    // 프레임도 재생성 필요 — 텍스처 재바인딩
    rebuildFrames(container, scene);
    layout();
    return container;
  };

  // 원본 Phaser 오브젝트 API 호환: setOrigin(x, y)
  container.setOrigin = (ox, oy) => {
    container._nsOriginX = ox;
    container._nsOriginY = (oy === undefined ? ox : oy);
    layout();
    return container;
  };

  container.setTexture = (newKey) => {
    container._nsTexture = newKey;
    container._nsSourceSize = (() => {
      const im = scene.textures.get(newKey).getSourceImage();
      return { sw: im.width, sh: im.height };
    })();
    rebuildFrames(container, scene);
    layout();
    return container;
  };

  container.setTint = (tint) => {
    pieces.forEach((p) => p.setTint(tint));
    return container;
  };
  container.clearTint = () => {
    pieces.forEach((p) => p.clearTint());
    return container;
  };

  // 초기 레이아웃
  container.setSize(width, height);

  return container;
}

/**
 * 컨테이너의 9조각 프레임을 현재 텍스처/슬라이스 기준으로 재생성한다.
 * setTexture/setSlices 호출 시 내부에서 사용.
 * @param {Phaser.GameObjects.Container & { _nsTexture:string, _nsSlices:any, _nsPieces:any, _nsFrameKeys:any }} container
 * @param {Phaser.Scene} scene
 */
function rebuildFrames(container, scene) {
  const textureKey = container._nsTexture;
  const { left, right, top, bottom } = container._nsSlices;
  const tex = scene.textures.get(textureKey);
  const src = tex.getSourceImage();
  const sw = src.width, sh = src.height;
  const cw = Math.max(1, sw - left - right);
  const ch = Math.max(1, sh - top - bottom);

  const nsFramePrefix = `__ns__${textureKey}_L${left}R${right}T${top}B${bottom}`;
  const frameKeys = {
    tl: `${nsFramePrefix}_tl`, te: `${nsFramePrefix}_te`, tr: `${nsFramePrefix}_tr`,
    le: `${nsFramePrefix}_le`, ce: `${nsFramePrefix}_ce`, re: `${nsFramePrefix}_re`,
    bl: `${nsFramePrefix}_bl`, be: `${nsFramePrefix}_be`, br: `${nsFramePrefix}_br`,
  };
  if (!tex.has(frameKeys.tl)) {
    tex.add(frameKeys.tl, 0, 0,           0,            left,  top);
    tex.add(frameKeys.te, 0, left,        0,            cw,    top);
    tex.add(frameKeys.tr, 0, sw - right,  0,            right, top);
    tex.add(frameKeys.le, 0, 0,           top,          left,  ch);
    tex.add(frameKeys.ce, 0, left,        top,          cw,    ch);
    tex.add(frameKeys.re, 0, sw - right,  top,          right, ch);
    tex.add(frameKeys.bl, 0, 0,           sh - bottom,  left,  bottom);
    tex.add(frameKeys.be, 0, left,        sh - bottom,  cw,    bottom);
    tex.add(frameKeys.br, 0, sw - right,  sh - bottom,  right, bottom);
  }

  const P = container._nsPieces;
  P.tl.setTexture(textureKey, frameKeys.tl);
  P.te.setTexture(textureKey, frameKeys.te);
  P.tr.setTexture(textureKey, frameKeys.tr);
  P.le.setTexture(textureKey, frameKeys.le);
  P.ce.setTexture(textureKey, frameKeys.ce);
  P.re.setTexture(textureKey, frameKeys.re);
  P.bl.setTexture(textureKey, frameKeys.bl);
  P.be.setTexture(textureKey, frameKeys.be);
  P.br.setTexture(textureKey, frameKeys.br);
  container._nsFrameKeys = frameKeys;
  container._nsSourceSize = { sw, sh };
}

// ─────────────────────────────────────────
// Panel
// ─────────────────────────────────────────
/**
 * 패널 variant → (textureKey, manifestKey) 매핑.
 */
const PANEL_MAP = {
  wood:      [NS_KEYS.PANEL_WOOD,          'panel_wood'],
  parchment: [NS_KEYS.PANEL_PARCHMENT,     'panel_parchment'],
  dark:      [NS_KEYS.PANEL_DARK,          'panel_dark'],
  stone:     [NS_KEYS.PANEL_STONE,         'panel_stone'],
  glow:      [NS_KEYS.PANEL_GLOW_SELECTED, 'panel_glow_selected'],
};

/**
 * 버튼 variant+state → (textureKey, manifestKey) 매핑.
 */
const BUTTON_MAP = {
  primary: {
    normal:   [NS_KEYS.BTN_PRIMARY_NORMAL,   'btn_primary_normal'],
    pressed:  [NS_KEYS.BTN_PRIMARY_PRESSED,  'btn_primary_pressed'],
    disabled: [NS_KEYS.BTN_PRIMARY_DISABLED, 'btn_primary_disabled'],
  },
  secondary: {
    normal:   [NS_KEYS.BTN_SECONDARY_NORMAL,   'btn_secondary_normal'],
    pressed:  [NS_KEYS.BTN_SECONDARY_PRESSED,  'btn_secondary_pressed'],
    disabled: [NS_KEYS.BTN_SECONDARY_DISABLED, 'btn_secondary_disabled'],
  },
  danger: {
    normal:   [NS_KEYS.BTN_DANGER_NORMAL,   'btn_danger_normal'],
    pressed:  [NS_KEYS.BTN_DANGER_PRESSED,  'btn_danger_pressed'],
    disabled: [NS_KEYS.BTN_DANGER_DISABLED, 'btn_danger_disabled'],
  },
  icon: {
    normal:   [NS_KEYS.BTN_ICON_NORMAL,   'btn_icon_normal'],
    pressed:  [NS_KEYS.BTN_ICON_PRESSED,  'btn_icon_pressed'],
    disabled: [NS_KEYS.BTN_ICON_DISABLED, 'btn_icon_disabled'],
  },
};

export const NineSliceFactory = {
  /**
   * 원시 nineslice 생성. variant를 매핑하지 않고 manifest 키를 직접 주고 싶을 때.
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {string} manifestKey  예: 'panel_wood', 'btn_primary_normal'
   * @param {string} [textureKey] 별도 키를 쓰고 싶을 때 (기본은 NS_KEY_MAP에서 찾음)
   * @returns {Phaser.GameObjects.NineSlice}
   */
  raw(scene, x, y, width, height, manifestKey, textureKey = null) {
    if (!textureKey) {
      // 관례: 'foo_bar' → 'ui_ns_foo_bar'
      textureKey = `ui_ns_${manifestKey}`;
    }
    return createNineSlice(scene, x, y, width, height, textureKey, manifestKey);
  },

  /**
   * 패널 생성.
   * @param {Phaser.Scene} scene
   * @param {number} x - 중앙 좌표(origin 0.5, 0.5)
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {'wood'|'parchment'|'dark'|'stone'|'glow'} [variant='wood']
   * @returns {Phaser.GameObjects.NineSlice}
   */
  panel(scene, x, y, width, height, variant = 'wood') {
    const [texKey, manKey] = PANEL_MAP[variant] || PANEL_MAP.wood;
    return createNineSlice(scene, x, y, width, height, texKey, manKey);
  },

  /**
   * 버튼 생성. 배경 nineslice + 라벨 텍스트 + 인터랙션을 묶은 Container를 반환한다.
   * Container는 getBounds 기준이 (width × height)인 Rectangle hit area를 가진다.
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {string} label - 버튼 라벨(빈 문자열이면 라벨 생략)
   * @param {{
   *   variant?: 'primary'|'secondary'|'danger'|'icon',
   *   onClick?: () => void,
   *   disabled?: boolean,
   *   textStyle?: Phaser.Types.GameObjects.Text.TextStyle,
   * }} [opts]
   * @returns {Phaser.GameObjects.Container & { setDisabled:(v:boolean)=>void, setLabel:(s:string)=>void, _bg: Phaser.GameObjects.NineSlice, _label: Phaser.GameObjects.Text }}
   */
  button(scene, x, y, width, height, label, opts = {}) {
    const variant = opts.variant || 'primary';
    const variantMap = BUTTON_MAP[variant] || BUTTON_MAP.primary;
    let state = opts.disabled ? 'disabled' : 'normal';

    const [texKey, manKey] = variantMap[state];
    const bg = createNineSlice(scene, 0, 0, width, height, texKey, manKey);

    // 라벨
    const styleKey = variant === 'danger' ? 'BUTTON_DANGER' : 'BUTTON_PRIMARY';
    const baseStyle = state === 'disabled' ? TEXT_STYLE.BUTTON_DISABLED : TEXT_STYLE[styleKey];
    const labelText = scene.add.text(0, 0, label || '', { ...baseStyle, ...(opts.textStyle || {}) })
      .setOrigin(0.5);

    const container = scene.add.container(x, y, [bg, labelText]);
    container.setSize(width, height);
    // Phase 92-D bugfix: displayOriginX/Y getter 오버라이드 (createNineSlice와 동일한 이유)
    Object.defineProperty(container, 'displayOriginX', { get: () => 0, configurable: true });
    Object.defineProperty(container, 'displayOriginY', { get: () => 0, configurable: true });
    container._bg = bg;
    container._label = labelText;
    container._variant = variant;
    container._disabled = !!opts.disabled;

    /**
     * 현재 state에 맞는 nineslice 텍스처로 교체한다.
     * @param {'normal'|'pressed'|'disabled'} nextState
     */
    const setState = (nextState) => {
      const [tk, mk] = variantMap[nextState];
      const { left, right, top, bottom } = resolveInsets(mk, scene);
      bg.setTexture(tk);
      bg.setSlices(left, right, top, bottom);
      if (nextState === 'disabled') {
        labelText.setStyle(TEXT_STYLE.BUTTON_DISABLED);
      } else {
        labelText.setStyle(variant === 'danger' ? TEXT_STYLE.BUTTON_DANGER : TEXT_STYLE.BUTTON_PRIMARY);
      }
      state = nextState;
    };

    container.setDisabled = (v) => {
      container._disabled = !!v;
      setState(v ? 'disabled' : 'normal');
    };
    container.setLabel = (s) => {
      labelText.setText(s || '');
    };

    // ── 인터랙션 ──
    container.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);
    container.on('pointerdown', () => {
      if (container._disabled) return;
      setState('pressed');
    });
    container.on('pointerup', () => {
      if (container._disabled) return;
      setState('normal');
      if (typeof opts.onClick === 'function') opts.onClick();
    });
    container.on('pointerupoutside', () => {
      if (container._disabled) return;
      setState('normal');
    });
    container.on('pointerout', () => {
      if (container._disabled) return;
      // pressed 상태에서 드래그 이탈 시 normal로 복귀
      if (state === 'pressed') setState('normal');
    });

    return container;
  },

  /**
   * 가로 진행 바.
   * 프레임(bar_frame_h 또는 bar_frame_thick) + fill(bar_fill, tint 적용) + 선택적 shine 오버레이.
   * value 0.0~1.0 비율로 fill 너비를 조절한다.
   *
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {{
   *   tint?: number,       // fill 색상 (기본 HP 코랄)
   *   value?: number,      // 0~1 (기본 1)
   *   thick?: boolean,     // bar_frame_thick 사용 (기본 false → frame_h)
   *   shine?: boolean,     // 상단 반짝임 오버레이 추가 (기본 true)
   *   paddingX?: number,   // 프레임 내부 좌우 여백(픽셀, 기본 4)
   *   paddingY?: number,   // 프레임 내부 상하 여백(픽셀, 기본 4)
   * }} [opts]
   * @returns {Phaser.GameObjects.Container & { setValue:(v:number)=>void, setTint:(t:number)=>void, _frame:any, _fill:any }}
   */
  progressBar(scene, x, y, width, height, opts = {}) {
    const tint = opts.tint ?? TINT.HP;
    const value = Phaser.Math.Clamp(opts.value ?? 1, 0, 1);
    const thick = !!opts.thick;
    const shine = opts.shine !== false;
    const pX = opts.paddingX ?? 4;
    const pY = opts.paddingY ?? 4;

    const frameTex = thick ? NS_KEYS.BAR_FRAME_THICK : NS_KEYS.BAR_FRAME_H;
    const frameMan = thick ? 'bar_frame_thick'      : 'bar_frame_h';
    const frame = createNineSlice(scene, 0, 0, width, height, frameTex, frameMan);

    // fill은 프레임 안쪽 영역으로 클램프된다.
    // 왼쪽 엣지 기준으로 자라도록 originX=0, originY=0.5로 생성한다.
    const fillMaxW = Math.max(0, width - pX * 2);
    const fillH    = Math.max(0, height - pY * 2);
    const fill = createNineSlice(
      scene,
      -(width / 2) + pX, 0,
      Math.max(1, fillMaxW * value), fillH,
      NS_KEYS.BAR_FILL, 'bar_fill',
      0, 0.5 // 왼쪽-중앙 origin
    );
    fill.setTint(tint);

    const children = [frame, fill];

    let shineObj = null;
    if (shine) {
      shineObj = createNineSlice(
        scene,
        0, -(height / 2) + Math.max(2, pY / 2),
        Math.max(2, width - pX * 2), Math.max(2, Math.floor(height / 3)),
        NS_KEYS.BAR_SHINE_OVERLAY, 'bar_shine_overlay'
      );
      shineObj.setAlpha(0.45);
      children.push(shineObj);
    }

    const container = scene.add.container(x, y, children);
    container.setSize(width, height);
    container._frame = frame;
    container._fill = fill;
    container._shine = shineObj;
    container._maxW = fillMaxW;

    container.setValue = (v) => {
      const cv = Phaser.Math.Clamp(v, 0, 1);
      const newW = Math.max(1, container._maxW * cv);
      fill.setSize(newW, fillH);
    };
    container.setTint = (t) => {
      fill.setTint(t);
    };

    return container;
  },

  /**
   * 탭 생성 (간단 버전). active/inactive 두 상태 텍스처만 스왑한다.
   * 인터랙션은 호출측에서 Container에 직접 붙인다.
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {string} label
   * @param {{ active?: boolean, textStyle?: any }} [opts]
   * @returns {Phaser.GameObjects.Container & { setActive:(v:boolean)=>void }}
   */
  tab(scene, x, y, width, height, label, opts = {}) {
    const active = !!opts.active;
    const bg = createNineSlice(
      scene, 0, 0, width, height,
      active ? NS_KEYS.TAB_ACTIVE : NS_KEYS.TAB_INACTIVE,
      active ? 'tab_active' : 'tab_inactive'
    );
    const txt = scene.add.text(0, 0, label || '', { ...TEXT_STYLE.BUTTON_PRIMARY, ...(opts.textStyle || {}) })
      .setOrigin(0.5);
    const container = scene.add.container(x, y, [bg, txt]);
    container.setSize(width, height);
    container._bg = bg;
    container._label = txt;
    container._active = active;

    container.setActive = (v) => {
      container._active = !!v;
      const { left, right, top, bottom } = resolveInsets(v ? 'tab_active' : 'tab_inactive', scene);
      bg.setTexture(v ? NS_KEYS.TAB_ACTIVE : NS_KEYS.TAB_INACTIVE);
      bg.setSlices(left, right, top, bottom);
    };

    return container;
  },

  /**
   * 툴팁 배경(+옵션 텍스트). 위치는 center 기준.
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {string} [text]
   * @returns {Phaser.GameObjects.Container}
   */
  tooltip(scene, x, y, width, height, text = '') {
    const bg = createNineSlice(scene, 0, 0, width, height, NS_KEYS.TOOLTIP_BG, 'tooltip_bg');
    const children = [bg];
    if (text) {
      const t = scene.add.text(0, 0, text, TEXT_STYLE.CAPTION).setOrigin(0.5);
      children.push(t);
    }
    return scene.add.container(x, y, children).setSize(width, height);
  },

  /**
   * 원형 뱃지 (white base, tint 적용 가능).
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} [size=24]
   * @param {number} [tint=TINT.DANGER]
   * @returns {Phaser.GameObjects.NineSlice}
   */
  badge(scene, x, y, size = 24, tint = TINT.DANGER) {
    const ns = createNineSlice(scene, x, y, size, size, NS_KEYS.BADGE_CIRCLE, 'badge_circle');
    ns.setTint(tint);
    return ns;
  },

  /**
   * 구분선(가로).
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} [height=8]
   */
  dividerH(scene, x, y, width, height = 8) {
    return createNineSlice(scene, x, y, width, height, NS_KEYS.DIVIDER_H, 'divider_h');
  },

  /**
   * 구분선(세로).
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} height
   * @param {number} [width=8]
   */
  dividerV(scene, x, y, height, width = 8) {
    return createNineSlice(scene, x, y, width, height, NS_KEYS.DIVIDER_V, 'divider_v');
  },

  /**
   * 레터박스(상/하단 밴드).
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  letterbox(scene, x, y, width, height) {
    return createNineSlice(scene, x, y, width, height, NS_KEYS.LETTERBOX, 'letterbox');
  },

  /**
   * 매니페스트 메타 조회 (인셋/사이즈/tint).
   * @param {Phaser.Scene} scene
   * @param {string} manifestKey
   */
  getMeta(scene, manifestKey) {
    const m = getManifest(scene);
    return m[manifestKey] || null;
  },

  /**
   * 매니페스트 캐시 리셋(주로 핫리로드/테스트용).
   */
  _resetCache() {
    _manifestCache = null;
  },
};
