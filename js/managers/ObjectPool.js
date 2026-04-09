/**
 * @fileoverview 범용 오브젝트 풀.
 * Phase 11-3c: 성능 최적화 — 오브젝트 생성/파괴 비용을 줄이기 위해
 * 재활용 가능한 오브젝트 풀을 제공한다.
 * VFX 파티클, 투사체, 적 등 빈번히 생성/파괴되는 오브젝트에 사용.
 */

/**
 * 범용 오브젝트 풀 클래스.
 * acquire()로 풀에서 오브젝트를 꺼내고, release()로 반환한다.
 * 풀이 비어 있으면 팩토리 함수로 새 오브젝트를 생성한다.
 *
 * @template T
 */
export class ObjectPool {
  /**
   * @param {() => T} factory - 새 오브젝트를 생성하는 팩토리 함수
   * @param {(obj: T) => void} [resetFn] - acquire 시 오브젝트를 초기 상태로 리셋하는 함수
   * @param {object} [options]
   * @param {number} [options.initialSize=0] - 초기 풀 크기 (미리 생성할 오브젝트 수)
   * @param {number} [options.maxSize=100] - 최대 풀 크기 (이 이상은 release 시 버림)
   */
  constructor(factory, resetFn = null, options = {}) {
    /** @private */
    this._factory = factory;
    /** @private */
    this._resetFn = resetFn;
    /** @private @type {T[]} */
    this._pool = [];
    /** @type {number} 최대 풀 크기 */
    this.maxSize = options.maxSize ?? 100;
    /** @type {number} 현재 활성(대여 중) 오브젝트 수 추적 */
    this._activeCount = 0;

    // 초기 풀 채우기
    const initialSize = options.initialSize ?? 0;
    for (let i = 0; i < initialSize; i++) {
      this._pool.push(this._factory());
    }
  }

  /**
   * 풀에서 오브젝트를 하나 꺼낸다.
   * 풀이 비어 있으면 팩토리로 새로 생성한다.
   * resetFn이 설정되어 있으면 꺼낸 오브젝트에 적용한다.
   * @returns {T}
   */
  acquire() {
    let obj;
    if (this._pool.length > 0) {
      obj = this._pool.pop();
    } else {
      obj = this._factory();
    }
    if (this._resetFn) {
      this._resetFn(obj);
    }
    this._activeCount++;
    return obj;
  }

  /**
   * 오브젝트를 풀에 반환한다.
   * 풀이 maxSize에 도달했으면 반환하지 않고 버린다.
   * @param {T} obj - 반환할 오브젝트
   */
  release(obj) {
    this._activeCount = Math.max(0, this._activeCount - 1);
    if (this._pool.length < this.maxSize) {
      this._pool.push(obj);
    }
  }

  /**
   * 모든 오브젝트를 풀에 반환한다 (외부에서 활성 오브젝트 목록을 관리하는 경우 사용).
   * 주어진 배열의 모든 오브젝트를 풀에 넣고 배열을 비운다.
   * @param {T[]} activeList - 활성 오브젝트 배열 (이 배열이 비워진다)
   */
  releaseAll(activeList) {
    while (activeList.length > 0) {
      this.release(activeList.pop());
    }
  }

  /**
   * 풀에 대기 중인 오브젝트 수.
   * @returns {number}
   */
  get availableCount() {
    return this._pool.length;
  }

  /**
   * 현재 활성(대여 중) 오브젝트 수.
   * @returns {number}
   */
  get activeCount() {
    return this._activeCount;
  }

  /**
   * 풀을 완전히 비운다. 씬 파괴 시 호출.
   */
  clear() {
    this._pool.length = 0;
    this._activeCount = 0;
  }
}
