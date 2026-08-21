import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type RefObject,
} from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { generateSimpleLipSync, getMouthShapeAtTime } from '../../../mascot/lipSync';
import {
  inspectLionRig,
  LION_RIG_CONTRACT,
  type LionRigReport,
} from './lionRigContract';

export type RiggedLionIntent =
  | 'idle'
  | 'walk'
  | 'wave'
  | 'jump'
  | 'celebrate'
  | 'look';

export interface RiggedLionHandle {
  returnToIdle(): void;
  walkTo(target: [number, number, number]): void;
  lookAt(target: [number, number, number]): void;
  wave(): void;
  speak(text: string, durationMs?: number): void;
  jump(): void;
  celebrate(): void;
}

interface RiggedLionCharacterProps {
  intent: RiggedLionIntent;
  reducedMotion?: boolean;
  lookAt?: number;
  speechText?: string;
  speechKey?: number;
  mouthKey?: number;
  onSpeechComplete?: () => void;
  onContractReport?: (report: LionRigReport) => void;
}

interface SpeechPerformance {
  startedAt: number;
  durationMs: number;
  cues: ReturnType<typeof generateSimpleLipSync>;
  completed: boolean;
}

interface LocomotionState {
  phase: 'idle' | 'starting' | 'walking' | 'stopping';
  target: THREE.Vector3;
}

function setMorph(root: THREE.Object3D, name: string, value: number) {
  root.traverse((object) => {
    const mesh = object as THREE.SkinnedMesh;
    const index = mesh.morphTargetDictionary?.[name];
    if (index === undefined || !mesh.morphTargetInfluences) return;
    mesh.morphTargetInfluences[index] = THREE.MathUtils.clamp(value, 0, 1);
  });
}

function mouthMorphForShape(shape: ReturnType<typeof getMouthShapeAtTime>) {
  switch (shape) {
    case 'closed': return 'viseme_MBP';
    case 'open-small': return 'mouth_narrow';
    case 'open-wide': return 'mouth_wide';
    case 'smile': return 'smile';
    case 'oh': return 'viseme_OU';
    case 'ee': return 'viseme_FV';
    default: return null;
  }
}

