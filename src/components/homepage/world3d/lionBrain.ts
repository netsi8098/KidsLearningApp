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
  | 'Celebrate' | 'Nod' | 'LookAround' | 'Talk' | 'Sleep'
  /* The production cage's clips. TWO ASSETS SHIP DIFFERENT SETS: the proxy has
     Sit / Nod / LookAround / Talk / Sleep and one fused Jump; the cage has
     WalkStart / WalkStop / TurnLeft / TurnRight and the jump split into five
     blendable phases. Neither is a subset of the other, so the union is
     declared here and every request goes through `clipOrFallback`, which asks
     the LOADED asset what it actually has. Requesting a clip the asset lacks
     leaves `activeClip` unchanged and the lion frozen mid-behaviour. */
  | 'WalkStart' | 'WalkStop' | 'TurnLeft' | 'TurnRight'
  | 'JumpAnticipation' | 'JumpTakeoff' | 'JumpAirborne'
  | 'JumpLand' | 'JumpRecovery';

/** The rig's measured gaze limit — see `LionBrain.gaze`. */
export const GAZE_LIMIT = (28 * Math.PI) / 180;
/**
 * Fallback eye height above the lion's own feet, in metres on the 1.30 m
 * character. Only used until the runtime measures the real one.
 *
 * This constant used to be the WHOLE pitch calculation, subtracted straight
 * from a target's world y — and that mixed two different frames. The gaze
 * targets are world-space markers read out of the environment GLB, while 0.85
 * is a height ABOVE THE GROUND the lion is standing on. On the river-garden
 * island the ground sits at y = 0.45, so every pitch was computed against an
 * eye 0.45 m below the real one and came out several degrees shallow. The bug
 * was invisible from inside: the brain reported the angle it had asked for,
 * and only the aim error measured off the eye bone's world matrix in
 * `HomeWorld3D` disagreed.
 */
const EYE_HEIGHT_FALLBACK = 0.85;

/* How far the head may be recruited when the eyes run out. 30 degrees of yaw
   sits inside the deformation battery's own `05-head-turn` pose, which is
   validated at neck 32 / head 38 — so nothing here asks the skin to do
   something untested. Pitch is held tighter at 16 because the battery's
   head-tilt pose exercises ROLL, not pitch, so there is no measured envelope
   to lean on. */
export const HEAD_ASSIST_YAW = (30 * Math.PI) / 180;
export const HEAD_ASSIST_PITCH = (16 * Math.PI) / 180;
/* The battery's tested pose puts 32 of 70 degrees in the neck. Exported
   because `HomeWorld3D` needs the same ratio to distribute the assist across
   the two bones, and two copies of the number is one copy too many. */
