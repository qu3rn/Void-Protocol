import { describe, it, expect } from 'vitest';
import { shouldSpawnBoss, getBossThreshold } from '../bossThreshold';

describe('shouldSpawnBoss', () => {
  it('returns false when killCount is 0', () => {
    expect(shouldSpawnBoss('grunt', 0)).toBe(false);
  });

  it('returns false when killCount has not reached threshold', () => {
    expect(shouldSpawnBoss('grunt', 10)).toBe(false);
  });

  it('returns true exactly at the grunt threshold (20)', () => {
    expect(shouldSpawnBoss('grunt', 20)).toBe(true);
  });

  it('returns true at multiples of the threshold', () => {
    expect(shouldSpawnBoss('grunt', 40)).toBe(true);
    expect(shouldSpawnBoss('grunt', 60)).toBe(true);
  });

  it('returns false between multiples', () => {
    expect(shouldSpawnBoss('grunt', 21)).toBe(false);
    expect(shouldSpawnBoss('grunt', 39)).toBe(false);
  });

  it('respects brute threshold (15)', () => {
    expect(shouldSpawnBoss('brute', 15)).toBe(true);
    expect(shouldSpawnBoss('brute', 14)).toBe(false);
  });

  it('respects speeder threshold (30)', () => {
    expect(shouldSpawnBoss('speeder', 30)).toBe(true);
    expect(shouldSpawnBoss('speeder', 29)).toBe(false);
  });
});

describe('getBossThreshold', () => {
  it('returns the correct threshold for each enemy type', () => {
    expect(getBossThreshold('grunt')).toBe(20);
    expect(getBossThreshold('brute')).toBe(15);
    expect(getBossThreshold('speeder')).toBe(30);
  });
});
