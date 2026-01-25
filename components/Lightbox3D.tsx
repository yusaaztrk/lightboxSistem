
import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  ContactShadows,
  useTexture,
  MeshReflectorMaterial,
  useHelper,
  SpotLight as DreiSpotLight
} from '@react-three/drei';
import * as THREE from 'three';
import { ConfigOptions, ShapeType, ProfileType } from '../types';

const Mesh = 'mesh' as any;
const Group = 'group' as any;
const BoxGeometry = 'boxGeometry' as any;
const CylinderGeometry = 'cylinderGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const PlaneGeometry = 'planeGeometry' as any;
const CircleGeometry = 'circleGeometry' as any;
const PointLight = 'pointLight' as any;
const AmbientLight = 'ambientLight' as any;

interface ModelProps {
  config: ConfigOptions;
  isMockupMode?: boolean;
}

const TexturedMaterial: React.FC<{ url: string; isTechnical: boolean; isLightOn: boolean }> = ({ url, isTechnical, isLightOn }) => {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  texture.needsUpdate = true;

  return (
    <MeshStandardMaterial
      map={texture}
      emissiveMap={texture}
      // Light OFF -> Darker base color + No Emissive
      // Light ON -> White base color + High Emissive
      color={isLightOn ? "#ffffff" : "#666666"}
      transparent={isTechnical}
      opacity={isTechnical ? 0.0 : 1.0}
      emissive="#ffffff"
      emissiveIntensity={isTechnical ? 0.0 : (isLightOn ? 1.5 : 0.0)}
      toneMapped={false} // Allows colors to exceed 1.0 for bloom effect
      visible={!isTechnical}
    />
  );
};

const LedStrips: React.FC<{ width: number; height: number; spacing: number; depth: number }> = ({ width, height, spacing, depth }) => {
  // Görseldeki gibi YATAY şeritler oluşturuyoruz
  const strips = useMemo(() => {
    const stripCount = Math.max(1, Math.floor(height / spacing));
    const startY = (height / 2) - (spacing / 2);
    const stripPositions = [];

    for (let i = 0; i < stripCount; i++) {
      stripPositions.push(startY - (i * spacing));
    }
    return stripPositions;
  }, [height, spacing]);

  return (
    <Group>
      {strips.map((posY, idx) => (
        <Mesh key={idx} position={[0, posY, -depth / 2 + 0.012]}>
          {/* Yatay şeritler: genişliği kasanın iç genişliği kadar */}
          <BoxGeometry args={[width - 0.04, 0.015, 0.005]} />
          <MeshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.05}
          />
        </Mesh>
      ))}
    </Group>
  );
};



const Feet: React.FC<{ width: number; height: number; depth: number }> = ({ width, height, depth }) => {
  const legLength = 0.25; // 25cm leg
  const legWidth = 0.03;
  const angle = 0.5; // radian spread

  // Helper for a single leg with a pad
  const LegWithPad: React.FC<{ isFront: boolean; zRot: number }> = ({ isFront, zRot }) => {
    // Front Leg (z=0.1): Rot X = -angle (bottom goes backward/inward)
    // Back Leg (z=-0.1): Rot X = angle (bottom goes forward/inward)
    const xRot = isFront ? -angle : angle;

    return (
      <Mesh position={[0, -0.1, isFront ? 0.1 : -0.1]} rotation={[xRot, 0, zRot]}>
        <BoxGeometry args={[legWidth, legLength, 0.005]} />
        <MeshStandardMaterial color="#111111" metalness={0.8} roughness={0.2} />

        {/* Pad */}
        <Mesh position={[0, -legLength / 2, 0]} rotation={[-xRot, 0, 0]}>
          <BoxGeometry args={[0.04, 0.005, 0.06]} />
          <MeshStandardMaterial color="#111111" metalness={0.8} roughness={0.2} />
        </Mesh>
      </Mesh>
    );
  };

  return (
    <Group>
      {/* Left Assembly */}
      <Group position={[-width / 2 - 0.01, -height / 2 + 0.1, 0]}>
        <LegWithPad isFront={true} zRot={0.1} />
        <LegWithPad isFront={false} zRot={0.1} />
        {/* Connection Plate */}
        <Mesh position={[0, 0, 0]}>
          <BoxGeometry args={[legWidth, 0.1, 0.15]} />
          <MeshStandardMaterial color="#111111" metalness={0.8} roughness={0.2} />
        </Mesh>
      </Group>

      {/* Right Assembly */}
      <Group position={[width / 2 + 0.01, -height / 2 + 0.1, 0]}>
        <LegWithPad isFront={true} zRot={-0.1} />
        <LegWithPad isFront={false} zRot={-0.1} />
        {/* Connection Plate */}
        <Mesh position={[0, 0, 0]}>
          <BoxGeometry args={[legWidth, 0.1, 0.15]} />
          <MeshStandardMaterial color="#111111" metalness={0.8} roughness={0.2} />
        </Mesh>
      </Group>
    </Group>
  );
};

