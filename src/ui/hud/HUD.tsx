import { useGameStore } from '@store/useGameStore';

const RARITY_COLOR: Record<string, string> = {
  common: '#a0a0a0',
  rare  : '#4499ff',
  epic  : '#cc44ff',
};

export function HUD() {
  const {
    playerHealth, playerMaxHealth,
    score, killCount,
    runTimeMs, difficulty,
    equippedWeapon, skillSlots,
  } = useGameStore();

  const hpPercent  = Math.max(0, (playerHealth / playerMaxHealth) * 100);
  const totalSec   = Math.floor(runTimeMs / 1000);
  const m          = Math.floor(totalSec / 60);
  const s          = totalSec % 60;
  const timeStr    = `${m}:${s.toString().padStart(2, '0')}`;

  return (
    <div
      style={{
        position   : 'absolute',
        top        : 0,
        left       : 0,
        width      : '100%',
        height     : '100%',
        pointerEvents: 'none',
        fontFamily : 'monospace',
        userSelect : 'none',
      }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div
        style={{
          position  : 'absolute',
          top       : 0,
          left      : 0,
          width     : '100%',
          padding   : '10px 20px',
          display   : 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(13,10,31,0.85)',
          borderBottom: '1px solid #281c50',
        }}
      >
        {/* HP */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 180 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#a08ec0', fontSize: 11 }}>HP</span>
            <span style={{ color: '#6c5090', fontSize: 11 }}>
              {playerHealth} / {playerMaxHealth}
            </span>
          </div>
          <div
            style={{
              width: 180, height: 8,
              background: 'rgba(13,10,31,0.8)',
              borderRadius: 4, overflow: 'hidden',
            }}
          >
            <div
              style={{
                width     : `${hpPercent}%`,
                height    : '100%',
                background: hpPercent > 30 ? '#4755a0' : '#f28c28',
                transition: 'width 0.15s ease',
              }}
            />
          </div>
        </div>

        {/* Timer (center) */}
        <div
          style={{
            position  : 'absolute',
            left      : '50%',
            transform : 'translateX(-50%)',
            fontWeight: 'bold',
            fontSize  : 20,
            color     : '#ffffff',
            letterSpacing: 2,
          }}
        >
          {timeStr}
          <span style={{ fontSize: 11, color: '#4755a0', marginLeft: 8 }}>
            ×{difficulty.toFixed(1)}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 24 }}>
          <Stat label="KILLS" value={killCount} />
          <Stat label="SCORE" value={score} />
        </div>
      </div>

      {/* ── Bottom bar: skills + weapon ──────────────────────────────── */}
      <div
        style={{
          position  : 'absolute',
          bottom    : 0,
          left      : 0,
          width     : '100%',
          padding   : '10px 20px',
          display   : 'flex',
          alignItems: 'center',
          gap       : 16,
          background: 'rgba(13,10,31,0.85)',
          borderTop : '1px solid #281c50',
        }}
      >
        {/* Skill slots */}
        {(['Z', 'X', 'C'] as const).map((key, i) => {
          const slot = skillSlots[i];
          const frac = slot?.readyFraction ?? 0;
          return (
            <div key={i}
              style={{
                display      : 'flex',
                flexDirection: 'column',
                alignItems   : 'center',
                gap          : 3,
              }}
            >
              <div
                style={{
                  width   : 44, height: 44,
                  border  : `2px solid ${frac >= 1 ? '#f28c28' : '#281c50'}`,
                  borderRadius: 4,
                  background: 'rgba(13,10,31,0.6)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Readiness fill */}
                <div
                  style={{
                    position  : 'absolute',
                    bottom    : 0,
                    left      : 0,
                    width     : '100%',
                    height    : `${frac * 100}%`,
                    background: frac >= 1
                      ? 'rgba(242,140,40,0.25)'
                      : 'rgba(71,85,160,0.25)',
                    transition: 'height 0.1s linear',
                  }}
                />
                <span
                  style={{
                    position : 'absolute',
                    top      : '50%',
                    left     : '50%',
                    transform: 'translate(-50%,-50%)',
                    fontSize : 13,
                    fontWeight: 'bold',
                    color    : frac >= 1 ? '#f28c28' : '#4755a0',
                  }}
                >
                  {key}
                </span>
              </div>
              <span style={{ fontSize: 9, color: '#4755a0', maxWidth: 50, textAlign: 'center', lineHeight: 1.2 }}>
                {slot?.label ?? '—'}
              </span>
            </div>
          );
        })}

        {/* Weapon */}
        {equippedWeapon && (
          <div
            style={{
              marginLeft  : 16,
              borderLeft  : '1px solid #281c50',
              paddingLeft : 16,
              display     : 'flex',
              flexDirection: 'column',
              gap         : 3,
            }}
          >
            <span style={{ fontSize: 10, color: '#6c5090' }}>WEAPON</span>
            <span
              style={{
                fontSize  : 14,
                fontWeight: 'bold',
                color     : RARITY_COLOR[equippedWeapon.rarity] ?? '#fff',
              }}
            >
              {equippedWeapon.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <span style={{ opacity: 0.5, fontSize: 10, color: '#a08ec0' }}>{label}</span>
      <span style={{ fontWeight: 'bold', fontSize: 18, color: 'white' }}>{value}</span>
    </div>
  );
}
