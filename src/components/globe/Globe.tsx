"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { latLonToVector3, DEFAULT_TIME_ZONES, resolveTimeZoneCities } from "@/lib/geo";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Language } from "@/lib/i18n/dictionaries";

const RADIUS = 1.8;

function RotatingGlobe({
  notificationCount,
  lang,
  timeZoneIds,
}: {
  notificationCount: number;
  lang: Language;
  timeZoneIds: string[];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [now, setNow] = useState(() => new Date());
  const cities = resolveTimeZoneCities(timeZoneIds);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Always rotating — this is a passive "alive" ambient animation, independent of OrbitControls' drag-to-look.
      groupRef.current.rotation.y += delta * 0.11;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Wireframe sphere shell */}
      <mesh>
        <icosahedronGeometry args={[RADIUS, 3]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.35} />
      </mesh>

      {/* Inner glowing core */}
      <mesh>
        <sphereGeometry args={[RADIUS * 0.96, 32, 32]} />
        <meshBasicMaterial color="#0891b2" transparent opacity={0.08} />
      </mesh>

      {/* Latitude rings */}
      {[-40, -20, 0, 20, 40].map((lat) => {
        const r = RADIUS * Math.cos((lat * Math.PI) / 180);
        const y = RADIUS * Math.sin((lat * Math.PI) / 180);
        return (
          <mesh key={lat} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r - 0.004, r + 0.004, 64]} />
            <meshBasicMaterial color="#67e8f9" transparent opacity={0.25} side={THREE.DoubleSide} />
          </mesh>
        );
      })}

      {/* Time zone city markers */}
      {cities.map((city) => {
        const pos = latLonToVector3(city.lat, city.lon, RADIUS * 1.02);
        const time = new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: city.timeZone,
        }).format(now);
        return (
          <group key={city.timeZone} position={pos}>
            <mesh>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color="#22d3ee" />
            </mesh>
            <Html distanceFactor={8} occlude={false} className="pointer-events-none select-none">
              <div className="whitespace-nowrap rounded bg-zinc-950/80 px-1.5 py-0.5 text-[10px] text-cyan-300 shadow">
                {city.name[lang]} · {time}
              </div>
            </Html>
          </group>
        );
      })}

      {/* Pulsing notification marker (top of globe) */}
      {notificationCount > 0 && (
        <group position={latLonToVector3(60, 90, RADIUS * 1.02)}>
          <mesh>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#f97316" />
          </mesh>
          <Html distanceFactor={8} occlude={false} className="pointer-events-none select-none">
            <div className="relative">
              <div className="pulse-ring absolute -inset-2 rounded-full border border-orange-400" />
              <div className="rounded bg-orange-500/90 px-1.5 py-0.5 text-[10px] font-medium text-zinc-950 shadow">
                {notificationCount}
              </div>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

export function Globe({
  notificationCount = 0,
  timeZoneIds = DEFAULT_TIME_ZONES,
}: {
  notificationCount?: number;
  timeZoneIds?: string[];
}) {
  const { lang } = useLanguage();
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} className="!touch-none">
      <ambientLight intensity={1} />
      <RotatingGlobe notificationCount={notificationCount} lang={lang} timeZoneIds={timeZoneIds} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={(2 * Math.PI) / 3}
      />
    </Canvas>
  );
}
