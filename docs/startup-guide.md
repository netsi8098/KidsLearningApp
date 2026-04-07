# Kids Learning Fun - Startup Sequence Guide

Technical documentation for the branded startup sequence system.

---

## 1. Design Rationale

The startup sequence serves three purposes:

1. **Brand identity** -- Children and parents immediately recognise the app
   through its mascot, colors, and book icon.
2. **Emotional priming** -- The first-launch sequence builds excitement;
   bedtime primes calmness; offline reassures availability.
3. **Loading cover** -- While React, lazy chunks, and IndexedDB initialise,
   the sequence provides a polished visual rather than a blank screen.

The sequence is intentionally **short**. Young children have limited patience
and parents expect instant responsiveness. The longest variant (first-launch)
is only 2.5 seconds.

---

## 2. Variant Descriptions

### First Launch (2.5 s)

Shown the very first time the app opens on a device. After completion, a
`localStorage` flag prevents it from appearing again.

```
Timeline (ms):
0─────600────1000────1500────2000────2500
|  icon  |                                  Brand book icon scales up (spring bounce)
|     |  mascot  |                          Lion mascot fades in, arm waves
|              |   title   |                App name types in letter-by-letter
|                    |  sub |               "Let's explore together!" fades in
|        | particles ────── |               Gold stars sparkle in background
                                       500  Skip available from here
                                      2500  Auto-complete
```

**Audio cue**: `startup-chime` (gentle ascending arpeggio at 0.6 s)

### Regular Launch (1.2 s)

Shown on subsequent app opens within a new session.

```
Timeline (ms):
0─────400────800────1200
|  icon  |                  Quick brand flash (scale overshoot)
|   | mascot |              Lion mascot with brief wave
|      | title |            "Kids Learning Fun!" fades in
                       500  Skip available
                      1200  Auto-complete
```

**Audio cue**: `startup-quick` (single soft chime)

### Bedtime Launch (2.0 s)

Shown when bedtime mode is active.

```
Timeline (ms):
0─────500────1000────1500────2000
| particles ─────── |              Twinkling star dots fade in
|     | moon icon |                Moon SVG gently appears
|           | owl |                Sleeping owl emoji, slow breathe
|                 | title |        "Sweet Dreams..." in lavender
                              500  Skip available
                             2000  Auto-complete
```

**Audio cue**: `startup-lullaby` (very quiet, single low note)