export const NECK_SHARE = 32 / 70;

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
  private available = new Set<LionClip>();
  private eyeHeight = EYE_HEIGHT_FALLBACK;
  private eyeForward = 0;
  private groundY = 0;
  private gazeTarget: { x: number; y: number; z: number } | null = null;
  private interest: { x: number; y: number; z: number }[] = [];
  private gazeSwitch = 2.0;
  private gazeHold = 0;

  /** Metres per second, from the measured clip stride. See setLocomotion. */
  private walkSpeed = WALK_SPEED_FALLBACK;

  constructor(private bounds: Bounds) {}

  setHome(x: number, z: number) { this.homeX = x; this.homeZ = z; }

  /**
   * The eye's height above the lion's own feet, measured off the loaded asset
   * rather than assumed, and the world y of the ground it is standing on.
   *
   * Both are needed because a gaze target is a world point and an eye height
   * is not. Keeping them separate means the ground can move — the runtime
   * raycasts it every frame on sloping terrain — without re-measuring the
   * skeleton.
   */
  setEyeHeight(aboveFeet: number) { this.eyeHeight = aboveFeet; }

  setGroundY(y: number) { this.groundY = y; }

  /**
   * How far FORWARD of the body origin the eyes sit, along the lion's facing.
   *
   * On a quadruped this is not a rounding error. The rig's origin is between
   * the hips and the eyes are 0.77 m ahead of it on a 1.30 m character, so a
   * target 40 degrees off the BODY is 45 degrees off the EYES — and aiming the
   * eyes at the body's bearing left them 4.9 degrees wide of a card 4.5 m
   * away. Measured off the asset by the runtime; the fallback of 0 is simply
   * the old behaviour.
   */
  setEyeOffset(forward: number) { this.eyeForward = forward; }

  /** World y of the eyes, which is what a pitch to a world target needs. */
  get eyeWorldY(): number { return this.groundY + this.eyeHeight; }

  /** World x/z the gaze is measured FROM: the eyes, not the hips. */
  private get eyeOriginX(): number { return this.x + Math.sin(this.yaw) * this.eyeForward; }

  private get eyeOriginZ(): number { return this.z + Math.cos(this.yaw) * this.eyeForward; }

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
    this.available = new Set(Object.keys(d) as LionClip[]);
  }

  /** Does the loaded asset actually contain this clip? */
  has(clip: LionClip) {
    // Before the GLB reports in, assume yes — otherwise every behaviour chosen
    // during loading would silently degrade to Idle.
    return this.available.size === 0 || this.available.has(clip);
  }

  /**
   * First candidate the loaded asset has, else the last one as a floor.
   *
   * This is what lets one brain drive both characters. A sequence written for
   * the cage (WalkStart -> Walk -> WalkStop) collapses cleanly to the proxy's
   * plain Walk, and the five jump phases collapse to its single Jump.
   */
  private clipOrFallback(...candidates: LionClip[]): LionClip {
    for (const c of candidates) if (this.has(c)) return c;
    return candidates[candidates.length - 1];
  }

  private dur(clip: LionClip, fallback: number) {
    return this.durations[clip] ?? fallback;
  }

  private clipTask(clip: LionClip, fallback: number): Task {
    return { kind: 'clip', clip, seconds: this.dur(clip, fallback) };
  }

  /** Point the eyes at a world position. Cleared by `lookAhead`. */
  lookAt(x: number, z: number, y = 1.0) {
    this.gazeTarget = { x, y, z };
    // A deliberate glance holds until something else asks. The scheduler must
    // not steal it back a moment later.
    this.gazeHold = 2.2;
  }

  lookAhead() {
    this.gazeTarget = null;
    this.gazeHold = 0;
  }

  /**
   * Places worth glancing at, in world space, from the environment's own
   * markers.
   *
   * The lion should look at the THINGS IN THE SCENE, and the scene already
   * says where they are: `MARK_CardShelfZone` is where the player cards sit,
   * `MARK_TitleZone` the title. Passing them in rather than hard-coding
   * positions means re-authoring the island in Blender moves the lion's
   * attention with it — the same argument the walkable bounds already make.
   */
  setInterest(points: { x: number; y: number; z: number }[]) {
    this.interest = points;
  }

  /**
   * Rotate the gaze between the viewer and the scene's points of interest.
   *
   * A mascot that stares dead ahead forever reads as a prop. A mascot whose
   * eyes flick to the cards and back reads as one that knows they are there —
   * which is the storyboard's third beat, "eyes move to player cards".
   *
   * Called from `step`, so it costs nothing when there are no points and
   * yields immediately to any explicit `lookAt`.
   */
  private stepGaze(dt: number) {
    if (this.gazeHold > 0) {
      this.gazeHold -= dt;
      return;
    }
    this.gazeSwitch -= dt;
    if (this.gazeSwitch > 0) return;
    // Uneven on purpose: mostly at the child, sometimes at the cards. A even
    // split reads as a metronome.
    this.gazeSwitch = 1.8 + Math.random() * 2.6;
    if (!this.interest.length || Math.random() < 0.55) {
      this.gazeTarget = null;   // back to the viewer / straight ahead
      return;
    }
    const p = this.interest[Math.floor(Math.random() * this.interest.length)];
    this.gazeTarget = { x: p.x, y: p.y, z: p.z };
  }

  /**
   * Eye yaw and pitch in radians, relative to the head's facing, clamped to
   * the range the rig can actually deliver.
   *
   * GAZE_LIMIT is not a taste choice. The iris slides across a FIXED sclera,
   * and the built discs give it 0.0152 of travel against a 0.032 bone, so past
   * ±28 degrees the iris leaves the white. The rig cannot look further and the
   * runtime must not ask it to.
   */
  /** Where the eyes are aimed, for the debug HUD. Null means straight ahead. */
  get gazeAt(): { x: number; y: number; z: number } | null {
    return this.gazeTarget;
  }

  get gaze(): { yaw: number; pitch: number } {
    return this.gazeSplit.eyes;
  }

  /**
   * The gaze, divided between the EYES and the HEAD.
   *
   * The eyes alone reach ±28 degrees, and wiring them up showed the cost of
   * stopping there: the card shelf sits far enough off-axis that the eye yaw
   * pinned at exactly -28.0, which is the rig refusing to look at the thing
   * while reporting that it is looking as hard as it can.
   *
   * So the eyes take what they can and THE HEAD TAKES THE REST — the same
   * face-before-move rule this class already applies to walking, applied to
   * looking. Small glances stay pure eye movement, which is what a real glance
   * is; only a large one recruits the neck.
   *
   *     required 15 deg  ->  eyes 15, head 0
   *     required 40 deg  ->  eyes 28, head 12   (reaches the target)
   *     required 80 deg  ->  eyes 28, head 30   (as far as the rig goes)
   *
   * The eye bones are children of `head`, so these compose by parenting: the
   * caller applies each to its own bone and the total lands on the eyes for
   * free.
   *
   * The head's share is split across `neck_01` and `head` in the ratio the
   * DEFORMATION BATTERY already validates — its `05-head-turn` pose is
   * neck 32 / head 38 — so the bend is distributed rather than kinking one
   * joint. HEAD_ASSIST_YAW stays inside that tested envelope.
   */
  /** The yaw the gaze WANTED, before either limit. For the debug HUD. */
  get gazeWantYaw(): number {
    if (!this.gazeTarget) return 0;
    return shortestAngle(this.yaw,
      Math.atan2(this.gazeTarget.x - this.eyeOriginX,
        this.gazeTarget.z - this.eyeOriginZ));
  }

  get gazeSplit(): {
    eyes: { yaw: number; pitch: number };
    neck: { yaw: number; pitch: number };
    head: { yaw: number; pitch: number };
  } {
    const zero = { yaw: 0, pitch: 0 };
    if (!this.gazeTarget) return { eyes: zero, neck: zero, head: zero };
    const dx = this.gazeTarget.x - this.eyeOriginX;
    const dz = this.gazeTarget.z - this.eyeOriginZ;
    const flat = Math.hypot(dx, dz);
    const wantYaw = shortestAngle(this.yaw, Math.atan2(dx, dz));
    const wantPitch = Math.atan2(this.gazeTarget.y - this.eyeWorldY, flat || 1e-3);

    const cap = (a: number, lim: number) => Math.max(-lim, Math.min(lim, a));
    const eyeYaw = cap(wantYaw, GAZE_LIMIT);
    const eyePitch = cap(wantPitch, GAZE_LIMIT);
    const assistYaw = cap(wantYaw - eyeYaw, HEAD_ASSIST_YAW);
    const assistPitch = cap(wantPitch - eyePitch, HEAD_ASSIST_PITCH);

    return {
      eyes: { yaw: eyeYaw, pitch: eyePitch },
      neck: { yaw: assistYaw * NECK_SHARE, pitch: assistPitch * NECK_SHARE },
      head: { yaw: assistYaw * (1 - NECK_SHARE), pitch: assistPitch * (1 - NECK_SHARE) },
    };
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

  /**
   * Walk to a point, with a start and a stop when the asset has them.
   *
   * The cage's WalkStart ends on Walk's first pose and WalkStop drives every
   * foot back to zero, so the three chain without a slide. On the proxy, which
   * has neither, this collapses to the plain goto it always was.
   */
  walkTo(x: number, z: number) {
    const tasks: Task[] = [];
    if (this.has('WalkStart')) tasks.push(this.clipTask('WalkStart', 0.6));
    tasks.push({ kind: 'goto', x, z });
    if (this.has('WalkStop')) tasks.push(this.clipTask('WalkStop', 0.7));
    this.command(tasks);
  }

  /**
   * Turn in place to face a point, using the authored turn clips.
   *
   * The turn clips lead with the head and reposition the feet last, which is
   * the same face-before-move rule this class already applies at the
   * navigation level — so the clip and the brain finally agree, instead of the
   * brain yawing the whole rig while a walk cycle plays.
   */
  turnTo(x: number, z: number) {
    const diff = shortestAngle(this.yaw, Math.atan2(x - this.x, z - this.z));
    const clip: LionClip = diff >= 0 ? 'TurnLeft' : 'TurnRight';
    const tasks: Task[] = [];
    if (this.has(clip)) tasks.push(this.clipTask(clip, 1.1));
    tasks.push({ kind: 'face', x, z });
    this.command(tasks);
  }
  wave() { this.command([{ kind: 'clip', clip: 'Wave', seconds: this.dur('Wave', 2.6) }]); }
  celebrate() { this.command([{ kind: 'clip', clip: 'Celebrate', seconds: this.dur('Celebrate', 2.3) }]); }
  nod() { this.command([{ kind: 'clip', clip: 'Nod', seconds: this.dur('Nod', 1.4) }]); }
  /**
   * Jump as five blendable phases when the asset has them.
   *
   * The brief asks for anticipation, takeoff, airborne, land and recovery as
   * SEPARATE clips precisely so a phase can be HELD — hanging in the air while
   * a card loads, say — rather than committing to one fixed-length jump.
   * Sequencing them here is what makes that possible.
   */
  jump() {
    if (this.has('JumpAnticipation')) {
      this.command([
        this.clipTask('JumpAnticipation', 0.5),
        this.clipTask('JumpTakeoff', 0.34),
        this.clipTask('JumpAirborne', 0.58),
        this.clipTask('JumpLand', 0.34),
        this.clipTask('JumpRecovery', 0.67),
      ]);
      return;
    }
    this.command([this.clipTask('Jump', 1.7)]);
  }
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
    /* The storyboard's opening runs notice -> lean -> EYES TO THE CARDS ->
       head tilt -> speak -> wave. That glance is what makes the greeting about
       the child's choice rather than about the lion, so it is part of `greet`
       and not left to the ambient scheduler. It holds through the approach and
       the scheduler takes over afterwards. */
    if (this.interest.length) {
      const p = this.interest[0];
      this.lookAt(p.x, p.z, p.y);
      this.gazeHold = 3.4;
    }
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

  /**
   * An idle-ish beat the LOADED asset actually has.
   *
   * The wander table asked for `LookAround` unconditionally, and the cage has
   * no such clip — so autonomous behaviour picked a clip that does not exist,
   * `actions[clip]` came back undefined, and the lion stood frozen until the
   * task timed out. Caught in the browser: the HUD read
   * `brain clip : LookAround` while nothing moved.
   */
  private ambient(scale: number): Task {
    const clip = this.clipOrFallback('LookAround', 'Idle');
    return { kind: 'clip', clip, seconds: this.dur(clip, 3.6) * scale };
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
        this.ambient(0.6),
        { kind: 'goto', x: this.homeX, z: this.homeZ },
        this.faceViewer(),
      ];
    }
    if (roll < 0.62) return [this.faceViewer(), this.ambient(1.0)];
    // Sit and Sleep are NOT in the autonomous rotation. Both fold the hips past
    // 55 degrees, and under Blender's automatic weights that collapses the
    // barrel into a lump with the tail sticking out of it — in the running app
    // it read as a grey wedge on the island. They stay authored and reachable
    // from the debug panel; they return to production once the skeleton and
    // weight painting are rebuilt (GATE 6-7).
    if (roll < 0.86) {
      const nod = this.clipOrFallback('Nod', 'Wave');
      return [this.faceViewer(), this.clipTask(nod, 1.4)];
    }
    if (roll < 0.94) {
      // Routed through `jump()`'s own sequencing so the autonomous jump gets
      // the five phases too, rather than a single clip the cage lacks.
      const tail = this.has('JumpAnticipation')
        ? [this.clipTask('JumpAnticipation', 0.5), this.clipTask('JumpTakeoff', 0.34),
           this.clipTask('JumpAirborne', 0.58), this.clipTask('JumpLand', 0.34),
           this.clipTask('JumpRecovery', 0.67)]
        : [this.clipTask('Jump', 1.7)];
      return [this.faceViewer(), ...tail];
    }
    return [this.faceViewer(), this.clipTask('Celebrate', 2.3)];
  }

  step(dt: number) {
    const d = Math.min(dt, 0.1);   // a backgrounded tab must not teleport the lion
    this.stepGaze(d);

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
      this.clip = Math.abs(diff) > FACE_EPS ? this.clipOrFallback('Walk') : 'Idle';
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
    this.clip = this.clipOrFallback('Walk');

    // Hold position until roughly aimed, so the lion never crab-walks sideways.
    if (Math.abs(diff) > FACE_EPS) return;

    const travel = Math.min(this.walkSpeed * d, dist);
    const next = this.clampToIsland(this.x + (dx / dist) * travel, this.z + (dz / dist) * travel);
    this.x = next.x;
    this.z = next.z;
  }
}
