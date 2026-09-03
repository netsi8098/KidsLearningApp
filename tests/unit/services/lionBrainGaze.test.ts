/**
 * lionBrain gaze split — the eye/head division, tested rather than eyeballed.
 *
 * This exists because the browser could not prove it. The scene's own markers
 * all sit close to the lion's facing, so every angle the HUD reported was
 * inside the eyes' own 28-degree range and the head assist correctly did
 * nothing — which looks identical to an assist that is broken. A test can ask
 * for 40 and 120 degrees directly.
 *
 * The rig limits under test are measured, not chosen: GAZE_LIMIT is where the
 * iris leaves the sclera (0.0152 of travel on a 0.032 bone), and
 * HEAD_ASSIST_YAW sits inside the deformation battery's validated
 * `05-head-turn` pose of neck 32 / head 38.
 */
import { describe, expect, it } from 'vitest';
import {
  GAZE_LIMIT,
  HEAD_ASSIST_PITCH,
  HEAD_ASSIST_YAW,
  LionBrain,
} from '../../../src/components/homepage/world3d/lionBrain';

const DEG = 180 / Math.PI;
const bounds = { cx: 0, cz: 0, r: 4 };

/** A brain at the origin facing +z, looking at a point `deg` off its nose. */
function lookingAt(deg: number, distance = 4, height = 0.85) {
  const brain = new LionBrain(bounds);
  brain.x = 0;
  brain.z = 0;
  brain.yaw = 0;
  const a = deg / DEG;
  brain.lookAt(Math.sin(a) * distance, Math.cos(a) * distance, height);
  return brain;
}

describe('LionBrain gaze split', () => {
  it('uses the eyes alone for a small glance', () => {
    const s = lookingAt(15).gazeSplit;
    expect(s.eyes.yaw * DEG).toBeCloseTo(15, 1);
    expect((s.neck.yaw + s.head.yaw) * DEG).toBeCloseTo(0, 5);
  });

  it('recruits the head only once the eyes are at their limit', () => {
    const s = lookingAt(40).gazeSplit;
    expect(s.eyes.yaw).toBeCloseTo(GAZE_LIMIT, 5);
    // Eyes are children of `head`, so the two add up to the gaze.
    const total = (s.eyes.yaw + s.neck.yaw + s.head.yaw) * DEG;
    expect(total).toBeCloseTo(40, 1);
  });

  it('reaches the target at 40 degrees, which the eyes alone cannot', () => {
    const eyesOnly = GAZE_LIMIT * DEG;
    expect(eyesOnly).toBeLessThan(40);
    const s = lookingAt(40).gazeSplit;
    expect((s.eyes.yaw + s.neck.yaw + s.head.yaw) * DEG).toBeGreaterThan(eyesOnly + 5);
  });

  it('clamps to the rig at an angle neither can reach, and does not exceed it', () => {
    const s = lookingAt(120).gazeSplit;
    expect(s.eyes.yaw).toBeCloseTo(GAZE_LIMIT, 5);
    expect(s.neck.yaw + s.head.yaw).toBeCloseTo(HEAD_ASSIST_YAW, 5);
    const total = (s.eyes.yaw + s.neck.yaw + s.head.yaw) * DEG;
    expect(total).toBeCloseTo((GAZE_LIMIT + HEAD_ASSIST_YAW) * DEG, 1);
    // Never past the envelope the battery validated.
    expect(Math.abs(s.neck.yaw + s.head.yaw)).toBeLessThanOrEqual(HEAD_ASSIST_YAW + 1e-9);
  });

  it('splits the head share in the battery-validated neck/head ratio', () => {
    const s = lookingAt(120).gazeSplit;
    const assist = s.neck.yaw + s.head.yaw;
    // The battery's pose is neck 32 of 70 total.
    expect(s.neck.yaw / assist).toBeCloseTo(32 / 70, 3);
    expect(s.head.yaw / assist).toBeCloseTo(38 / 70, 3);
  });

  it('mirrors for a target on the other side', () => {
    const left = lookingAt(-120).gazeSplit;
    const right = lookingAt(120).gazeSplit;
    expect(left.eyes.yaw).toBeCloseTo(-right.eyes.yaw, 6);
    expect(left.neck.yaw + left.head.yaw).toBeCloseTo(-(right.neck.yaw + right.head.yaw), 6);
  });

  it('holds pitch inside its own tighter limit', () => {
    // Far below the eye line: the pitch limit is 16 degrees, not 30, because
    // the battery's head-tilt pose exercises roll rather than pitch.
    const brain = new LionBrain(bounds);
    brain.lookAt(0, 0.4, -3.0);
    const s = brain.gazeSplit;
    expect(Math.abs(s.eyes.pitch)).toBeLessThanOrEqual(GAZE_LIMIT + 1e-9);
    expect(Math.abs(s.neck.pitch + s.head.pitch)).toBeLessThanOrEqual(HEAD_ASSIST_PITCH + 1e-9);
  });

  it('is neutral with no target, so nothing drifts when looking ahead', () => {
    const brain = new LionBrain(bounds);
    brain.lookAhead();
    const s = brain.gazeSplit;
    expect(s.eyes.yaw).toBe(0);
    expect(s.eyes.pitch).toBe(0);
    expect(s.neck.yaw).toBe(0);
    expect(s.head.yaw).toBe(0);
  });
});