const LightboxModel: React.FC<ModelProps> = ({ config }) => {
  const { shape, width, height, depth, userImageUrl, viewMode, ledSpacing, isLightOn = true, hasFeet = false, frameColor = '#c0c0c0' } = config;

  const scale = 0.01;
  const w = width * scale;
  const h = height * scale;
  const d = depth * scale;
  const spacingScaled = ledSpacing * scale;

  const isTechnical = viewMode === 'technical';

  return (
    <Group position={[0, h / 2 + (hasFeet ? 0.1 : 0), 0]}> {/* Lift up if standing */}
      {hasFeet && !isTechnical && <Feet width={w} height={h} depth={d} />}

      {/* KASA ÇERÇEVESİ - Dynamic Color */}
      <Group>
        {shape === ShapeType.RECTANGLE ? (
          <>
            {/* Üst */}
            <Mesh position={[0, h / 2 - 0.005, 0]}>
              <BoxGeometry args={[w, 0.01, d]} />
              <MeshStandardMaterial color={frameColor} metalness={0.9} roughness={0.2} />
            </Mesh>
            {/* Alt */}
            <Mesh position={[0, -h / 2 + 0.005, 0]}>
              <BoxGeometry args={[w, 0.01, d]} />
              <MeshStandardMaterial color={frameColor} metalness={0.9} roughness={0.2} />
            </Mesh>
            {/* Sol */}
            <Mesh position={[-w / 2 + 0.005, 0, 0]}>
              <BoxGeometry args={[0.01, h, d]} />
              <MeshStandardMaterial color={frameColor} metalness={0.9} roughness={0.2} />
            </Mesh>
            {/* Sağ */}
            <Mesh position={[w / 2 - 0.005, 0, 0]}>
              <BoxGeometry args={[0.01, h, d]} />
              <MeshStandardMaterial color={frameColor} metalness={0.9} roughness={0.2} />
            </Mesh>
          </>
        ) : (
          <Mesh rotation={[Math.PI / 2, 0, 0]}>
            <CylinderGeometry args={[w / 2, w / 2, d, 64, 1, true]} />
            <MeshStandardMaterial color={frameColor} metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
          </Mesh>
        )}
      </Group>

      {/* ZEMİN / ARKA PANEL (Görseldeki beyaz zemin gibi) */}
      <Mesh position={[0, 0, -d / 2 + 0.008]}>
        {shape === ShapeType.RECTANGLE ? <PlaneGeometry args={[w - 0.01, h - 0.01]} /> : <CircleGeometry args={[w / 2 - 0.01, 64]} />}
        <MeshStandardMaterial color={isTechnical ? "#f0f0f0" : "#111111"} metalness={0.1} roughness={1} />
      </Mesh>

      {/* LED DİZİLİMİ - Sadece Teknik Şema'da ve Yatay Formda */}
      {isTechnical && (
        <LedStrips width={w} height={h} spacing={spacingScaled} depth={d} />
      )}

      {/* ÖN PANEL (BASKI) - Teknik modda gizli */}
      {!isTechnical && (
        <Mesh position={[0, 0, d / 2]}>
          {shape === ShapeType.RECTANGLE ? <PlaneGeometry args={[w - 0.005, h - 0.005]} /> : <CircleGeometry args={[w / 2 - 0.005, 64]} />}
          {userImageUrl ? (
            <React.Suspense fallback={<MeshStandardMaterial color="white" />}>
              <TexturedMaterial url={userImageUrl} isTechnical={isTechnical} isLightOn={isLightOn} />
            </React.Suspense>
          ) : (
            <MeshStandardMaterial color="#222" emissive="#ffffff" emissiveIntensity={isLightOn ? 0.5 : 0.01} />
          )}
        </Mesh>
      )}

      {/* Arka Kapak Dış Yüzey: Çift yönlü ise görsel, değilse siyah */}
      <Mesh position={[0, 0, -d / 2]} rotation={[0, Math.PI, 0]}>
        {shape === ShapeType.RECTANGLE ? <PlaneGeometry args={[w - 0.005, h - 0.005]} /> : <CircleGeometry args={[w / 2 - 0.005, 64]} />}

        {(config.profile === ProfileType.DOUBLE && userImageUrl) ? (
          <React.Suspense fallback={<MeshStandardMaterial color="white" />}>
            <TexturedMaterial url={userImageUrl} isTechnical={isTechnical} isLightOn={isLightOn} />
          </React.Suspense>
        ) : (
          <MeshStandardMaterial color="#050505" />
        )}
      </Mesh>
    </Group>
  );
};

