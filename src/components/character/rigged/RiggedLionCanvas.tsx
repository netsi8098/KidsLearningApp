import { Suspense, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import type { LionPose } from '../../GeneratedLion';
import { RiggedLionCharacter, type RiggedLionHandle, type RiggedLionIntent } from './RiggedLionCharacter';
import type { LionRigReport } from './lionRigContract';

interface RiggedLionCanvasProps {
  pose: LionPose;
  size: number;
  lookAt?: number;
  speechText?: string;
  speechKey?: number;
  mouthKey?: number;
  className?: string;
  onSpeechComplete?: () => void;
  onContractReport?: (report: LionRigReport) => void;
}

function intentForPose(pose: LionPose): RiggedLionIntent {
  if (pose === 'waving' || pose === 'pointing') return 'wave';
  if (pose === 'jumping') return 'jump';
  if (pose === 'celebrating' || pose === 'success' || pose === 'excited') return 'celebrate';
  return 'idle';
}

export default function RiggedLionCanvas({
  pose,
  size,
  lookAt = 0,
  speechText,
  speechKey,
  mouthKey,
  className,
  onSpeechComplete,
  onContractReport,
}: RiggedLionCanvasProps) {
  const characterRef = useRef<RiggedLionHandle>(null);
  const intent = useMemo(() => intentForPose(pose), [pose]);
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <div
      className={className}
      style={{ width: size, height: size, position: 'relative' }}
      role="img"
      aria-label={`Lion ${pose}, real-time rigged 3D character`}
    >
      <Canvas
        orthographic
        camera={{ position: [0, 1.78, 4], zoom: 50, near: 0.01, far: 20 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0, background: 'transparent' }}
      >
        <ambientLight intensity={1.7} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} />
        <Suspense fallback={null}>
          <RiggedLionCharacter
            ref={characterRef}
            intent={intent}
            reducedMotion={reducedMotion}
            lookAt={lookAt}
            speechText={speechText}
            speechKey={speechKey}
            mouthKey={mouthKey}
            onSpeechComplete={onSpeechComplete}
            onContractReport={onContractReport}
          />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
