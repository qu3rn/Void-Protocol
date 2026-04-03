/**
 * EventBus – lightweight pub/sub for in-game interactions.
 * Fires synchronously; listeners receive events during the same frame.
 */
import type { GameEvent } from '@shared/types';

type EventType = GameEvent['type'];
type ListenerFor<T extends EventType> = (event: Extract<GameEvent, { type: T }>) => void;

export class EventBus {
  private listeners = new Map<EventType, Array<(e: GameEvent) => void>>();

  on<T extends EventType>(type: T, listener: ListenerFor<T>): void {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type)!.push(listener as (e: GameEvent) => void);
  }

  off<T extends EventType>(type: T, listener: ListenerFor<T>): void {
    const arr = this.listeners.get(type);
    if (!arr) return;
    const idx = arr.indexOf(listener as (e: GameEvent) => void);
    if (idx !== -1) arr.splice(idx, 1);
  }

  emit(event: GameEvent): void {
    const arr = this.listeners.get(event.type);
    if (arr) arr.forEach((fn) => fn(event));
  }

  /** Remove all listeners (used on scene teardown). */
  clear(): void {
    this.listeners.clear();
  }
}
