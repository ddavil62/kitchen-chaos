/**
 * @fileoverview 사운드 매니저.
 * Web Audio API를 사용한 프로시저럴 SFX 생성 및 BGM 관리.
 * 싱글턴 패턴 (static 클래스). 어디서든 import해서 사용 가능.
 *
 * Phase 10-4: 신규 생성.
 */

import { GameEventBus } from '../events/GameEventBus.js';

// ── SFX 프리셋 정의 ──────────────────────────────────────────────

/**
 * SFX 프리셋. Web Audio OscillatorNode + GainNode로 재생.
 * @type {Object.<string, {type: string, freq?: number, duration: number, sweep?: number, filter?: string, notes?: number[]}>}
 */
const SFX_PRESETS = {
  sfx_wave_start:   { type: 'square',   freq: 440,  duration: 0.3,  sweep: 880 },
  sfx_wave_clear:   { type: 'square',   freq: 523,  duration: 0.5,  sweep: 1046 },
  sfx_enemy_death:  { type: 'noise',    duration: 0.1 },
  sfx_enemy_base:   { type: 'sawtooth', freq: 200,  duration: 0.4,  sweep: 100 },
  sfx_tower_pan:    { type: 'noise',    duration: 0.08, filter: 'highpass' },
  sfx_tower_salt:   { type: 'noise',    duration: 0.12, filter: 'bandpass' },
  sfx_tower_grill:  { type: 'noise',    duration: 0.15, filter: 'lowpass' },
  sfx_tower_freezer:{ type: 'sine',     freq: 800,  duration: 0.2,  sweep: 2000 },
  sfx_victory:      { type: 'square',   freq: 523,  duration: 0.8,  notes: [523, 659, 784] },
  sfx_defeat:       { type: 'sawtooth', freq: 300,  duration: 0.6,  sweep: 100 },
  sfx_serve:        { type: 'sine',     freq: 880,  duration: 0.15, sweep: 1200 },
  sfx_ingredient:   { type: 'sine',     freq: 660,  duration: 0.1,  sweep: 1320 },
  sfx_buff_on:      { type: 'sine',     freq: 440,  duration: 0.3,  sweep: 880 },
  sfx_buff_off:     { type: 'sine',     freq: 880,  duration: 0.3,  sweep: 440 },
  sfx_combo:        { type: 'square',   freq: 523,  duration: 0.15, sweep: 1046 },
  sfx_boss_appear:  { type: 'sawtooth', freq: 100,  duration: 1.0,  sweep: 50 },
  sfx_boss_death:   { type: 'square',   freq: 261,  duration: 1.0,  notes: [261, 329, 392, 523] },
  sfx_customer_in:  { type: 'sine',     freq: 800,  duration: 0.15 },
  sfx_customer_out: { type: 'sine',     freq: 400,  duration: 0.2,  sweep: 200 },
  sfx_ui_tap:       { type: 'sine',     freq: 600,  duration: 0.05 },
};

// ── BGM 프리셋 정의 (간단한 톤 패턴) ────────────────────────────

/**
 * BGM 프리셋. Web Audio OscillatorNode로 간단한 반복 패턴 생성.
 * @type {Object.<string, {notes: number[], noteDuration: number, waveType: string, volume: number}>}
 */
const BGM_PRESETS = {
  bgm_menu: {
    notes: [523, 659, 784, 659, 523, 784, 659, 523],
    noteDuration: 0.3,
    waveType: 'sine',
    volume: 0.15,
  },
  bgm_battle: {
    notes: [330, 0, 330, 0, 440, 0, 330, 0, 523, 0, 440, 0, 330, 0, 262, 0],
    noteDuration: 0.15,
    waveType: 'square',
    volume: 0.08,
  },
  bgm_boss: {
    notes: [110, 0, 130, 0, 110, 0, 98, 0, 110, 0, 130, 0, 147, 0, 130, 0],
    noteDuration: 0.25,
    waveType: 'sawtooth',
    volume: 0.1,
  },
  bgm_service: {
    notes: [392, 494, 587, 494, 523, 659, 587, 494],
    noteDuration: 0.25,
    waveType: 'triangle',
    volume: 0.12,
  },
  bgm_result: {
    notes: [523, 659, 784, 1046, 784, 659, 523, 0],
    noteDuration: 0.4,
    waveType: 'sine',
    volume: 0.12,
  },
};

