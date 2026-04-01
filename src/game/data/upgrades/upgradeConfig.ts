import type { UpgradeType } from '@shared/types';

export const UPGRADE_CONFIGS: UpgradeType[] = [
  {
    id: 'damage_boost',
    label: 'Damage Boost',
    effectType: 'damage',
    value: 10,
    dropWeight: 3,
  },
  {
    id: 'speed_boost',
    label: 'Speed Boost',
    effectType: 'speed',
    value: 0.5,
    dropWeight: 3,
  },
  {
    id: 'health_regen',
    label: 'Health Regen',
    effectType: 'health',
    value: 20,
    dropWeight: 4,
  },
];
