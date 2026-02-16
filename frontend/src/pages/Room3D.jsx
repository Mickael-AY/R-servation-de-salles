// pages/Room3D.jsx
import { Suspense, useRef, useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// ─── Architecture ───
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[8, 6]} />
      <meshPhysicalMaterial
        color="#b8935a"
        roughness={0.35}
        metalness={0.0}
        clearcoat={0.6}
        clearcoatRoughness={0.25}
      />
    </mesh>
  );
}

function Walls() {
  const wallColor = '#c4b8a4';
  const sideColor = '#c0b49e';
  const frontColor = '#bfb49c';
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 1.5, -3]} receiveShadow>
        <boxGeometry args={[8.15, 3, 0.15]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-4, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.15, 3, 6.15]} />
        <meshStandardMaterial color={sideColor} roughness={0.95} />
      </mesh>
      {/* Right wall */}
      <mesh position={[4, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.15, 3, 6.15]} />
        <meshStandardMaterial color={sideColor} roughness={0.95} />
      </mesh>
      {/* Front wall - left piece: covers x=-4 to x=-0.5 */}
      <mesh position={[-2.25, 1.5, 3]} receiveShadow>
        <boxGeometry args={[3.5, 3, 0.15]} />
        <meshStandardMaterial color={frontColor} roughness={0.95} />
      </mesh>
      {/* Front wall - right piece: covers x=0.5 to x=4 */}
      <mesh position={[2.25, 1.5, 3]} receiveShadow>
        <boxGeometry args={[3.5, 3, 0.15]} />
        <meshStandardMaterial color={frontColor} roughness={0.95} />
      </mesh>
      {/* Front wall - top piece above door: covers x=-0.5 to x=0.5, y=2.3 to 3 */}
      <mesh position={[0, 2.65, 3]} receiveShadow>
        <boxGeometry args={[1, 0.7, 0.15]} />
        <meshStandardMaterial color={frontColor} roughness={0.95} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, 3.02, 0]}>
        <boxGeometry args={[8.15, 0.08, 6.15]} />
        <meshStandardMaterial color="#e5e0d6" roughness={1} />
      </mesh>
      {/* Baseboards */}
      {[
        [0, 0.045, -2.86, 8, 0.09, 0.025],
        [-3.86, 0.045, 0, 0.025, 0.09, 6],
        [3.86, 0.045, 0, 0.025, 0.09, 6],
        [-2.25, 0.045, 2.86, 3.5, 0.09, 0.025],
        [2.25, 0.045, 2.86, 3.5, 0.09, 0.025]
      ].map((b, i) => (
        <mesh key={i} position={[b[0], b[1], b[2]]}>
          <boxGeometry args={[b[3], b[4], b[5]]} />
          <meshStandardMaterial color="#c4b8a8" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Door() {
  const [open, setOpen] = useState(false);
  const doorRef = useRef();
  const target = useRef(0);

  useFrame(() => {
    if (!doorRef.current) return;
    target.current = open ? -Math.PI / 2.2 : 0;
    doorRef.current.rotation.y += (target.current - doorRef.current.rotation.y) * 0.05;
  });

  return (
    <group position={[-0.5, 0, 2.92]} onClick={() => setOpen(!open)}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'default'}
    >
      {/* Door frame */}
      <mesh position={[0.5, 2.31, 0]}>
        <boxGeometry args={[1.06, 0.06, 0.16]} />
        <meshStandardMaterial color="#8a7d6b" roughness={0.5} />
      </mesh>
      {[0, 1.0].map((x, i) => (
        <mesh key={i} position={[x, 1.15, 0]}>
          <boxGeometry args={[0.06, 2.3, 0.16]} />
          <meshStandardMaterial color="#8a7d6b" roughness={0.5} />
        </mesh>
      ))}

      <group ref={doorRef}>
        <mesh position={[0.5, 1.15, 0]} castShadow>
          <boxGeometry args={[0.92, 2.28, 0.05]} />
          <meshPhysicalMaterial color="#8B6914" roughness={0.45} clearcoat={0.3} clearcoatRoughness={0.4} />
        </mesh>
        {/* Panels */}
        {[1.65, 0.65].map((y, i) => (
          <mesh key={i} position={[0.5, y, 0.028]}>
            <boxGeometry args={[0.66, 0.65, 0.008]} />
            <meshPhysicalMaterial color="#7a5c12" roughness={0.5} clearcoat={0.2} clearcoatRoughness={0.5} />
          </mesh>
        ))}
        {/* Handle */}
        <mesh position={[0.88, 1.05, 0.03]}>
          <boxGeometry args={[0.04, 0.15, 0.008]} />
          <meshPhysicalMaterial color="#c5a94e" metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh position={[0.88, 1.05, 0.055]}>
          <boxGeometry args={[0.09, 0.015, 0.015]} />
          <meshPhysicalMaterial color="#d4af37" metalness={0.95} roughness={0.08} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Furniture ───
function Table() {
  return (
    <group>
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.055, 1.3]} />
        <meshPhysicalMaterial color="#3d1f0a" roughness={0.2} metalness={0.02} clearcoat={0.9} clearcoatRoughness={0.1} />
      </mesh>
      <mesh position={[0, 0.71, 0]}>
        <boxGeometry args={[3.02, 0.02, 1.32]} />
        <meshPhysicalMaterial color="#2a1506" roughness={0.3} clearcoat={0.5} clearcoatRoughness={0.2} />
      </mesh>
      {[[-1.35, -0.55], [1.35, -0.55], [-1.35, 0.55], [1.35, 0.55]].map((p, i) => (
        <mesh key={i} position={[p[0], 0.35, p[1]]} castShadow>
          <boxGeometry args={[0.05, 0.7, 0.05]} />
          <meshPhysicalMaterial color="#71717a" metalness={0.9} roughness={0.15} />
        </mesh>
      ))}
      {[-0.55, 0.55].map((z, i) => (
        <mesh key={i} position={[0, 0.2, z]}>
          <boxGeometry args={[2.7, 0.02, 0.02]} />
          <meshPhysicalMaterial color="#71717a" metalness={0.9} roughness={0.15} />
        </mesh>
      ))}
    </group>
  );
}

function Chair({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.46, 0.02]} castShadow>
        <boxGeometry args={[0.43, 0.045, 0.43]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.485, 0.02]}>
        <boxGeometry args={[0.39, 0.015, 0.39]} />
        <meshStandardMaterial color="#334155" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.75, -0.19]} castShadow>
        <boxGeometry args={[0.41, 0.54, 0.03]} />
        <meshStandardMaterial color="#1e293b" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.75, -0.17]}>
        <boxGeometry args={[0.37, 0.46, 0.015]} />
        <meshStandardMaterial color="#334155" roughness={0.95} />
      </mesh>
      {[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].map((l, i) => (
        <mesh key={i} position={[l[0], 0.22, l[1]]}>
          <cylinderGeometry args={[0.012, 0.012, 0.44, 6]} />
          <meshStandardMaterial color="#71717a" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function Chairs() {
  const d = [
    { p: [-1, 0, -1], r: [0, 0, 0] },
    { p: [0, 0, -1], r: [0, 0, 0] },
    { p: [1, 0, -1], r: [0, 0, 0] },
    { p: [-1, 0, 1], r: [0, Math.PI, 0] },
    { p: [0, 0, 1], r: [0, Math.PI, 0] },
    { p: [1, 0, 1], r: [0, Math.PI, 0] },
    { p: [-1.85, 0, 0], r: [0, Math.PI / 2, 0] },
    { p: [1.85, 0, 0], r: [0, -Math.PI / 2, 0] }
  ];
  return <group>{d.map((c, i) => <Chair key={i} position={c.p} rotation={c.r} />)}</group>;
}

function Laptop({ position, rotation = [0, 0, 0] }) {
  const ref = useRef();
  useFrame((s) => {
    if (ref.current) ref.current.material.emissiveIntensity = 0.4 + Math.sin(s.clock.elapsedTime * 2) * 0.08;
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[0.33, 0.012, 0.23]} />
        <meshPhysicalMaterial color="#374151" roughness={0.3} metalness={0.7} clearcoat={0.4} clearcoatRoughness={0.3} />
      </mesh>
      <group position={[0, 0.12, -0.105]} rotation={[-0.22, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.33, 0.22, 0.006]} />
          <meshPhysicalMaterial color="#374151" roughness={0.3} metalness={0.7} clearcoat={0.4} />
        </mesh>
        <mesh ref={ref} position={[0, 0.005, 0.005]}>
          <planeGeometry args={[0.285, 0.175]} />
          <meshStandardMaterial color="#172554" emissive="#2563eb" emissiveIntensity={0.4} roughness={0.02} />
        </mesh>
      </group>
    </group>
  );
}

function CoffeeCup({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.038, 0.032, 0.085, 12]} />
        <meshPhysicalMaterial color="#fafaf9" roughness={0.25} clearcoat={0.8} clearcoatRoughness={0.15} />
      </mesh>
      <mesh position={[0, 0.038, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.035, 12]} />
        <meshStandardMaterial color="#451a03" roughness={0.3} />
      </mesh>
      <mesh position={[0.048, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.022, 0.005, 6, 12, Math.PI]} />
        <meshPhysicalMaterial color="#fafaf9" roughness={0.25} clearcoat={0.8} />
      </mesh>
    </group>
  );
}

function NotepadPen({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[0.14, 0.008, 0.2]} />
        <meshStandardMaterial color="#fef9c3" roughness={0.85} />
      </mesh>
      {[-0.06, -0.02, 0.02, 0.06].map((z, i) => (
        <mesh key={i} position={[0, 0.005, z]}>
          <planeGeometry args={[0.11, 0.001]} />
          <meshBasicMaterial color="#93c5fd" />
        </mesh>
      ))}
      <mesh position={[0.1, 0.012, 0.03]} rotation={[0, -0.3, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.14, 6]} />
        <meshStandardMaterial color="#1e3a8a" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Books({ position, rotation = [0, 0, 0] }) {
  const colors = ['#991b1b', '#1e3a8a', '#065f46', '#92400e', '#581c87'];
  return (
    <group position={position} rotation={rotation}>
      {colors.map((c, i) => (
        <mesh key={i} position={[0, i * 0.03, 0]} castShadow>
          <boxGeometry args={[0.17 - i * 0.004, 0.026, 0.12]} />
          <meshStandardMaterial color={c} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function PictureFrame({ position, rotation = [0, 0, 0], artColor = '#1e1b4b' }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[0.56, 0.42, 0.03]} />
        <meshPhysicalMaterial color="#292524" roughness={0.35} metalness={0.2} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.016]}>
        <planeGeometry args={[0.50, 0.36]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.017]}>
        <planeGeometry args={[0.42, 0.28]} />
        <meshStandardMaterial color={artColor} roughness={0.7} />
      </mesh>
      <mesh position={[-0.06, 0.04, 0.018]}>
        <circleGeometry args={[0.055, 16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.6} />
      </mesh>
      <mesh position={[0.08, -0.02, 0.018]}>
        <circleGeometry args={[0.07, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.6} transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

function Shelf({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.022, 0.2]} />
        <meshPhysicalMaterial color="#78522a" roughness={0.4} clearcoat={0.3} clearcoatRoughness={0.4} />
      </mesh>
      {[-0.3, 0.3].map((x, i) => (
        <mesh key={i} position={[x, -0.055, 0.085]}>
          <boxGeometry args={[0.025, 0.09, 0.025]} />
          <meshStandardMaterial color="#71717a" metalness={0.85} roughness={0.15} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Equipment ───
function Whiteboard() {
  return (
    <group position={[0, 1.75, -2.9]}>
      <mesh>
        <boxGeometry args={[2.6, 1.3, 0.05]} />
        <meshPhysicalMaterial color="#a1a1aa" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.028]}>
        <boxGeometry args={[2.42, 1.16, 0.008]} />
        <meshPhysicalMaterial color="#fefefe" roughness={0.03} metalness={0.01} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      <mesh position={[0, -0.7, 0.06]}>
        <boxGeometry args={[1.5, 0.035, 0.07]} />
        <meshPhysicalMaterial color="#a1a1aa" metalness={0.5} roughness={0.35} />
      </mesh>
      {[-0.25, -0.05, 0.15].map((x, i) => (
        <mesh key={i} position={[x, -0.67, 0.065]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.011, 0.011, 0.12, 6]} />
          <meshStandardMaterial color={['#dc2626', '#2563eb', '#16a34a'][i]} roughness={0.6} />
        </mesh>
      ))}
      {[
        [-0.5, 0.3, 0.9, '#2563eb'],
        [-0.35, 0.18, 0.6, '#dc2626'],
        [-0.6, 0.06, 0.8, '#16a34a'],
        [-0.2, -0.06, 0.45, '#2563eb']
      ].map(([x, y, w, c], i) => (
        <mesh key={i} position={[x, y, 0.034]}>
          <planeGeometry args={[w, 0.007]} />
          <meshBasicMaterial color={c} />
        </mesh>
      ))}
    </group>
  );
}

function TVScreen() {
  const ref = useRef();
  useFrame((s) => {
    if (ref.current) ref.current.material.emissiveIntensity = 0.3 + Math.sin(s.clock.elapsedTime * 0.4) * 0.06;
  });

  return (
    <group position={[3.9, 1.7, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh>
        <boxGeometry args={[1.8, 1.05, 0.055]} />
        <meshPhysicalMaterial color="#0a0a0a" roughness={0.2} metalness={0.3} />
      </mesh>
      <mesh ref={ref} position={[0, 0, 0.03]}>
        <boxGeometry args={[1.72, 0.97, 0.005]} />
        <meshPhysicalMaterial
          color="#0f172a"
          emissive="#1d4ed8"
          emissiveIntensity={0.3}
          roughness={0.02}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>
      <Html position={[0, 0, 0.04]} transform distanceFactor={4}>
        <div style={{
          color: '#e0e7ff', fontSize: '16px', fontWeight: 800,
          textAlign: 'center', fontFamily: 'system-ui',
          textShadow: '0 0 20px rgba(99,102,241,0.8), 0 0 40px rgba(99,102,241,0.4)',
          userSelect: 'none', pointerEvents: 'none', letterSpacing: '0.05em'
        }}>
          TechSpace<br />
          <span style={{ fontSize: '9px', fontWeight: 400, opacity: 0.6, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Salle de reunion
          </span>
        </div>
      </Html>
      <mesh position={[0, -0.62, -0.025]}>
        <boxGeometry args={[0.04, 0.25, 0.035]} />
        <meshPhysicalMaterial color="#0a0a0a" roughness={0.2} metalness={0.3} />
      </mesh>
    </group>
  );
}

function Window() {
  return (
    <group position={[-3.9, 1.6, -0.5]} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <boxGeometry args={[2.2, 1.6, 0.1]} />
        <meshStandardMaterial color="#d4d4d8" roughness={0.5} />
      </mesh>
      {[-0.53, 0.53].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.03]}>
          <boxGeometry args={[1, 1.4, 0.015]} />
          <meshPhysicalMaterial
            color="#dbeafe"
            transparent
            opacity={0.2}
            roughness={0.02}
            clearcoat={1}
            clearcoatRoughness={0}
          />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.04, 1.4, 0.035]} />
        <meshStandardMaterial color="#d4d4d8" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.15, 0.05]}>
        <boxGeometry args={[2.1, 0.035, 0.035]} />
        <meshStandardMaterial color="#d4d4d8" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.85, 0.08]}>
        <boxGeometry args={[2.3, 0.04, 0.15]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Clock() {
  const secRef = useRef();
  const minRef = useRef();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (secRef.current) secRef.current.rotation.z = -t;
    if (minRef.current) minRef.current.rotation.z = -t * 0.02;
  });

  return (
    <group position={[3.9, 2.2, -1.8]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Face */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 24]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.3} />
      </mesh>
      {/* Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.01, 8, 24]} />
        <meshStandardMaterial color="#a8a29e" metalness={0.8} roughness={0.15} />
      </mesh>
      {/* Hour marks */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const isMain = i % 3 === 0;
        const r = 0.145;
        return (
          <mesh key={i} position={[Math.sin(a) * r, Math.cos(a) * r, 0.012]} rotation={[0, 0, -a]}>
            <boxGeometry args={[isMain ? 0.01 : 0.005, isMain ? 0.025 : 0.015, 0.002]} />
            <meshStandardMaterial color="#1c1917" />
          </mesh>
        );
      })}
      {/* Minute hand */}
      <mesh ref={minRef} position={[0, 0, 0.014]}>
        <boxGeometry args={[0.008, 0.12, 0.002]} />
        <meshStandardMaterial color="#0c0a09" />
      </mesh>
      {/* Hour hand */}
      <mesh position={[0, 0, 0.015]} rotation={[0, 0, -Math.PI / 3]}>
        <boxGeometry args={[0.01, 0.08, 0.002]} />
        <meshStandardMaterial color="#0c0a09" />
      </mesh>
      {/* Second hand */}
      <mesh ref={secRef} position={[0, 0, 0.016]}>
        <boxGeometry args={[0.003, 0.13, 0.001]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <mesh position={[0, 0, 0.017]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
    </group>
  );
}

function CeilingLight({ position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.2, 0.03, 0.25]} />
        <meshStandardMaterial color="#fff" emissive="#fffbeb" emissiveIntensity={1.2} roughness={0.05} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[1.25, 0.015, 0.28]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.3} roughness={0.3} />
      </mesh>
      <pointLight position={[0, -0.12, 0]} intensity={0.35} distance={4} color="#fef3c7" castShadow shadow-mapSize={[512, 512]} />
    </group>
  );
}

