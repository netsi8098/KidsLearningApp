/**
 * The bridge, as a corridor added to a circular walkable region.
 *
 * The lion has been clamped to a circle since it could walk, because the island
 * is one. The bridge is the first thing that asks it to LEAVE, and the union of
 * a circle and a capsule is easy to get subtly wrong in ways that are invisible
 * until a character sticks on a corner or gets thrown backwards mid-crossing.
 * So it is tested rather than watched.
 */
import { describe, expect, it } from 'vitest';
import { LionBrain } from '../../../src/components/homepage/world3d/lionBrain';

/** The island as the environment authors it: centred, radius 1.6. */
const bounds = { cx: 0, cz: 0, r: 1.6 };
const NEAR = { x: 0, z: 1.5 };
const FAR = { x: 0, z: 4.2 };

function brain() {
  const b = new LionBrain(bounds);
  b.x = 0;
  b.z = 0;
  b.yaw = 0;
  b.setEyeHeight(0.85);
  b.setGroundY(0);
  return b;
}

/** Walk the lion by driving `step` until it stops, with a hard iteration cap. */
function run(b: LionBrain, seconds = 40) {
  const dt = 1 / 60;
  for (let t = 0; t < seconds / dt; t += 1) {
    b.step(dt);
    if (!b.busy) break;
  }
}

describe('the walkable region without a bridge', () => {
  it('still clamps to the island, exactly as before', () => {
    const b = brain();
    expect(b.hasBridge).toBe(false);
    b.walkTo(0, 8);
    run(b);
    expect(Math.hypot(b.x - bounds.cx, b.z - bounds.cz)).toBeLessThanOrEqual(bounds.r + 1e-6);
  });
});

describe('the walkable region with a bridge', () => {
  it('lets the lion off the island along the deck', () => {
    const b = brain();
    b.setBridge(NEAR, FAR);
    expect(b.hasBridge).toBe(true);
    b.crossBridge();
    run(b);
    expect(b.z).toBeGreaterThan(bounds.r);
    expect(b.z).toBeCloseTo(FAR.z, 1);
    expect(Math.abs(b.x)).toBeLessThan(0.05);
  });

  it('does NOT let it off sideways — the deck is the only way out', () => {
    const b = brain();
    b.setBridge(NEAR, FAR);
    // Straight out to the side, nowhere near the bridge.
    b.walkTo(8, 0);
    run(b);
    expect(Math.hypot(b.x - bounds.cx, b.z - bounds.cz)).toBeLessThanOrEqual(bounds.r + 1e-6);
  });

  it('keeps the lion on the deck when it tries to walk off the side', () => {
    /* The failure this guards: a lion halfway across walking sideways and
       being clamped by the ISLAND rule, which would teleport it backwards
       several metres onto the rim. It should be held on the deck instead.

       The clamp only runs while the lion MOVES — it is applied to each step's
       destination — so this drives a real walk rather than assigning a
       position, which would bypass it. */
    const b = brain();
    b.setBridge(NEAR, FAR, 0.34);
    b.crossBridge();
    run(b);
    const mid = (NEAR.z + FAR.z) / 2;
    b.walkTo(FAR.x, mid);   // back down the deck to its middle
    run(b);
    expect(b.z).toBeCloseTo(mid, 1);

    b.walkTo(4.0, mid);     // and now straight off the side
    run(b);
    expect(Math.abs(b.x)).toBeLessThanOrEqual(0.34 + 1e-6);
    // Still out on the deck, not dragged back to the island.
    expect(b.z).toBeGreaterThan(bounds.r);
  });

  it('reports progress from 0 at the island to 1 at the far bank', () => {
    const b = brain();
    b.setBridge(NEAR, FAR);
    b.z = NEAR.z;
    expect(b.bridgeProgress).toBeCloseTo(0, 2);
    b.z = (NEAR.z + FAR.z) / 2;
    expect(b.bridgeProgress).toBeCloseTo(0.5, 2);
    b.z = FAR.z;
    expect(b.bridgeProgress).toBeCloseTo(1, 2);
    // Clamped, so a lion past the end does not report 1.3.
    b.z = FAR.z + 5;
    expect(b.bridgeProgress).toBe(1);
  });

  it('only signals hasCrossed once it has ARRIVED, not on the last stride', () => {
    const b = brain();
    b.setBridge(NEAR, FAR);
    b.crossBridge();
    expect(b.busy).toBe(true);
    expect(b.hasCrossed).toBe(false);
    // Teleported to the far end but still mid-sequence: progress is 1 and the
    // crossing is NOT finished. This is the case the naive check gets wrong.
    b.x = FAR.x;
    b.z = FAR.z;
    expect(b.bridgeProgress).toBeCloseTo(1, 2);
    expect(b.hasCrossed).toBe(false);
    run(b);
    expect(b.hasCrossed).toBe(true);
  });

  it('turns wander off, and does not quietly turn it back on', () => {
    /* Whoever asked for the crossing owns the far side. Handing autonomy back
       would have the lion wander off a bank it has no bounds for. */
    const b = brain();
    b.wander = true;
    b.setBridge(NEAR, FAR);
    b.crossBridge();
    expect(b.wander).toBe(false);
    run(b);
    expect(b.wander).toBe(false);
  });

  it('refuses to cross when no bridge has been set', () => {
    const b = brain();
    expect(b.crossBridge()).toBe(false);
    expect(b.wander).toBe(true);
  });

  it('forgets the bridge on clearBridge, and clamps to the island again', () => {
    const b = brain();
    b.setBridge(NEAR, FAR);
    b.clearBridge();
    expect(b.hasBridge).toBe(false);
    b.walkTo(0, 8);
    run(b);
    expect(Math.hypot(b.x, b.z)).toBeLessThanOrEqual(bounds.r + 1e-6);
  });
});
