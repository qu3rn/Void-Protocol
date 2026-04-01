import { useGameStore } from '@store/useGameStore';

export function HUD() {
  const { playerHealth, playerMaxHealth, score, waveNumber, killCount } = useGameStore();

  const hpPercent = Math.max(0, (playerHealth / playerMaxHealth) * 100);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        padding: '12px 20px',
        display: 'flex',
        gap: '32px',
        alignItems: 'center',
        pointerEvents: 'none',
        fontFamily: 'monospace',
        color: '#e0e8ff',
        fontSize: '14px',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ opacity: 0.7 }}>HP</span>
        <div
          style={{
            width: 160,
            height: 8,
            background: '#222',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${hpPercent}%`,
              height: '100%',
              background: hpPercent > 50 ? '#44dd88' : hpPercent > 20 ? '#ffaa22' : '#ff3333',
              transition: 'width 0.2s ease',
            }}
          />
        </div>
        <span style={{ opacity: 0.6, fontSize: 11 }}>
          {playerHealth} / {playerMaxHealth}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        <Stat label="WAVE" value={waveNumber} />
        <Stat label="KILLS" value={killCount} />
        <Stat label="SCORE" value={score} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <span style={{ opacity: 0.5, fontSize: 11 }}>{label}</span>
      <span style={{ fontWeight: 'bold', fontSize: 18 }}>{value}</span>
    </div>
  );
}