// ── SFX 스로틀 최소 간격 (ms) ──
const SFX_THROTTLE_MS = 50;

// ── BGM 크로스페이드 시간 (s) ──
const CROSSFADE_DURATION = 0.5;

/**
 * 사운드 매니저 (싱글턴, static 클래스).
 * Web Audio API 기반 프로시저럴 SFX + BGM 관리.
 */
export class SoundManager {
  /** @type {AudioContext|null} */
  static _ctx = null;

  /** @type {boolean} 초기화 완료 여부 */
  static _initialized = false;

  /** @type {number} BGM 볼륨 (0.0~1.0) */
  static _bgmVolume = 0.7;

  /** @type {number} SFX 볼륨 (0.0~1.0) */
  static _sfxVolume = 0.8;

  /** @type {boolean} 전체 음소거 */
  static _muted = false;

  /** @type {GainNode|null} BGM 마스터 게인 */
  static _bgmGain = null;

  /** @type {GainNode|null} SFX 마스터 게인 */
  static _sfxGain = null;

  /** @type {string|null} 현재 재생 중인 BGM ID */
  static _currentBGMId = null;

  /** @type {object|null} 현재 BGM 재생 상태 (스케줄러 핸들) */
  static _bgmState = null;

  /** @type {Object.<string, number>} SFX별 마지막 재생 시각 (스로틀용) */
  static _lastPlayTime = {};

