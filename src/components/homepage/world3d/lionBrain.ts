/**
 * lionBrain — the mascot's movement and behaviour state machine.
 *
 * The lion is the emotional guide of the product, so its motion has to be
 * authored rather than emergent: it walks to real places in the world, turns
 * before it moves, arrives, and settles. This module owns that decision-making
 * and NOTHING about rendering. It has no three.js scene access and no React
 * dependency, which is what makes it testable and what keeps the R3F component
 * a thin applier of the result.
 *
 * ROOT MOTION
 * The exported Walk clip cycles the legs in place — it carries no root
 * translation. Translation therefore has to come from here, at a speed matched
 * to the clip, or the feet skate. See WALK_SPEED.
 */

export type LionClip =
  | 'Idle' | 'Walk' | 'Wave' | 'Sit' | 'Jump'
  | 'Celebrate' | 'Nod' | 'LookAround' | 'Talk' | 'Sleep';

/**
 * Fallback metres per second, used only until the measured value arrives.
 *
 * This constant used to be the actual walk speed, derived on paper from a
 * 32-frame two-stride cycle. The clip was later rewritten as a 48-frame
 * four-beat lateral walk and nobody updated the number, so the runtime
 * translated roughly four times faster than the legs cycled and the paws
 * skated. Deriving locomotion speed by hand is a standing invitation to that
 * bug.
 *
 * The real value is now MEASURED off the authored clip by the rig script and
 * emitted to `locomotion.json` beside the GLB. The runtime multiplies the
 * stride by whatever scale it applied to the asset and divides by the cycle
 * length. See `setLocomotion`.
 */
export const WALK_SPEED_FALLBACK = 0.24;
const TURN_SPEED = 3.4;      // rad/s — turns finish inside one stride
const ARRIVE_EPS = 0.05;     // m
const FACE_EPS = 0.20;       // rad; start walking once roughly aimed

export type Task =
  | { kind: 'goto'; x: number; z: number }
  | { kind: 'clip'; clip: LionClip; seconds: number }
  | { kind: 'face'; x: number; z: number };

export interface Bounds { cx: number; cz: number; r: number }