function Plant({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.19, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.11, 0.38, 8]} />
        <meshStandardMaterial color="#78716c" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.39, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 8]} />
        <meshStandardMaterial color="#3f3f46" roughness={1} />
      </mesh>
      {[0, 1.1, 2.2, 3.4, 4.5, 5.7].map((a, i) => (
        <mesh key={i} position={[Math.cos(a) * (0.08 + i * 0.015), 0.48 + i * 0.05, Math.sin(a) * (0.08 + i * 0.015)]} castShadow>
          <sphereGeometry args={[0.095 + i * 0.01, 6, 5]} />
          <meshStandardMaterial color={['#22c55e', '#16a34a', '#15803d'][i % 3]} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function LightSwitch({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[0.07, 0.11, 0.01]} />
        <meshStandardMaterial color="#d6cfbf" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.006]}>
        <boxGeometry args={[0.025, 0.04, 0.008]} />
        <meshStandardMaterial color="#c4b8a8" roughness={0.4} />
      </mesh>
    </group>
  );
}

function PowerOutlet({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[0.065, 0.065, 0.008]} />
        <meshStandardMaterial color="#d6cfbf" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <circleGeometry args={[0.025, 12]} />
        <meshStandardMaterial color="#c4b8a8" roughness={0.4} />
      </mesh>
      {[-0.008, 0.008].map((y, i) => (
        <mesh key={i} position={[0, y, 0.007]}>
          <circleGeometry args={[0.004, 6]} />
          <meshStandardMaterial color="#71717a" roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Camera mode switch ───
function CameraMode({ mode }) {
  const { camera } = useThree();

  useEffect(() => {
    if (mode === 'visit') {
      camera.position.set(0, 1.65, 2.5);
    } else {
      camera.position.set(5, 3.2, 5);
    }
  }, [mode, camera]);

  return null;
}

// ─── Scene ───
function MeetingRoom() {
  return (
    <group>
      <Floor />
      <Walls />
      <Door />
      <Table />
      <Chairs />
      <Whiteboard />
      <TVScreen />
      <Window />
      <Clock />
      <CeilingLight position={[-1.5, 2.97, 0]} />
      <CeilingLight position={[1.5, 2.97, 0]} />
      <Plant position={[3.2, 0, -2.4]} />
      <Plant position={[-3.2, 0, 2.4]} />

      <Laptop position={[-0.6, 0.77, -0.15]} />
      <Laptop position={[0.6, 0.77, 0.2]} rotation={[0, 2.8, 0]} />
      <CoffeeCup position={[-1.15, 0.77, 0.4]} />
      <CoffeeCup position={[1.25, 0.77, -0.35]} />
      <NotepadPen position={[0.05, 0.77, -0.35]} rotation={[0, 0.1, 0]} />
      <NotepadPen position={[-0.15, 0.77, 0.4]} rotation={[0, -0.2, 0]} />

      <Shelf position={[3.85, 2.15, 1.8]} />
      <Books position={[3.75, 2.17, 1.8]} rotation={[0, -Math.PI / 2, 0]} />
      <PictureFrame position={[-2.8, 2.05, -2.9]} artColor="#1e1b4b" />
      <PictureFrame position={[2.8, 2.05, -2.9]} artColor="#0c4a6e" />
      <LightSwitch position={[0.55, 1.2, 2.92]} />
      <PowerOutlet position={[-3.92, 0.3, -2]} rotation={[0, Math.PI / 2, 0]} />
      <PowerOutlet position={[3.92, 0.3, 1.2]} rotation={[0, -Math.PI / 2, 0]} />

      <ambientLight intensity={0.2} />
      <directionalLight
        position={[-5, 8, -2]}
        intensity={0.45}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={20}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0003}
      />
      <hemisphereLight args={['#bfdbfe', '#fef3c7', 0.2]} />
    </group>
  );
}

function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.9} luminanceSmoothing={0.3} intensity={0.15} />
      <Vignette offset={0.3} darkness={0.35} />
    </EffectComposer>
  );
}

