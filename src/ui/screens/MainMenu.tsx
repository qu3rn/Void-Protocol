import { startNewGame } from '@game/renderer/GameManager';

const BTN: React.CSSProperties = {
  padding    : '14px 40px',
  fontSize   : '16px',
  fontFamily : 'monospace',
  fontWeight : 'bold',
  letterSpacing: '2px',
  background : '#f28c28',
  color      : '#0d0a1f',
  border     : 'none',
  borderRadius: '4px',
  cursor     : 'pointer',
  textTransform: 'uppercase',
  boxShadow  : '0 0 24px rgba(242,140,40,0.5)',
};

export function MainMenu() {
  return (
    <div
      style={{
        position      : 'absolute',
        inset         : 0,
        display       : 'flex',
        flexDirection : 'column',
        alignItems    : 'center',
        justifyContent: 'center',
        gap           : 32,
        background    : 'rgba(13,10,31,0.92)',
        pointerEvents : 'auto',
      }}
    >
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily  : 'monospace',
            fontSize    : '64px',
            fontWeight  : 'bold',
            color       : '#ffffff',
            letterSpacing: '6px',
            textShadow  : '0 0 32px rgba(71,85,160,0.8)',
          }}
        >
          VOID PROTOCOL
        </div>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize  : '14px',
            color     : '#4755a0',
            marginTop : 8,
            letterSpacing: '4px',
          }}
        >
          SURVIVE THE VOID
        </div>
      </div>

      {/* Controls hint */}
      <div
        style={{
          fontFamily: 'monospace',
          fontSize  : '12px',
          color     : '#6c5090',
          textAlign : 'center',
          lineHeight: 1.8,
        }}
      >
        A/D — move &nbsp;|&nbsp; SPACE — jump &nbsp;|&nbsp; Z — slash
        &nbsp;|&nbsp; X — barrel &nbsp;|&nbsp; C — cannon
        <br />
        ESC — pause &nbsp;|&nbsp; Collect weapons to power up
      </div>

      <button style={BTN} onClick={startNewGame}>
        START RUN
      </button>
    </div>
  );
}