export const RiggedLionCharacter = forwardRef<RiggedLionHandle, RiggedLionCharacterProps>(
  function RiggedLionCharacter(
    {
      intent,
      reducedMotion = false,
      lookAt = 0,
      speechText = "Who's playing today?",
      speechKey = 0,
      mouthKey,
      onSpeechComplete,
      onContractReport,
    },
    forwardedRef,
  ) {
    const gltf = useGLTF(LION_RIG_CONTRACT.assetPath);
    const scene = useMemo(() => cloneSkeleton(gltf.scene), [gltf.scene]);
    const clips = useMemo(() => gltf.animations.map((source) => source.clone()), [gltf.animations]);
    const { actions, mixer } = useAnimations(clips, scene);
    const groupRef = useRef<THREE.Group>(null);
    const currentBaseRef = useRef<THREE.AnimationAction | null>(null);
    const sequenceCleanupRef = useRef<() => void>(() => undefined);
    const speechRef = useRef<SpeechPerformance | null>(null);
    const locomotionRef = useRef<LocomotionState>({
      phase: 'idle',
      target: new THREE.Vector3(),
    });
    const lookTargetRef = useRef(new THREE.Vector3(0, 0.7, 3));
    const blinkSeedRef = useRef(1.8);
    const onSpeechCompleteRef = useRef(onSpeechComplete);
    const report = useMemo(() => inspectLionRig(scene, clips), [clips, scene]);

    useEffect(() => {
      onSpeechCompleteRef.current = onSpeechComplete;
    }, [onSpeechComplete]);

    useEffect(() => {
      onContractReport?.(report);
      if (!report.valid) {
        console.error(`Rigged lion GLB failed its production asset contract: ${JSON.stringify(report)}`);
      }
    }, [onContractReport, report]);

    const playBase = useCallback((name: string, loop = true, fadeSeconds = 0.24) => {
      const next = actions[name];
      if (!next || currentBaseRef.current === next) return next ?? null;
      currentBaseRef.current?.fadeOut(fadeSeconds);
      next.reset();
      next.enabled = true;
      next.setEffectiveTimeScale(1);
      next.setEffectiveWeight(1);
      next.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
      next.clampWhenFinished = !loop;
      next.fadeIn(fadeSeconds).play();
      currentBaseRef.current = next;
      return next;
    }, [actions]);

    const playSequence = useCallback((names: string[]) => {
      sequenceCleanupRef.current();
      let index = 0;
      const cleanup = () => mixer.removeEventListener('finished', onFinished);
      const playNext = () => {
        const name = names[index++];
        if (!name) {
          cleanup();
          playBase('Idle');
          return;
        }
        playBase(name, false, 0.1);
      };
      const onFinished = (event: { action: THREE.AnimationAction }) => {
        if (event.action !== currentBaseRef.current) return;
        playNext();
      };
      mixer.addEventListener('finished', onFinished);
      sequenceCleanupRef.current = cleanup;
      playNext();
    }, [mixer, playBase]);

    useEffect(() => {
      const handleFinished = (event: { action: THREE.AnimationAction }) => {
        const locomotion = locomotionRef.current;
        if (locomotion.phase === 'starting' && event.action === actions.WalkStart) {
          locomotion.phase = 'walking';
          playBase('Walk', true, 0.12);
        } else if (locomotion.phase === 'stopping' && event.action === actions.WalkStop) {
          locomotion.phase = 'idle';
          playBase('Idle', true, 0.18);
        }
      };
      mixer.addEventListener('finished', handleFinished);
      return () => mixer.removeEventListener('finished', handleFinished);
    }, [actions.WalkStart, actions.WalkStop, mixer, playBase]);

    useEffect(() => () => sequenceCleanupRef.current(), []);

    useImperativeHandle(forwardedRef, () => ({
      returnToIdle: () => {
        locomotionRef.current.phase = 'idle';
        playBase('Idle');
      },
      walkTo: (target) => {
        locomotionRef.current.target.set(...target);
        locomotionRef.current.phase = 'starting';
        lookTargetRef.current.set(...target);
        playBase('WalkStart', false, 0.16);
      },
      lookAt: (target) => lookTargetRef.current.set(...target),
      wave: () => playSequence(['Wave']),
      speak: (text, durationMs = Math.max(900, text.split(/\s+/).length * 430)) => {
        speechRef.current = {
          startedAt: performance.now(),
          durationMs,
          cues: generateSimpleLipSync(text, durationMs),
          completed: false,
        };
      },
      jump: () => playSequence([
        'JumpAnticipation',
        'JumpTakeoff',
        'JumpAirborne',
        'JumpLand',
        'JumpRecovery',
      ]),
      celebrate: () => playSequence(['Celebrate']),
    }), [playBase, playSequence]);

    useEffect(() => {
      if (!report.valid) return;
      if (reducedMotion) {
        const idle = playBase('Idle');
        if (idle) {
          idle.paused = true;
          idle.time = 0;
        }
        return;
      }
      if (intent === 'walk') playBase('Walk');
      else if (intent === 'wave') playSequence(['Wave']);
      else if (intent === 'jump') playSequence([
        'JumpAnticipation', 'JumpTakeoff', 'JumpAirborne', 'JumpLand', 'JumpRecovery',
      ]);
      else if (intent === 'celebrate') playSequence(['Celebrate']);
      else playBase('Idle');
    }, [intent, playBase, playSequence, reducedMotion, report.valid]);

    useEffect(() => {
      const activeSpeechKey = mouthKey === undefined ? speechKey : mouthKey;
      if (!activeSpeechKey || !report.valid) return;
      const durationMs = Math.max(900, speechText.split(/\s+/).length * 430);
      speechRef.current = {
        startedAt: performance.now(),
        durationMs,
        cues: generateSimpleLipSync(speechText, durationMs),
        completed: false,
      };
    }, [mouthKey, report.valid, speechKey, speechText]);

    useFrame(({ clock }, delta) => {
      if (!report.valid) return;
      const group = groupRef.current;
      const locomotion = locomotionRef.current;
      if (!reducedMotion && group && locomotion.phase === 'walking') {
        const direction = locomotion.target.clone().sub(group.position);
        direction.y = 0;
        const distance = direction.length();
        if (distance <= 0.035) {
          locomotion.phase = 'stopping';
          playBase('WalkStop', false, 0.12);
        } else {
          direction.normalize();
          group.position.addScaledVector(direction, Math.min(distance, delta * 0.72));
          const heading = Math.atan2(direction.x, direction.z);
          group.rotation.y = THREE.MathUtils.damp(group.rotation.y, heading, 9, delta);
        }
      }

      if (reducedMotion) return;
      const head = scene.getObjectByName('head');
      const eyeL = scene.getObjectByName('eye_L');
      const eyeR = scene.getObjectByName('eye_R');
      const targetX = THREE.MathUtils.clamp(lookTargetRef.current.x + lookAt * 0.4, -1, 1);
      if (head) head.rotation.y = THREE.MathUtils.damp(head.rotation.y, targetX * 0.18, 8, delta);
      if (eyeL) eyeL.rotation.y = THREE.MathUtils.damp(eyeL.rotation.y, targetX * 0.24, 12, delta);
      if (eyeR) eyeR.rotation.y = THREE.MathUtils.damp(eyeR.rotation.y, targetX * 0.24, 12, delta);

      const seconds = clock.elapsedTime;
      const blinkPhase = seconds % blinkSeedRef.current;
      const blink = blinkPhase < 0.11 ? Math.sin((blinkPhase / 0.11) * Math.PI) : 0;
      setMorph(scene, 'blink_L', blink);
      setMorph(scene, 'blink_R', blink);

      const speech = speechRef.current;
      const speechElapsed = speech ? performance.now() - speech.startedAt : -1;
      const mouthNames = ['viseme_MBP', 'viseme_FV', 'viseme_OU', 'mouth_wide', 'mouth_narrow', 'mouth_round', 'smile'];
      mouthNames.forEach((name) => setMorph(scene, name, 0));
      if (speech && speechElapsed <= speech.durationMs) {
        const shape = getMouthShapeAtTime(speech.cues, speechElapsed);
        const morph = mouthMorphForShape(shape);
        if (morph) setMorph(scene, morph, 1);
        const jaw = scene.getObjectByName('jaw');
        if (jaw) jaw.rotation.x = THREE.MathUtils.damp(jaw.rotation.x, shape === 'closed' ? 0 : 0.18, 18, delta);
      } else if (speech) {
        const jaw = scene.getObjectByName('jaw');
        if (jaw) jaw.rotation.x = THREE.MathUtils.damp(jaw.rotation.x, 0, 18, delta);
        if (!speech.completed) {
          speech.completed = true;
          onSpeechCompleteRef.current?.();
        }
        speechRef.current = null;
      }
    });

    return (
      <group position={[0, -0.75, 0]} dispose={null}>
        <group ref={groupRef} scale={[1.2, 1, 1]}>
          <primitive object={scene} />
        </group>
      </group>
    );
  },
);

useGLTF.preload(LION_RIG_CONTRACT.assetPath);

export type RiggedLionCharacterRef = RefObject<RiggedLionHandle | null>;