**Colors**: Night sky background (#1a1a2e), lavender text (#C4B5FD),
gold moon (#FFE66D).

### Offline Launch (1.5 s)

Shown when `navigator.onLine === false`.

```
Timeline (ms):
0─────500────1000────1500
|  icon + offline |         Book icon with cloud-slash badge
|      | text |             "Ready to play offline!" in teal
|        | mascot |         Lion mascot with brief wave
                       500  Skip available
                      1500  Auto-complete
```

**Audio cue**: None (may not have audio assets cached)

---

## 3. Audio Cue Integration

Audio cues reference IDs from the app's existing sound registry
(`useAudio` hook with Web Audio API). The startup config stores an
`audioId` string that should be matched to a tone function.

If sound is disabled globally (`soundEnabled === false`), no audio plays.
Audio is triggered at the start of the mascot phase for first-launch,
and at icon appearance for other variants.

**Implementation note**: Audio cues are not played by StartupSequence
itself. The parent component should read `config.audioId` and trigger
the appropriate sound from `useAudio()` when the sequence begins.

---

## 4. Skip Behavior

All variants support tap-to-skip after a configurable `skipAfter`
threshold (default: 500 ms for all variants).

| Behavior | Detail |
|----------|--------|
| Before `skipAfter` | Taps are ignored |
| After `skipAfter` | "Tap to skip" text appears; tapping fires `onComplete` |
| At `totalDuration` | `onComplete` fires automatically |
| Reduced motion | Sequence auto-completes after 150 ms fade |

The skip action:
1. Cancels the animation frame loop
2. Sets state to `'skipped'`
3. Marks session storage as seen
4. Calls `onComplete()` immediately

---

## 5. Session Storage Strategy

### Skip on Repeat Visits

A `sessionStorage` flag (`klf-startup-seen`) prevents the startup
from showing more than once per browser session.

```
First visit this session:
  sessionStorage['klf-startup-seen'] = undefined
  -> Show startup sequence
  -> On complete/skip: set 'klf-startup-seen' = '1'

Second visit this session (navigate away and back):
  sessionStorage['klf-startup-seen'] = '1'
  -> shouldShow = false
  -> Component returns null
  -> onComplete is NOT called (sequence never starts)
```

### First Launch Detection

A `localStorage` flag (`klf-has-launched`) persists across sessions
to distinguish first-ever launch from subsequent launches.

```
Very first open:
  localStorage['klf-has-launched'] = undefined
  -> variant = 'first-launch'
  -> On complete: set 'klf-has-launched' = '1'

All future opens:
  localStorage['klf-has-launched'] = '1'
  -> variant = 'regular' (or 'bedtime' / 'offline' if applicable)
```

---

## 6. Reduced Motion Fallback

When `reducedMotion` is true (from `AccessibilityContext`):

1. A simplified component renders: static book icon + static title text
2. The entire screen fades from opacity 0 to 1 over 150 ms
3. The `totalDuration` is effectively ignored -- the timer still runs
   but visual complexity is minimal
4. All springs, scales, rotations, and position changes are removed
5. Particles/stars are not rendered

This respects the `prefers-reduced-motion: reduce` media query and
the manual toggle in the app's Settings page.

---

## 7. Implementation Notes

### File Structure

```
src/startup/
  startupConfig.ts      Timing configs, session storage, useStartupSequence hook
  StartupSequence.tsx    Main React component with 4 variant sub-components
```

### Integration Point

The StartupSequence should be rendered in `App.tsx` above (or wrapping)
the main `<Routes>`:

```tsx
import StartupSequence from './startup/StartupSequence';

function App() {
  const [startupDone, setStartupDone] = useState(false);

  return (
    <AppProvider>
      <AccessibilityProvider>
        {!startupDone && (
          <StartupSequence
            onComplete={() => setStartupDone(true)}
            isBedtime={bedtimeMode}
          />
        )}
        <Routes>...</Routes>
      </AccessibilityProvider>
    </AppProvider>
  );
}
```

The `shouldShow` check is internal -- if the session flag is set, the
component returns `null` immediately, so it's safe to always render it.

### Variant Auto-Detection Priority

```
1. navigator.onLine === false  ->  'offline'
2. bedtimeMode === true        ->  'bedtime'
3. isFirstLaunch() === true    ->  'first-launch'
4. fallback                    ->  'regular'
```

You can override auto-detection by passing the `variant` prop explicitly.

### Performance

- The startup renders a single fixed-position overlay with no DOM queries
- SVG elements are inline (no network requests)
- Emoji characters are used for mascots (no image assets to load)
- The `requestAnimationFrame` loop for elapsed tracking is lightweight
- `AnimatePresence` handles exit animation cleanup automatically

### TypeScript Types

```typescript
type StartupVariant = 'first-launch' | 'regular' | 'bedtime' | 'offline';
type StartupState = 'playing' | 'complete' | 'skipped';

interface StartupSequenceProps {
  variant?: StartupVariant;
  onComplete: () => void;
  isBedtime?: boolean;
}
```

### Testing Checklist

- [ ] First launch shows typewriter title and full sequence
- [ ] Second launch (same session) shows nothing
- [ ] New session shows regular variant
- [ ] Bedtime mode shows moon/stars/owl variant
- [ ] Airplane mode shows offline variant
- [ ] Reduced motion shows instant fade
- [ ] Tap to skip works after 500 ms
- [ ] `onComplete` fires in all exit paths
- [ ] No layout shift when sequence unmounts
- [ ] Works on iOS Safari and Chrome Android
