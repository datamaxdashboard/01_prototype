import { useState } from 'react';
import type { ResearchConfig } from '../config/researchConfig';
import type { Screen, SessionState } from '../state/session';

export function DebugPanel({ config, state, jump }: { config: ResearchConfig; state: SessionState; jump: (screen: Screen) => void }) {
  const [open, setOpen] = useState(false);
  const exportLog = () => {
    const data = JSON.stringify({ config: { scenario: config.scenario, geo: config.geo, wagerUi: config.wagerUi }, events: state.eventLog }, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `research-log-${config.scenario}-${config.geo}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <aside className={`debug-panel${open ? ' open' : ''}`}>
      <button className="debug-toggle" type="button" onClick={() => setOpen(!open)}>DEBUG</button>
      {open && <div className="debug-content">
        <header><b>Moderator</b><button type="button" onClick={() => setOpen(false)}>×</button></header>
        <dl><dt>Scenario</dt><dd>{config.scenario}</dd><dt>GEO</dt><dd>{config.geo}</dd><dt>Screen</dt><dd>{state.currentScreen}</dd><dt>Wager UI</dt><dd>{config.wagerUi}</dd></dl>
        <div className="debug-actions">
          {(['home', 'balance', 'profile', 'withdraw', 'deposit'] as Screen[]).map((screen) => <button type="button" key={screen} onClick={() => jump(screen)}>{screen}</button>)}
        </div>
        <button className="debug-wide" type="button" onClick={() => window.location.reload()}>Reset scenario</button>
        <button className="debug-wide" type="button" onClick={exportLog}>Export log JSON</button>
        <h3>Events ({state.eventLog.length})</h3>
        <ol>{state.eventLog.slice().reverse().map((event, index) => <li key={`${event.timestamp}-${index}`}><time>{event.timestamp.slice(11, 19)}</time> {event.name}{event.payload && <pre>{JSON.stringify(event.payload)}</pre>}</li>)}</ol>
      </div>}
    </aside>
  );
}
