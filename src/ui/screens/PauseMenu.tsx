import { resumeGame, startNewGame } from '@game/renderer/GameManager';

const OVERLAY: React.CSSProperties = {
  position      : 'absolute',
  inset         : 0,
  display       : 'flex',
  flexDirection : 'column',
  alignItems    : 'center',
  justifyContent: 'center',
  gap           : 20,
  background    : 'rgba(13,10,31,0.80)',
  pointerEvents : 'auto',
};

const BTN: React.CSSProperties = {
  padding    : '12px 36px',
  fontSize   : '14px',
  fontFamily : 'monospace',
  fontWeight : 'bold',
  letterSpacing: '2px',
  border     : '1px solid #4755a0',
  borderRadius: '4px',
  cursor     : 'pointer',
  textTransform: 'uppercase',
  minWidth   : 200,
};

export function PauseMenu() {
  return (
    <div style={OVERLAY}>
      <div
        style={{
          fontFamily  : 'monospace',
          fontSize    : '32px',
          fontWeight  : 'bold',
          color       : '#ffffff',
          letterSpacing: '6px',
          marginBottom: 16,
        }}
      >
        PAUSED
      </div>

      <button
        style={{ ...BTN, background: '#4755a0', color: '#ffffff' }}
        onClick={resumeGame}
      >
        Resume
      </button>

      <button
        style={{ ...BTN, background: 'transparent', color: '#a08ec0' }}
        onClick={startNewGame}
      >
        Restart Run
      </button>
    </div>
  );
}