const WorkshopScene = () => {
  return (
    <Group position={[0, -0.01, 0]}>
      {/* Atölye Zemini */}
      <Mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <PlaneGeometry args={[100, 100]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#151515"
          metalness={0.8}
          mirror={0.1}
        />
      </Mesh>

      <DreiSpotLight
        position={[10, 20, 10]}
        angle={0.25}
        penumbra={1}
        intensity={4}
        castShadow
        color="#ffffff"
      />
    </Group>
  );
};

const Lightbox3D: React.FC<ModelProps> = ({ config, isMockupMode = false }) => {
  const maxDim = Math.max(config.width, config.height) * 0.01;
  const cameraDist = isMockupMode ? 3.0 : Math.max(2.5, maxDim * 2.5);

  return (
    <div className={`w-full h-full rounded-[2.5rem] overflow-hidden relative ${isMockupMode ? 'bg-transparent' : 'bg-gradient-to-b from-[#1a1a1e] to-[#050505]'}`}>
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          alpha: isMockupMode
        }}
      >
        <PerspectiveCamera makeDefault position={[0, maxDim / 2, cameraDist]} fov={40} />
        <OrbitControls
          enablePan={false}
          enableZoom={!isMockupMode}
          minDistance={0.5}
          maxDistance={15}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={0}
          makeDefault
        />

        <AmbientLight intensity={0.2} />
        <PointLight position={[15, 15, 15]} intensity={0.5} color="#ffffff" />
        <PointLight position={[-15, 10, -15]} intensity={0.2} color="#ffffff" />

        <React.Suspense fallback={null}>
          <LightboxModel config={config} isMockupMode={isMockupMode} />
          {!isMockupMode && <WorkshopScene />}
          <Environment preset="studio" />
          {!isMockupMode && (
            <ContactShadows
              position={[0, 0, 0]}
              opacity={0.7}
              scale={20}
              blur={1.5}
              far={4}
            />
          )}
        </React.Suspense>
      </Canvas>

      {!isMockupMode && (
        <div className="absolute top-8 left-8 flex flex-col gap-1 z-10">
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,1)]" />
            <span className="text-[9px] font-black tracking-[0.2em] text-white/70 uppercase">PRO STUDIO VIEW</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lightbox3D;
