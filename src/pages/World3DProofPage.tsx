/**
 * World3DProofPage — runtime proof for the Blender → GLB → R3F round trip.
 *
 * This is a verification surface, not a product screen. It exists so the
 * pipeline can be judged on what the BROWSER renders rather than on what
 * Blender previews, and so the numbers that actually cost frames (draw calls,
 * triangles) come from the renderer instead of from the exporter.
 *
 * Route: /world3d
 */
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeWorld3D, { type WorldStats } from '../components/homepage/world3d/HomeWorld3D';
import type { LionBrain } from '../components/homepage/world3d/lionBrain';

export default function World3DProofPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<WorldStats | null>(null);
  const [showLion, setShowLion] = useState(true);
  const [clip, setClip] = useState<string | null>(null);
  const [wander, setWander] = useState(true);
  const brain = useRef<LionBrain | null>(null);
  /* ?mesh=cage swaps in the raw production cage. Reviewing a retopology pass in
     Blender proves nothing about how it skins and shades at runtime.

     ?mesh=assembled is the GATE 15 output — the same cage but carrying the
     face, the mane and all 16 morph targets in one file. Kept as a separate
     value rather than repointing `cage`, so the faceless cage stays available
     to compare against. */
  const meshParam = new URLSearchParams(window.location.search).get('mesh');
  const lionUrl = meshParam === 'cage'
    ? '/assets/lion/cage/lion_cage_anim.glb'
    : meshParam === 'assembled'
      ? '/assets/lion/cage/lion.glb'
      : undefined;
  const [showHud, setShowHud] = useState(true);

  const onStats = useCallback((s: WorldStats) => setStats({ ...s }), []);

  const markerRows = stats?.markers
    ? Object.entries(stats.markers).sort(([a], [b]) => a.localeCompare(b))
    : [];

  return (
    <div className="min-h-dvh relative overflow-hidden" style={{ background: '#8fd0f0' }}>
      <HomeWorld3D showLion={showLion} lionClip={clip} wander={wander} brainRef={brain} lionUrl={lionUrl} onStats={onStats} />

      {/* DOM overlay — proves UI composites over the 3D world exactly as the
          real homepage will, with the canvas behind and controls above. */}
      <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between pointer-events-none">
        <button
          onClick={() => navigate('/')}
          className="pointer-events-auto rounded-full px-3 py-2 text-xs font-bold"
          style={{ background: 'rgba(0,0,0,0.35)', color: 'white', backdropFilter: 'blur(8px)' }}
        >
          ← Back
        </button>
        <div className="flex gap-2 pointer-events-auto flex-wrap justify-end" style={{ maxWidth: 900 }}>
          {['Idle', 'Walk', 'Wave', 'Sit', 'Jump', 'Celebrate', 'Nod', 'LookAround', 'Talk', 'Sleep'].map((c) => (
            <button
              key={c}
              onClick={() => { setWander(false); setClip(c); }}
              className="rounded-full px-3 py-2 text-xs font-bold"
              style={{
                background: clip === c ? '#4ECDC4' : 'rgba(255,255,255,0.92)',
                color: clip === c ? 'white' : '#2D2D3A',
              }}
            >
              {c}
            </button>
          ))}
          <button
            onClick={() => { setClip(null); setWander((v) => !v); }}
            className="rounded-full px-3 py-2 text-xs font-bold"
            style={{ background: wander ? '#FF8C42' : 'rgba(255,255,255,0.92)', color: wander ? 'white' : '#2D2D3A' }}
          >
            {wander ? 'Wander ON' : 'Wander OFF'}
          </button>
          {/* SEMANTIC controls, which is what LionBrain actually exposes.
              The clip buttons above set `clipOverride` and so bypass the brain
              entirely — useful for auditioning a single action, useless for
              testing the sequencing. These call the API the app calls, so the
              cage's WalkStart -> Walk -> WalkStop chain and the five-phase jump
              are exercisable rather than merely present in the GLB. */}
          {/* Written out rather than mapped over an array of closures: building
              that array during render reads `brain.current` at render time,
              which `react-hooks` correctly flags. The repetition is the price
              of the rule, and it matches the buttons above. */}
          <button
            onClick={() => { setClip(null); brain.current?.walkTo(-1.1, 0.5); }}
            className="rounded-full px-3 py-2 text-xs font-bold"
            style={{ background: 'rgba(120,200,255,0.92)', color: '#12263A' }}
          >
            walkTo
          </button>
          <button
            onClick={() => { setClip(null); brain.current?.turnTo(1.3, 0.2); }}
            className="rounded-full px-3 py-2 text-xs font-bold"
            style={{ background: 'rgba(120,200,255,0.92)', color: '#12263A' }}
          >
            turnTo
          </button>
          <button
            onClick={() => { setClip(null); brain.current?.jump(); }}
            className="rounded-full px-3 py-2 text-xs font-bold"
            style={{ background: 'rgba(120,200,255,0.92)', color: '#12263A' }}
          >
            jump()
          </button>
          <button
            onClick={() => { setClip(null); brain.current?.lookAt(0, 4.6, 0.4); }}
            className="rounded-full px-3 py-2 text-xs font-bold"
            style={{ background: 'rgba(120,200,255,0.92)', color: '#12263A' }}
          >
            lookAt card
          </button>
          <button
            onClick={() => { setClip(null); brain.current?.lookAhead(); }}
            className="rounded-full px-3 py-2 text-xs font-bold"
            style={{ background: 'rgba(120,200,255,0.92)', color: '#12263A' }}
          >
            lookAhead
          </button>
          <button
            onClick={() => { setClip(null); brain.current?.walkTo(-1.1, 0.5); }}
            className="rounded-full px-3 py-2 text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.92)', color: '#2D2D3A' }}
          >
            Walk left
          </button>
          <button
            onClick={() => { setClip(null); brain.current?.greet(0, 0.9); }}
            className="rounded-full px-3 py-2 text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.92)', color: '#2D2D3A' }}
          >
            Greet
          </button>
          <button
            onClick={() => setShowLion((v) => !v)}
            className="rounded-full px-3 py-2 text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.92)', color: '#2D2D3A' }}
          >
            {showLion ? 'Hide lion' : 'Show lion'}
          </button>
          <button
            onClick={() => setShowHud((v) => !v)}
            className="rounded-full px-3 py-2 text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.92)', color: '#2D2D3A' }}
          >
            {showHud ? 'Hide HUD' : 'Show HUD'}
          </button>
        </div>
      </div>

      {showHud && (
        <div
          className="absolute left-3 bottom-3 rounded-xl p-3 text-[11px] leading-relaxed font-mono"
          style={{
            background: 'rgba(12,16,24,0.82)', color: '#d8f2ff',
            backdropFilter: 'blur(10px)', maxWidth: 340,
          }}
          data-testid="world3d-hud"
        >
          <div className="font-bold mb-1" style={{ color: '#8fe3ff' }}>RUNTIME (browser truth)</div>
          {!stats && <div>loading GLB…</div>}
          {stats && (
            <>
              <div>draw calls : {stats.drawCalls ?? '—'}</div>
              <div>triangles  : {stats.triangles?.toLocaleString() ?? '—'}</div>
              <div>materials  : {stats.materials ?? '—'}</div>
              <div>camera fov : {stats.cameraFov?.toFixed(2) ?? '—'}</div>
              <div>
                camera pos : {stats.cameraPos
                  ? `${stats.cameraPos.x.toFixed(2)}, ${stats.cameraPos.y.toFixed(2)}, ${stats.cameraPos.z.toFixed(2)}`
                  : '—'}
              </div>
              <div>
                lion height: {stats.lionHeight ? `${stats.lionHeight.toFixed(3)} m` : '— (hidden)'}
              </div>
              <div>
                floor gap  : {stats.lionFloorGap == null ? '—' : `${(stats.lionFloorGap * 1000).toFixed(1)} mm`}
                {stats.lionGrounded === false && ' (seated)'}
              </div>
              <div>clips      : {stats.lionClips?.join(', ') ?? '—'}</div>
              <div>override   : {clip ?? 'none'}</div>
              <div>brain clip : {stats.lionBrainClip ?? '—'}</div>
              <div>
                gaze       : {stats.lionGaze
                  ? `${stats.lionGaze.at}  (${stats.lionGaze.yaw.toFixed(1)}°, ${stats.lionGaze.pitch.toFixed(1)}°)`
                  : '—'}
              </div>
              <div className="mt-1 font-bold" style={{ color: '#8fe3ff' }}>MARKERS (from GLB)</div>
              {markerRows.length === 0 && <div>none found</div>}
              {markerRows.map(([name, v]) => (
                <div key={name}>
                  {name.replace('MARK_', '').padEnd(14, ' ')}: {v.x.toFixed(2)}, {v.y.toFixed(2)}, {v.z.toFixed(2)}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