  /**
   * AudioContext 초기화 + GameEventBus 이벤트 연결.
   * BootScene.create()에서 1회 호출.
   * @param {Phaser.Scene} scene - 임의의 Phaser 씬 (이벤트 바인딩용)
   */
  static init(scene) {
    if (SoundManager._initialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn('[SoundManager] Web Audio API를 지원하지 않는 환경');
        return;
      }
      SoundManager._ctx = new AudioCtx();

      // ── 마스터 게인 노드 설정 ──
      SoundManager._bgmGain = SoundManager._ctx.createGain();
      SoundManager._bgmGain.gain.value = SoundManager._muted ? 0 : SoundManager._bgmVolume;
      SoundManager._bgmGain.connect(SoundManager._ctx.destination);

      SoundManager._sfxGain = SoundManager._ctx.createGain();
      SoundManager._sfxGain.gain.value = SoundManager._muted ? 0 : SoundManager._sfxVolume;
      SoundManager._sfxGain.connect(SoundManager._ctx.destination);

      // ── 모바일 AudioContext resume (사용자 제스처 필요) ──
      SoundManager._setupResumeOnGesture();

      // ── 백그라운드/포그라운드 전환 처리 ──
      SoundManager._setupVisibilityHandler();

      // ── GameEventBus 이벤트 연동 ──
      SoundManager._bindEvents();

      SoundManager._initialized = true;
    } catch (e) {
      console.warn('[SoundManager] 초기화 실패:', e);
    }
  }

  /**
   * visibilitychange 이벤트 핸들러.
   * 백그라운드 진입 시 BGM 타이머 정지 + AudioContext suspend,
   * 포그라운드 복귀 시 resume 후 BGM 재시작하여 오실레이터 중복 방지.
   * @private
   */
  static _setupVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 백그라운드: BGM 루프 타이머 정지, AudioContext 일시정지
        if (SoundManager._bgmState?.timerId) {
          clearTimeout(SoundManager._bgmState.timerId);
          SoundManager._bgmState.timerId = null;
        }
        if (SoundManager._ctx?.state === 'running') {
          SoundManager._ctx.suspend();
        }
      } else {
        // 포그라운드 복귀: AudioContext resume 후 BGM 클린 재시작
        const restartBGM = () => {
          const id = SoundManager._currentBGMId;
          if (id) {
            SoundManager._stopBGMInternal(0);
            SoundManager._currentBGMId = null;
            SoundManager.playBGM(id);
          }
        };

        if (SoundManager._ctx?.state === 'suspended') {
          SoundManager._ctx.resume().then(restartBGM).catch(() => restartBGM());
        } else {
          restartBGM();
        }
      }
    });
  }

  /**
   * 모바일 환경에서 첫 터치/클릭 시 AudioContext.resume() 호출.
   * @private
   */
  static _setupResumeOnGesture() {
    const resume = () => {
      if (SoundManager._ctx && SoundManager._ctx.state === 'suspended') {
        SoundManager._ctx.resume();
      }
      document.removeEventListener('touchstart', resume);
      document.removeEventListener('click', resume);
      document.removeEventListener('pointerdown', resume);
    };
    document.addEventListener('touchstart', resume, { once: true });
    document.addEventListener('click', resume, { once: true });
    document.addEventListener('pointerdown', resume, { once: true });
  }

  /**
   * GameEventBus 이벤트 구독 — SFX 자동 재생.
   * @private
   */
  static _bindEvents() {
    GameEventBus.on('wave_started', () => SoundManager.playSFX('sfx_wave_start'));
    GameEventBus.on('wave_cleared', () => SoundManager.playSFX('sfx_wave_clear'));
    GameEventBus.on('serve_success', () => SoundManager.playSFX('sfx_serve'));
    GameEventBus.on('ingredient_collected', () => SoundManager.playSFX('sfx_ingredient'));
    GameEventBus.on('buff_activated', () => SoundManager.playSFX('sfx_buff_on'));
    GameEventBus.on('buff_expired', () => SoundManager.playSFX('sfx_buff_off'));
    GameEventBus.on('combo_changed', (d) => {
      if (d && d.count >= 3) SoundManager.playSFX('sfx_combo');
    });
    GameEventBus.on('game_over', (d) => {
      SoundManager.playSFX(d && d.isVictory ? 'sfx_victory' : 'sfx_defeat');
      SoundManager.playBGM('bgm_result');
    });
  }

  // ── SFX 재생 ────────────────────────────────────────────────────

  /**
   * SFX 재생. 프리셋 ID로 프로시저럴 사운드 생성.
   * 동일 SFX는 최소 50ms 간격 스로틀.
   * @param {string} id - SFX 프리셋 ID (예: 'sfx_enemy_death')
   */
  static playSFX(id) {
    if (!SoundManager._ctx || !SoundManager._initialized) return;
    if (SoundManager._muted) return;

    const preset = SFX_PRESETS[id];
    if (!preset) return;

    // ── 스로틀 체크 ──
    const now = performance.now();
    if (SoundManager._lastPlayTime[id] && now - SoundManager._lastPlayTime[id] < SFX_THROTTLE_MS) {
      return;
    }
    SoundManager._lastPlayTime[id] = now;

    // ── AudioContext resume (suspended 상태 대비) ──
    if (SoundManager._ctx.state === 'suspended') {
      SoundManager._ctx.resume();
    }

    try {
      if (preset.notes) {
        SoundManager._playNoteSequence(preset);
      } else if (preset.type === 'noise') {
        SoundManager._playNoise(preset);
      } else {
        SoundManager._playTone(preset);
      }
    } catch (e) {
      // 사운드 재생 실패 시 무시 (게임 중단 방지)
    }
  }

  /**
   * 단일 톤(오실레이터) SFX 재생.
   * @param {object} preset
   * @private
   */
  static _playTone(preset) {
    const ctx = SoundManager._ctx;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = preset.type;
    osc.frequency.setValueAtTime(preset.freq, t);

    // 주파수 스윕 (상승 또는 하강)
    if (preset.sweep) {
      osc.frequency.linearRampToValueAtTime(preset.sweep, t + preset.duration);
    }

    // 엔벨로프: 빠른 어택 → 디케이
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + preset.duration);

    osc.connect(gain);
    gain.connect(SoundManager._sfxGain);

    osc.start(t);
    osc.stop(t + preset.duration + 0.01);
  }

  /**
   * 노트 시퀀스 SFX 재생 (승리/보스 처치 팡파르).
   * @param {object} preset
   * @private
   */
  static _playNoteSequence(preset) {
    const ctx = SoundManager._ctx;
    const t = ctx.currentTime;
    const noteDur = preset.duration / preset.notes.length;

    preset.notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = preset.type;
      osc.frequency.setValueAtTime(freq, t + i * noteDur);

      gain.gain.setValueAtTime(0.25, t + i * noteDur);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (i + 1) * noteDur);

      osc.connect(gain);
      gain.connect(SoundManager._sfxGain);

      osc.start(t + i * noteDur);
      osc.stop(t + (i + 1) * noteDur + 0.01);
    });
  }

  /**
   * 노이즈 SFX 재생 (버퍼 기반 화이트 노이즈 + 필터).
   * @param {object} preset
   * @private
   */
  static _playNoise(preset) {
    const ctx = SoundManager._ctx;
    const t = ctx.currentTime;
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * preset.duration);

    // 화이트 노이즈 버퍼 생성
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + preset.duration);

    // 필터 적용 (있으면)
    if (preset.filter) {
      const filter = ctx.createBiquadFilter();
      filter.type = preset.filter;
      filter.frequency.setValueAtTime(
        preset.filter === 'lowpass' ? 800 :
        preset.filter === 'highpass' ? 2000 : 1200,
        t
      );
      filter.Q.setValueAtTime(1.0, t);
      source.connect(filter);
      filter.connect(gain);
    } else {
      source.connect(gain);
    }

    gain.connect(SoundManager._sfxGain);

    source.start(t);
    source.stop(t + preset.duration + 0.01);
  }

  // ── BGM 재생 ────────────────────────────────────────────────────

  /**
   * BGM 시작. 크로스페이드로 전환.
   * @param {string} id - BGM 프리셋 ID (예: 'bgm_menu')
   */
  static playBGM(id) {
    if (!SoundManager._ctx || !SoundManager._initialized) return;

    // 같은 BGM이면 무시
    if (SoundManager._currentBGMId === id) return;

    const preset = BGM_PRESETS[id];
    if (!preset) return;

    // 기존 BGM 페이드 아웃
    SoundManager._stopBGMInternal(CROSSFADE_DURATION);

    // 새 BGM 시작
    SoundManager._currentBGMId = id;
    SoundManager._startBGMLoop(preset);
  }

  /**
   * BGM 정지.
   */
  static stopBGM() {
    SoundManager._stopBGMInternal(0.1);
    SoundManager._currentBGMId = null;
  }

  /**
   * BGM 크로스페이드 전환 (playBGM과 동일, 명시적 크로스페이드용).
   * @param {string} id
   */
  static crossfadeBGM(id) {
    SoundManager.playBGM(id);
  }

  /**
   * 내부: BGM 루프 시작.
   * @param {object} preset
   * @private
   */
  static _startBGMLoop(preset) {
    const ctx = SoundManager._ctx;
    if (!ctx) return;

    // BGM 상태 객체
    const state = {
      active: true,
      gainNode: ctx.createGain(),
      scheduledOscs: [],
      timerId: null,
    };

    state.gainNode.gain.value = 0;
    state.gainNode.connect(SoundManager._bgmGain);

    // 페이드 인
    const t = ctx.currentTime;
    state.gainNode.gain.setValueAtTime(0, t);
    state.gainNode.gain.linearRampToValueAtTime(preset.volume, t + CROSSFADE_DURATION);

    SoundManager._bgmState = state;

    // 노트 스케줄링 함수
    const loopDuration = preset.notes.length * preset.noteDuration;

    const scheduleLoop = () => {
      if (!state.active) return;
      const now = ctx.currentTime;

      preset.notes.forEach((freq, i) => {
        if (freq === 0) return; // 쉼표

        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = preset.waveType;
        osc.frequency.setValueAtTime(freq, now + i * preset.noteDuration);

        noteGain.gain.setValueAtTime(0.8, now + i * preset.noteDuration);
        noteGain.gain.setValueAtTime(0.001, now + (i + 0.9) * preset.noteDuration);

        osc.connect(noteGain);
        noteGain.connect(state.gainNode);

        osc.start(now + i * preset.noteDuration);
        osc.stop(now + (i + 1) * preset.noteDuration);

        state.scheduledOscs.push(osc);
      });

      // 오래된 오실레이터 참조 정리 (메모리 누수 방지)
      if (state.scheduledOscs.length > 64) {
        state.scheduledOscs = state.scheduledOscs.slice(-32);
      }

      // 다음 루프 스케줄
      state.timerId = setTimeout(scheduleLoop, loopDuration * 1000 - 100);
    };

    scheduleLoop();
  }

  /**
   * 내부: BGM 정지 (페이드 아웃 포함).
   * @param {number} fadeDuration - 페이드 아웃 시간 (초)
   * @private
   */
  static _stopBGMInternal(fadeDuration) {
    const state = SoundManager._bgmState;
    if (!state) return;

    state.active = false;

    // 타이머 취소
    if (state.timerId) {
      clearTimeout(state.timerId);
      state.timerId = null;
    }

    // 페이드 아웃
    if (SoundManager._ctx && state.gainNode) {
      const t = SoundManager._ctx.currentTime;
      try {
        state.gainNode.gain.cancelScheduledValues(t);
        state.gainNode.gain.setValueAtTime(state.gainNode.gain.value, t);
        state.gainNode.gain.linearRampToValueAtTime(0, t + fadeDuration);
      } catch (e) {
        // 이미 해제된 노드일 수 있음
      }

      // 페이드 완료 후 오실레이터 정리
      setTimeout(() => {
        state.scheduledOscs.forEach(osc => {
          try { osc.stop(); } catch (e) { /* 이미 정지됨 */ }
        });
        state.scheduledOscs = [];
        try { state.gainNode.disconnect(); } catch (e) { /* 무시 */ }
      }, fadeDuration * 1000 + 100);
    }

    SoundManager._bgmState = null;
  }

  // ── 볼륨/음소거 설정 ────────────────────────────────────────────

  /**
   * BGM 볼륨 설정.
   * @param {number} v - 0.0~1.0
   */
  static setBGMVolume(v) {
    SoundManager._bgmVolume = Math.max(0, Math.min(1, v));
    if (SoundManager._bgmGain && !SoundManager._muted) {
      SoundManager._bgmGain.gain.setValueAtTime(
        SoundManager._bgmVolume, SoundManager._ctx.currentTime
      );
    }
  }

  /**
   * SFX 볼륨 설정.
   * @param {number} v - 0.0~1.0
   */
  static setSFXVolume(v) {
    SoundManager._sfxVolume = Math.max(0, Math.min(1, v));
    if (SoundManager._sfxGain && !SoundManager._muted) {
      SoundManager._sfxGain.gain.setValueAtTime(
        SoundManager._sfxVolume, SoundManager._ctx.currentTime
      );
    }
  }

  /**
   * 전체 음소거 토글.
   * @param {boolean} m
   */
  static setMuted(m) {
    SoundManager._muted = m;
    if (!SoundManager._ctx) return;

    const t = SoundManager._ctx.currentTime;
    if (SoundManager._bgmGain) {
      SoundManager._bgmGain.gain.setValueAtTime(m ? 0 : SoundManager._bgmVolume, t);
    }
    if (SoundManager._sfxGain) {
      SoundManager._sfxGain.gain.setValueAtTime(m ? 0 : SoundManager._sfxVolume, t);
    }
  }

  /**
   * 현재 사운드 설정 반환.
   * @returns {{ bgmVolume: number, sfxVolume: number, muted: boolean }}
   */
  static getSettings() {
    return {
      bgmVolume: SoundManager._bgmVolume,
      sfxVolume: SoundManager._sfxVolume,
      muted: SoundManager._muted,
    };
  }

  /**
   * 사운드 설정 적용 (SaveManager 로드 시 호출).
   * @param {{ bgmVolume?: number, sfxVolume?: number, muted?: boolean }} s
   */
  static applySettings(s) {
    if (s == null) return;
    if (typeof s.bgmVolume === 'number') SoundManager.setBGMVolume(s.bgmVolume);
    if (typeof s.sfxVolume === 'number') SoundManager.setSFXVolume(s.sfxVolume);
    if (typeof s.muted === 'boolean') SoundManager.setMuted(s.muted);
  }
}
