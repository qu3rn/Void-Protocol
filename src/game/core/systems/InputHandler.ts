/**
 * InputHandler – centralised keyboard state tracker.
 * Decoupled from any game entity; consumed by GameScene each frame.
 */

export interface InputSnapshot {
  left  : boolean;
  right : boolean;
  /** Jump pressed this frame (not held). */
  jumpPressed : boolean;
  /** Jump button currently held. */
  jumpHeld    : boolean;
  attack      : boolean;
  skill1      : boolean;
  skill2      : boolean;
  pause       : boolean;
  leftClick    : boolean;   // left mouse button just-pressed this frame
  mouseScreenX : number;    // current mouse X in screen/canvas pixels
  mouseScreenY : number;    // current mouse Y in screen/canvas pixels
}

const JUMP_KEYS    = new Set(['Space', 'KeyW', 'ArrowUp']);
const LEFT_KEYS    = new Set(['KeyA', 'ArrowLeft']);
const RIGHT_KEYS   = new Set(['KeyD', 'ArrowRight']);
const ATTACK_KEYS  = new Set(['KeyQ']);
const SKILL1_KEYS  = new Set(['KeyE']);
const SKILL2_KEYS  = new Set(['KeyR']);
const PAUSE_KEYS   = new Set(['Escape', 'KeyP']);

export class InputHandler {
  private held   = new Set<string>();
  private pressed= new Set<string>(); // cleared each frame
  private mouseX = 0;
  private mouseY = 0;
  private mouseClicked = false;  // just-pressed left click

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (!this.held.has(e.code)) this.pressed.add(e.code);
      this.held.add(e.code);
      if (JUMP_KEYS.has(e.code) || ATTACK_KEYS.has(e.code) ||
          SKILL1_KEYS.has(e.code) || SKILL2_KEYS.has(e.code)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.held.delete(e.code);
    });
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mouseClicked = true;
    });
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /** Call at the END of each frame to clear just-pressed flags. */
  flush(): void {
    this.pressed.clear();
    this.mouseClicked = false;
  }

  snapshot(): InputSnapshot {
    const hasAny = (keys: Set<string>, set: Set<string>) =>
      [...keys].some((k) => set.has(k));

    return {
      left        : hasAny(LEFT_KEYS,   this.held),
      right       : hasAny(RIGHT_KEYS,  this.held),
      jumpPressed : hasAny(JUMP_KEYS,   this.pressed),
      jumpHeld    : hasAny(JUMP_KEYS,   this.held),
      attack      : hasAny(ATTACK_KEYS, this.pressed),
      skill1      : hasAny(SKILL1_KEYS, this.pressed),
      skill2      : hasAny(SKILL2_KEYS, this.pressed),
      pause       : hasAny(PAUSE_KEYS,  this.pressed),
      leftClick    : this.mouseClicked,
      mouseScreenX : this.mouseX,
      mouseScreenY : this.mouseY,
    };
  }
}