function LoadingScreen() {
  return (
    <div className="room3d-loading">
      <div className="room3d-loading-spinner" />
      <p>Chargement de la salle 3D...</p>
    </div>
  );
}

export default function Room3D() {
  const [mode, setMode] = useState('orbit');

  return (
    <div className="room3d-page">
      <div className="room3d-overlay">
        <Link to="/" className="btn btn-secondary room3d-back">&larr; Retour</Link>
        <div className="room3d-info">
          <h2>Salle de reunion TechSpace</h2>
          <p>Visite virtuelle interactive</p>
        </div>
      </div>

      <div className="room3d-controls">
        <button className={`room3d-mode-btn ${mode === 'orbit' ? 'active' : ''}`} onClick={() => setMode('orbit')}>
          Vue Orbite
        </button>
        <button className={`room3d-mode-btn ${mode === 'visit' ? 'active' : ''}`} onClick={() => setMode('visit')}>
          Mode Visite
        </button>
      </div>

      <div className="room3d-hint">
        {mode === 'orbit'
          ? 'Clic gauche : tourner \u2022 Scroll : zoomer \u2022 Clic droit : deplacer \u2022 Cliquez sur la porte !'
          : 'Vue immersive a hauteur d\u2019yeux \u2022 Rotation libre'}
      </div>

      <Suspense fallback={<LoadingScreen />}>
        <Canvas
          shadows
          camera={{ position: [8, 5, 8], fov: 50 }}
          style={{ background: 'linear-gradient(180deg, #dbeafe 0%, #eff6ff 40%, #f8fafc 100%)' }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
        >
          <MeetingRoom />
          <Environment preset="apartment" background={false} />
          <CameraMode mode={mode} />
          <OrbitControls
            target={mode === 'visit' ? [0, 1.2, 0] : [0, 0.8, 0]}
            enableDamping
            dampingFactor={0.05}
            minDistance={0.5}
            maxDistance={20}
          />
          <Effects />
        </Canvas>
      </Suspense>
    </div>
  );
}
