import { startNewGame } from '@game/renderer/GameManager';
import { useGameStore } from '@store/useGameStore';

const RARITY_COLOR: Record<string, string> = {
  common: '#a0a0a0',
  rare  : '#4488ff',
  epic  : '#cc44ff',
};

export function DeathScreen() {
  const { score, killCount, runTimeMs, equippedWeapon, difficulty } = useGameStore();

  const totalSec = Math.floor(runTimeMs / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  const timeStr = `${m}:${s.toString().padStart(2, '0')}`;

  return (
    <div
      style={{
        position      : 'absolute',
        inset         : 0,
        display       : 'flex',
        flexDirection : 'column',
        alignItems    : 'center',
        justifyContent: 'center',
        gap           : 24,
        background    : 'rgba(13,10,31,0.94)',
        pointerEvents : 'auto',
      }}
    >
      <div
        style={{
          fontFamily  : 'monospace',
          fontSize    : '48px',
          fontWeight  : 'bold',
          color       : '#f28c28',
          letterSpacing: '4px',
          textShadow  : '0 0 32px rgba(242,140,40,0.6)',
        }}
      >
        YOU DIED
      </div>

      {/* Run stats */}
      <div
        style={{
          display      : 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap          : '24px 48px',
          fontFamily   : 'monospace',
          textAlign    : 'center',
          padding      : '24px 48px',
          background   : 'rgba(71,85,160,0.15)',
          border       : '1px solid #281c50',
          borderRadius : 8,
        }}
      >
        <StatBlock label="TIME"       value={timeStr} />
        <StatBlock label="KILLS"      value={String(killCount)} />
        <StatBlock label="SCORE"      value={String(score)} />
        <StatBlock label="DIFFICULTY" value={difficulty.toFixed(1) + '×'} />
        {equippedWeapon && (
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ color: '#6c5090', fontSize: 11, marginBottom: 4 }}>LAST WEAPON</div>
            <div
              style={{
                color     : RARITY_COLOR[equippedWeapon.rarity] ?? '#fff',
                fontWeight: 'bold',
                fontSize  : 16,
              }}
            >
              {equippedWeapon.label}
            </div>
          </div>
        )}
      </div>

      <button
        style={{
          padding      : '14px 48px',
          fontSize     : '16px',
          fontFamily   : 'monospace',
          fontWeight   : 'bold',
          letterSpacing: '2px',
          background   : '#f28c28',
          color        : '#0d0a1f',
          border       : 'none',
          borderRadius : 4,
          cursor       : 'pointer',
          textTransform: 'uppercase',
          boxShadow    : '0 0 24px rgba(242,140,40,0.5)',
          marginTop    : 8,
        }}
        onClick={startNewGame}
      >
        TRY AGAIN
      </button>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ color: '#4755a0', fontSize: 11, fontFamily: 'monospace' }}>{label}</div>
      <div style={{ color: '#ffffff', fontSize: 22, fontWeight: 'bold', fontFamily: 'monospace' }}>{value}</div>
    </div>
  );
}
