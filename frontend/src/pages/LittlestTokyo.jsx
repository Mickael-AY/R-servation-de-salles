// pages/LittlestTokyo.jsx
import { Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Environment } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_URL = 'https://threejs.org/examples/models/gltf/LittlestTokyo.glb';

function Model() {
  const group = useRef();
  const { scene, animations } = useGLTF(MODEL_URL, true);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (actions) {
      const firstAction = Object.values(actions)[0];
      if (firstAction) firstAction.play();
    }
  }, [actions]);

  return (
    <group ref={group}>
      <primitive
        object={scene}
        position={[1, 1, 0]}
        scale={[0.01, 0.01, 0.01]}
      />
    </group>
  );
}

function Loader() {
  return (
    <div className="room3d-loading">
      <div className="room3d-loading-spinner" />
      <p>Chargement du modele 3D...</p>
    </div>
  );
}

function Scene() {
  return (
    <>
      <Model />
      <Environment preset="apartment" />
    </>
  );
}

function LittlestTokyo() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="room3d-page" style={{ background: '#bfe3dd' }}>
      <div className="room3d-overlay">
        <Link to="/" className="btn btn-small room3d-back">← Retour</Link>
        <div className="room3d-info">
          <h2>Littlest Tokyo</h2>
          <p>Animation 3D interactive</p>
        </div>
      </div>

      <div className="room3d-hint">
        Clic gauche : tourner &nbsp;|&nbsp; Molette : zoomer
      </div>

      {!loaded && <Loader />}

      <Canvas
        shadows
        camera={{ position: [5, 2, 8], fov: 40, near: 1, far: 100 }}
        gl={{ antialias: true }}
        onCreated={() => setLoaded(true)}
      >
        <color attach="background" args={['#bfe3dd']} />

        <Suspense fallback={null}>
          <Scene />
        </Suspense>

        <OrbitControls
          target={[0, 0.5, 0]}
          enablePan={false}
          enableDamping
        />
      </Canvas>
    </div>
  );
}

export default LittlestTokyo;
