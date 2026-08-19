/**
 * Semantic movement poses.
 *
 * The session used to show one activity-level illustration for every step, so
 * "Shake your arms up high!" and "Freeze!" looked identical. Instruction text is
 * now resolved to a *semantic action*, and the figure is posed to match.
 *
 * Matching is on meaning, not step index, so the same families are reused across
 * activities and new instruction copy keeps working without new art.
 */

export type PoseAction =
  | 'raise-arms' | 'clap' | 'jump' | 'stretch-left' | 'stretch-right'
  | 'touch-toes' | 'march' | 'spin' | 'freeze' | 'balance'
  | 'breathe-in' | 'breathe-out' | 'point' | 'wiggle' | 'stomp'
  | 'reach-up' | 'bend-down' | 'animal-pose' | 'follow-leader'
  | 'stand-tall' | 'bow' | 'shake';

/**
 * Keyword patterns per action, tested in order — earlier entries win, so put
 * specific phrases above generic verbs ("touch your toes" before "touch").
 */
const PATTERNS: Array<{ action: PoseAction; re: RegExp }> = [
  { action: 'touch-toes',    re: /touch (your )?toes|reach (down )?to (your )?toes|toe touch/i },
  { action: 'touch-toes',    re: /head,? shoulders|knees and toes|knees,? toes/i },
  { action: 'reach-up',      re: /touch your head/i },
  { action: 'clap',          re: /touch your shoulders/i },
  { action: 'bend-down',     re: /touch your knees|kneel|on your tummy|hands and feet on floor|downward dog|cobra pose|child'?s pose/i },
  { action: 'balance',       re: /slow motion|slow-?mo|like a snail|move slowly/i },
  { action: 'breathe-in',    re: /sit still and breathe|namaste|meditate/i },
  { action: 'raise-arms',    re: /arms? (out )?wide|spread your arms|wave your arms|arms like a|big red arch/i },
  { action: 'bend-down',     re: /sit down|float down|curl up|roll (yourself )?into a ball|get small|shrink down/i },
  { action: 'march',         re: /run in place|sprint|jog|running/i },
  { action: 'stretch-left',  re: /twist (your )?body|twist left|side twist/i },
  { action: 'wiggle',        re: /roll your shoulders|shoulder rolls?|silly face|make a face/i },
  { action: 'breathe-in',    re: /deep breaths?|three breaths|take a breath/i },
  { action: 'breathe-out',   re: /give yourself a hug|hug yourself|wrap your arms/i },
  { action: 'march',         re: /walk|step (like|around)|tip ?toe|stomp around|marching/i },
  { action: 'clap',          re: /hooray|cheer|shout|hurray|yay!|woo/i },
  { action: 'point',         re: /put your (right|left) (hand|arm|foot|leg) (in|out)|hand in|foot in/i },
  { action: 'spin',          re: /that'?s what it'?s all about|turn yourself around/i },
  { action: 'jump',          re: /jumping jacks?|\bhops?\b/i },
  { action: 'wiggle',        re: /do all three|all together now/i },
  { action: 'balance',       re: /hold (it|still|steady)|steady now/i },
  { action: 'bend-down',     re: /bend (down|over)|crouch|squat|get low|duck down/i },
  { action: 'raise-arms',    re: /arms? up|raise (your )?arms?|hands? up high|arms? (up )?high|shake your arms/i },
  { action: 'reach-up',      re: /reach (up|for the sky|to the sky|high)|stretch up|grow tall like/i },
  { action: 'clap',          re: /clap|applaud|pat your hands/i },
  { action: 'jump',          re: /jump|hop|leap|bounce/i },
  { action: 'stomp',         re: /stomp|march like an elephant|heavy steps/i },
  { action: 'march',         re: /march|walk in place|step in place|knees up/i },
  { action: 'spin',          re: /spin|twirl|turn around|whirl/i },
  { action: 'freeze',        re: /freeze|stop!|hold still|statue/i },
  { action: 'balance',       re: /balance|one (foot|leg)|stand on one|tree pose|flamingo/i },
  { action: 'breathe-in',    re: /breathe in|inhale|deep breath in|big breath/i },
  { action: 'breathe-out',   re: /breathe out|exhale|let it out|blow out/i },
  { action: 'stretch-left',  re: /(stretch|lean|bend|reach).*(left)|left side/i },
  { action: 'stretch-right', re: /(stretch|lean|bend|reach).*(right)|right side/i },
  { action: 'point',         re: /point|show me where|aim at/i },
  { action: 'wiggle',        re: /wiggle|wobble|jiggle|shimmy/i },
  { action: 'shake',         re: /shake/i },
  { action: 'bow',           re: /take a bow|bow|curtsy/i },
  { action: 'animal-pose',   re: /like an? (elephant|snake|bunny|penguin|lion|butterfly|bear|cat|dog|frog|crab|monkey|bird|duck)|slither|waddle|roar|flap|fly around/i },
  { action: 'follow-leader', re: /follow (the )?leader|copy me|do what i do|follow along/i },
  { action: 'stretch-left',  re: /side to side|left and right/i },
  { action: 'stand-tall',    re: /stand (up )?tall|stand up|get ready|starting position/i },
  { action: 'animal-pose',   re: /dance|dancing|silly dance|groove|boogie/i },
];

/**
 * Lines that continue the previous move rather than introducing a new one
 * ("Now do it faster!", "5 more!", "Last round!"). Dropping these to a neutral
 * stance would contradict the instruction, so the previous pose carries over.
 */
const CONTINUATION = /\b(again|faster|more|another|keep going|one more|last round|now do it|super fast|big ones|do it)\b/i;

/**
 * Resolve one instruction line to the pose that best expresses it.
 *
 * `previous` lets a sequence continue: pass the pose resolved for the preceding
 * step and continuation lines will hold that pose instead of resetting.
 */
export function poseForInstruction(instruction: string, previous?: PoseAction): PoseAction {
  for (const { action, re } of PATTERNS) {
    if (re.test(instruction)) return action;
  }
  if (previous && CONTINUATION.test(instruction)) return previous;
  return 'stand-tall';
}

/** Resolve a whole instruction list, threading continuation through the steps. */
export function posesForInstructions(instructions: string[]): PoseAction[] {
  const out: PoseAction[] = [];
  let prev: PoseAction | undefined;
  for (const line of instructions) {
    const action = poseForInstruction(line, prev);
    out.push(action);
    if (action !== 'stand-tall') prev = action;
  }
  return out;
}

/** Short label used for the accessible description of the figure. */
export const POSE_LABEL: Record<PoseAction, string> = {
  'raise-arms': 'arms raised high',
  clap: 'clapping hands',
  jump: 'jumping',
  'stretch-left': 'stretching to the left',
  'stretch-right': 'stretching to the right',
  'touch-toes': 'touching toes',
  march: 'marching',
  spin: 'spinning around',
  freeze: 'frozen still',
  balance: 'balancing on one foot',
  'breathe-in': 'breathing in',
  'breathe-out': 'breathing out',
  point: 'pointing',
  wiggle: 'wiggling',
  stomp: 'stomping',
  'reach-up': 'reaching up high',
  'bend-down': 'bending down',
  'animal-pose': 'moving like an animal',
  'follow-leader': 'following the leader',
  'stand-tall': 'standing tall',
  bow: 'taking a bow',
  shake: 'shaking',
};

/**
 * Limb geometry per pose. Angles are degrees; arms rotate about the shoulder,
 * legs about the hip. This drives one parametric figure rather than 22 bespoke
 * drawings, which keeps every pose on-style automatically.
 */
export interface PoseGeometry {
  leftArm: number;
  rightArm: number;
  leftLeg: number;
  rightLeg: number;
  lean: number;
  headTilt: number;
  /** Vertical offset in px — used for jump/hop poses. */
  lift?: number;
  /** Motion character for the code-supplied life on top of the pose. */
  motion?: 'bounce' | 'sway' | 'still' | 'fast' | 'breathe';
}

export const POSE_GEOMETRY: Record<PoseAction, PoseGeometry> = {
  // Arms/legs hang down at 0deg; positive is clockwise. Left limb takes the
  // positive angle, right limb its mirror, so the figure stays symmetric.
  'stand-tall':    { leftArm: 18, rightArm: -18, leftLeg: 6, rightLeg: -6, lean: 0, headTilt: 0, motion: 'breathe' },
  'raise-arms':    { leftArm: 150, rightArm: -150, leftLeg: 8, rightLeg: -8, lean: 0, headTilt: 0, motion: 'bounce' },
  'reach-up':      { leftArm: 168, rightArm: -168, leftLeg: 5, rightLeg: -5, lean: 0, headTilt: -6, motion: 'breathe' },
  clap:            { leftArm: 62, rightArm: -62, leftLeg: 7, rightLeg: -7, lean: 0, headTilt: 0, motion: 'fast' },
  jump:            { leftArm: 155, rightArm: -155, leftLeg: 26, rightLeg: -26, lean: 0, headTilt: 0, lift: -12, motion: 'bounce' },
  'stretch-left':  { leftArm: 165, rightArm: -30, leftLeg: 6, rightLeg: -6, lean: -16, headTilt: -8, motion: 'sway' },
  'stretch-right': { leftArm: 30, rightArm: -165, leftLeg: 6, rightLeg: -6, lean: 16, headTilt: 8, motion: 'sway' },
  'touch-toes':    { leftArm: 12, rightArm: -12, leftLeg: 3, rightLeg: -3, lean: 54, headTilt: 8, motion: 'breathe' },
  'bend-down':     { leftArm: 30, rightArm: -30, leftLeg: 22, rightLeg: -22, lean: 28, headTilt: 6, motion: 'breathe' },
  march:           { leftArm: 42, rightArm: -14, leftLeg: 38, rightLeg: -8, lean: 0, headTilt: 0, motion: 'fast' },
  stomp:           { leftArm: 34, rightArm: -34, leftLeg: 44, rightLeg: -6, lean: 4, headTilt: 0, motion: 'fast' },
  spin:            { leftArm: 120, rightArm: -55, leftLeg: 14, rightLeg: -14, lean: 8, headTilt: 12, motion: 'fast' },
  freeze:          { leftArm: 140, rightArm: -40, leftLeg: 18, rightLeg: -10, lean: 0, headTilt: -4, motion: 'still' },
  balance:         { leftArm: 130, rightArm: -130, leftLeg: 4, rightLeg: -54, lean: 0, headTilt: 0, motion: 'sway' },
  'breathe-in':    { leftArm: 120, rightArm: -120, leftLeg: 6, rightLeg: -6, lean: 0, headTilt: -8, motion: 'breathe' },
  'breathe-out':   { leftArm: 48, rightArm: -48, leftLeg: 6, rightLeg: -6, lean: 6, headTilt: 8, motion: 'breathe' },
  point:           { leftArm: 14, rightArm: -105, leftLeg: 7, rightLeg: -7, lean: 4, headTilt: -4, motion: 'sway' },
  wiggle:          { leftArm: 78, rightArm: -78, leftLeg: 14, rightLeg: -14, lean: 8, headTilt: -8, motion: 'fast' },
  shake:           { leftArm: 128, rightArm: -128, leftLeg: 12, rightLeg: -12, lean: 0, headTilt: 0, motion: 'fast' },
  'animal-pose':   { leftArm: 96, rightArm: -60, leftLeg: 22, rightLeg: -12, lean: 10, headTilt: 10, motion: 'bounce' },
  'follow-leader': { leftArm: 145, rightArm: -30, leftLeg: 28, rightLeg: -8, lean: 3, headTilt: 0, motion: 'fast' },
  bow:             { leftArm: 16, rightArm: -16, leftLeg: 5, rightLeg: -5, lean: 44, headTilt: 12, motion: 'breathe' },
};

/** Where per-step art would live once real assets exist. */
export function stepArtPath(activityId: string, action: PoseAction): string {
  return `/assets/movement/steps/${activityId}/${action}.png`;
}

/** Shared per-action art, used when an activity has no bespoke step art. */
export function sharedStepArtPath(action: PoseAction): string {
  return `/assets/movement/shared/${action}.png`;
}
