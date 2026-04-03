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
        color: '#a08ec0',
        fontSize: '14px',
        userSelect: 'none',
        background: 'rgba(26,16,64,0.85)',
        borderBottom: '1px solid #4755a0',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ opacity: 0.7 }}>HP</span>
        <div
          style={{
            width: 160,
            height: 8,
            background: 'rgba(13,10,31,0.8)',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${hpPercent}%`,
              height: '100%',
              background: hpPercent > 30 ? '#4755a0' : '#f28c28',
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
      <span style={{ opacity: 0.6, fontSize: 11 }}>{label}</span>
      <span style={{ fontWeight: 'bold', fontSize: 18, color: 'white' }}>{value}</span>
    </div>
  );
}