function shortestAngle(a: number, b: number) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export class LionBrain {
  x = 0;
  z = 0;
  yaw = 0;
  clip: LionClip = 'Idle';

  /** Autonomous wandering. Turned off while a page drives the lion directly. */
  wander = true;

  /**
   * How much of the walkable island the lion actually uses, 0..1.
   *
   * Free run is right for the proof route and wrong for the homepage: a mascot
   * that strolls to the back of the island and stands with its back to the
   * child is not a greeter, it is scenery. On the homepage this is tightened so
   * every stroll stays inside the hero framing.
   */
  stageRadius = 1;

  /** The mark the lion returns to after every stroll. Set from MARK_LionSpawn. */
  private homeX = 0;
  private homeZ = 0;

  private queue: Task[] = [];
  private active: Task | null = null;
  private elapsed = 0;
  private restFor = 0;
  private durations: Partial<Record<LionClip, number>> = {};

  /** Metres per second, from the measured clip stride. See setLocomotion. */
  private walkSpeed = WALK_SPEED_FALLBACK;

  constructor(private bounds: Bounds) {}

  setHome(x: number, z: number) { this.homeX = x; this.homeZ = z; }

  /**
   * Match translation to the clip.
   *
   * `strideWorld` is the paw's fore-aft excursion per cycle in WORLD units —
   * the measured model-space stride multiplied by the scale the runtime applied
   * to the asset. Divided by the cycle length that is, by definition, the speed
   * at which a planted paw does not slide.
   */
  setLocomotion(strideWorld: number, cycleSeconds: number) {
    if (strideWorld > 0 && cycleSeconds > 0) {
      this.walkSpeed = strideWorld / cycleSeconds;
    }
  }

  /** Current walk speed in metres per second. */
  get speed() { return this.walkSpeed; }

  /** Real clip lengths, read from the GLB once it has loaded. */
  setDurations(d: Partial<Record<LionClip, number>>) {
    this.durations = d;
  }

  private dur(clip: LionClip, fallback: number) {
    return this.durations[clip] ?? fallback;
  }

  /** Replace whatever the lion was doing. Used for direct, deliberate commands. */
  command(tasks: Task[]) {
    this.queue = [...tasks];
    this.active = null;
    this.elapsed = 0;
    this.restFor = 0;
  }

  /** Queue behind the current behaviour instead of cutting it off. */
  enqueue(tasks: Task[]) {
    this.queue.push(...tasks);
  }

  walkTo(x: number, z: number) { this.command([{ kind: 'goto', x, z }]); }
  wave() { this.command([{ kind: 'clip', clip: 'Wave', seconds: this.dur('Wave', 2.6) }]); }
  celebrate() { this.command([{ kind: 'clip', clip: 'Celebrate', seconds: this.dur('Celebrate', 2.3) }]); }
  nod() { this.command([{ kind: 'clip', clip: 'Nod', seconds: this.dur('Nod', 1.4) }]); }
  jump() { this.command([{ kind: 'clip', clip: 'Jump', seconds: this.dur('Jump', 1.7) }]); }
  sit(seconds = 4) { this.command([{ kind: 'clip', clip: 'Sit', seconds }]); }
  sleep(seconds = 12) { this.command([{ kind: 'clip', clip: 'Sleep', seconds }]); }
  talk(seconds: number) { this.command([{ kind: 'clip', clip: 'Talk', seconds }]); }
  idle() { this.command([]); }

  /** Bring the lion to a marker and turn it to face the camera. */
  greet(x: number, z: number) {
    this.command([
      { kind: 'goto', x, z },
      { kind: 'face', x, z: z + 6 },
      { kind: 'clip', clip: 'Wave', seconds: this.dur('Wave', 2.6) },
    ]);
  }

  private clampToIsland(x: number, z: number) {
    const dx = x - this.bounds.cx;
    const dz = z - this.bounds.cz;
    const d = Math.hypot(dx, dz);
    if (d <= this.bounds.r) return { x, z };
    const k = this.bounds.r / (d || 1);
    return { x: this.bounds.cx + dx * k, z: this.bounds.cz + dz * k };
  }

  /** Turn back toward the viewer. The camera looks down +Z at the island. */
  private faceViewer(): Task {
    return { kind: 'face', x: this.homeX, z: this.homeZ + 6 };
  }

  private pickWander(): Task[] {
    const roll = Math.random();
    if (roll < 0.22) {
      // A stroll that ENDS BACK ON THE MARK. sqrt() keeps the target
      // distribution even over AREA — without it the lion clusters at the
      // middle and the world reads smaller than it is.
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * this.bounds.r * this.stageRadius;
      const t = this.clampToIsland(this.bounds.cx + Math.cos(a) * r, this.bounds.cz + Math.sin(a) * r);
      return [
        { kind: 'goto', x: t.x, z: t.z },
        this.faceViewer(),
        { kind: 'clip', clip: 'LookAround', seconds: this.dur('LookAround', 3.6) * 0.6 },
        { kind: 'goto', x: this.homeX, z: this.homeZ },
        this.faceViewer(),
      ];
    }
    if (roll < 0.62) return [this.faceViewer(), { kind: 'clip', clip: 'LookAround', seconds: this.dur('LookAround', 3.6) }];
    // Sit and Sleep are NOT in the autonomous rotation. Both fold the hips past
    // 55 degrees, and under Blender's automatic weights that collapses the
    // barrel into a lump with the tail sticking out of it — in the running app
    // it read as a grey wedge on the island. They stay authored and reachable
    // from the debug panel; they return to production once the skeleton and
    // weight painting are rebuilt (GATE 6-7).
    if (roll < 0.86) return [this.faceViewer(), { kind: 'clip', clip: 'Nod', seconds: this.dur('Nod', 1.4) }];
    if (roll < 0.94) return [this.faceViewer(), { kind: 'clip', clip: 'Jump', seconds: this.dur('Jump', 1.7) }];
    return [this.faceViewer(), { kind: 'clip', clip: 'Celebrate', seconds: this.dur('Celebrate', 2.3) }];
  }

  step(dt: number) {
    const d = Math.min(dt, 0.1);   // a backgrounded tab must not teleport the lion

    if (!this.active) {
      if (this.restFor > 0) {
        this.restFor -= d;
        this.clip = 'Idle';
        return;
      }
      if (this.queue.length === 0) {
        if (!this.wander) { this.clip = 'Idle'; return; }
        this.queue = this.pickWander();
        // A beat of stillness between behaviours. Back-to-back actions read as
        // a toy on a loop rather than a character deciding to do something.
        this.restFor = 0.8 + Math.random() * 2.4;
        return;
      }
      this.active = this.queue.shift()!;
      this.elapsed = 0;
    }

    const task = this.active;

    if (task.kind === 'clip') {
      this.clip = task.clip;
      this.elapsed += d;
      if (this.elapsed >= task.seconds) { this.active = null; this.clip = 'Idle'; }
      return;
    }

    if (task.kind === 'face') {
      const want = Math.atan2(task.x - this.x, task.z - this.z);
      const diff = shortestAngle(this.yaw, want);
      const stepAmt = Math.sign(diff) * Math.min(Math.abs(diff), TURN_SPEED * d);
      this.yaw += stepAmt;
      this.clip = Math.abs(diff) > FACE_EPS ? 'Walk' : 'Idle';
      if (Math.abs(diff) <= 0.03) { this.yaw = want; this.active = null; }
      return;
    }

    // goto — turn toward the target first, then travel.
    const dx = task.x - this.x;
    const dz = task.z - this.z;
    const dist = Math.hypot(dx, dz);
    if (dist <= ARRIVE_EPS) { this.active = null; this.clip = 'Idle'; return; }

    const want = Math.atan2(dx, dz);
    const diff = shortestAngle(this.yaw, want);
    this.yaw += Math.sign(diff) * Math.min(Math.abs(diff), TURN_SPEED * d);
    this.clip = 'Walk';

    // Hold position until roughly aimed, so the lion never crab-walks sideways.
    if (Math.abs(diff) > FACE_EPS) return;

    const travel = Math.min(this.walkSpeed * d, dist);
    const next = this.clampToIsland(this.x + (dx / dist) * travel, this.z + (dz / dist) * travel);
    this.x = next.x;
    this.z = next.z;
  }
}
