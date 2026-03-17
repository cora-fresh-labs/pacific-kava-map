"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { kavaCountries, KavaCountry } from "@/lib/kavaData";

interface KavaMapProps {
  onCountrySelect: (country: KavaCountry | null) => void;
  selectedCountry?: KavaCountry | null;
}

type CountryVisual = {
  country: KavaCountry;
  hitMesh: THREE.Mesh;
  marker: THREE.Mesh;
  ring: THREE.Mesh;
  plantMesh: THREE.InstancedMesh;
  plantBases: { pos: THREE.Vector3; normal: THREE.Vector3; scale: number; phase: number }[];
};

const EARTH_RADIUS = 1;

function latLngToVec(lat: number, lng: number, radius = EARTH_RADIUS): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lng + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function makeLeafTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, 256, 256);
  const grad = ctx.createRadialGradient(128, 150, 20, 128, 130, 120);
  grad.addColorStop(0, "rgba(122, 245, 196, 1)");
  grad.addColorStop(1, "rgba(24, 115, 82, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(128, 130, 110, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(128, 140);
  for (let i = 0; i < 7; i += 1) {
    ctx.rotate((Math.PI * 2) / 7);
    ctx.fillStyle = i % 2 ? "rgba(111, 255, 190, 0.95)" : "rgba(46, 197, 132, 0.95)";
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.quadraticCurveTo(14, -88, 0, -125);
    ctx.quadraticCurveTo(-14, -88, 0, -12);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function makeCoralTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, 128, 128);
  ctx.strokeStyle = "rgba(126, 221, 255, 0.9)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(64, 100);
  ctx.lineTo(64, 38);
  ctx.moveTo(64, 70);
  ctx.lineTo(42, 52);
  ctx.moveTo(64, 64);
  ctx.lineTo(86, 48);
  ctx.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export default function KavaMap({ onCountrySelect, selectedCountry }: KavaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const visualsRef = useRef<CountryVisual[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<KavaCountry | null>(null);
  const [activeLabel, setActiveLabel] = useState<{ name: string; x: number; y: number } | null>(null);
  const hoveredRef = useRef<KavaCountry | null>(null);
  const selectedRef = useRef<KavaCountry | null>(selectedCountry ?? null);
  const labelTickRef = useRef(0);

  const lookup = useMemo(() => {
    const map = new Map<string, KavaCountry>();
    kavaCountries.forEach((c) => map.set(c.name, c));
    return map;
  }, []);

  useEffect(() => {
    selectedRef.current = selectedCountry ?? null;
  }, [selectedCountry]);

  useEffect(() => {
    hoveredRef.current = hoveredCountry;
  }, [hoveredCountry]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a1628");

    const camera = new THREE.PerspectiveCamera(46, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.copy(latLngToVec(-12, 170, 2.35));
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(el.clientWidth, el.clientHeight), 0.85, 0.35, 0.92));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 1.35;
    controls.maxDistance = 3.4;

    scene.add(new THREE.AmbientLight("#87d7ff", 0.64));
    const key = new THREE.DirectionalLight("#b5f6ff", 1.15);
    key.position.set(4, 1.3, 3);
    scene.add(key);

    const globe = new THREE.Group();
    scene.add(globe);

    const texture = new THREE.TextureLoader().load("/textures/earth.jpg");
    texture.colorSpace = THREE.SRGBColorSpace;

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS, 96, 96),
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 1,
        metalness: 0,
        color: new THREE.Color("#8fb0be"),
        emissive: new THREE.Color("#04111f"),
        emissiveIntensity: 0.3,
      })
    );
    globe.add(earth);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.055, 64, 64),
      new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        uniforms: { glowColor: { value: new THREE.Color("#3bd7d2") } },
        vertexShader: `varying vec3 n; void main(){ n = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `varying vec3 n; uniform vec3 glowColor; void main(){ float i = pow(0.7 - dot(n, vec3(0.0,0.0,1.0)), 2.2); gl_FragColor = vec4(glowColor, max(0.0, i) * 0.4); }`,
      })
    );
    globe.add(atmosphere);

    const starsGeo = new THREE.BufferGeometry();
    const count = 1400;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const r = 10 + Math.random() * 20;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(p) * Math.cos(t);
      arr[i * 3 + 1] = r * Math.cos(p);
      arr[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
    }
    starsGeo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    scene.add(new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: "#4ccdd8", size: 0.028, transparent: true, opacity: 0.65 })));

    const leafTex = makeLeafTexture();
    const coralTex = makeCoralTexture();
    const plantGeo = new THREE.PlaneGeometry(1, 1.25);

    visualsRef.current = [];
    kavaCountries.forEach((country) => {
      const anchor = latLngToVec(country.lat, country.lng, 1.03);

      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.017, 16, 16),
        new THREE.MeshStandardMaterial({ color: "#8cf3cd", emissive: "#5de9c0", emissiveIntensity: 0.5 })
      );
      marker.position.copy(anchor);
      globe.add(marker);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.06, 0.0045, 8, 28),
        new THREE.MeshBasicMaterial({ color: "#54f0d5", transparent: true, opacity: 0.58 })
      );
      ring.position.copy(anchor);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      ring.visible = false;
      globe.add(ring);

      const nPlants = Math.max(40, Math.min(220, Math.round(country.productionTonnes / 12)));
      const plantMat = new THREE.MeshBasicMaterial({ map: leafTex, transparent: true, depthWrite: false, opacity: 0.95 });
      const plantMesh = new THREE.InstancedMesh(plantGeo, plantMat, nPlants);
      plantMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      const bases: CountryVisual["plantBases"] = [];
      const dummy = new THREE.Object3D();
      for (let i = 0; i < nPlants; i += 1) {
        const latJitter = (Math.random() - 0.5) * (country.name.includes("Hawaii") ? 5 : 3.2);
        const lngJitter = (Math.random() - 0.5) * (country.name.includes("Papua") ? 8 : 4.2);
        const p = latLngToVec(country.lat + latJitter, country.lng + lngJitter, 1.01 + Math.random() * 0.03);
        const normal = p.clone().normalize();
        const scale = 0.024 + Math.random() * 0.03;
        bases.push({ pos: p, normal, scale, phase: Math.random() * Math.PI * 2 });
        dummy.position.copy(p);
        dummy.lookAt(p.clone().add(normal));
        dummy.scale.set(scale, scale * 1.4, 1);
        dummy.updateMatrix();
        plantMesh.setMatrixAt(i, dummy.matrix);
      }
      globe.add(plantMesh);

      const hitMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 12, 12),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
      );
      hitMesh.position.copy(anchor);
      hitMesh.userData.countryName = country.name;
      globe.add(hitMesh);

      visualsRef.current.push({ country, hitMesh, marker, ring, plantMesh, plantBases: bases });
    });

    const coralMat = new THREE.MeshBasicMaterial({ map: coralTex, transparent: true, depthWrite: false, opacity: 0.5 });
    const coralMesh = new THREE.InstancedMesh(plantGeo, coralMat, 180);
    const coralDummy = new THREE.Object3D();
    const coralCenters = [
      { lat: -17.7, lng: 178 },
      { lat: -15.3, lng: 166.9 },
      { lat: -13.9, lng: -171.8 },
      { lat: -21.1, lng: -175.2 },
    ];
    for (let i = 0; i < 180; i += 1) {
      const c = coralCenters[i % coralCenters.length];
      const p = latLngToVec(c.lat + (Math.random() - 0.5) * 8, c.lng + (Math.random() - 0.5) * 9, 1.008 + Math.random() * 0.012);
      coralDummy.position.copy(p);
      coralDummy.lookAt(p.clone().add(p.clone().normalize()));
      const s = 0.018 + Math.random() * 0.02;
      coralDummy.scale.set(s, s * 1.2, 1);
      coralDummy.updateMatrix();
      coralMesh.setMatrixAt(i, coralDummy.matrix);
    }
    globe.add(coralMesh);

    let raf = 0;
    const dummy = new THREE.Object3D();
    const animate = () => {
      const t = performance.now() * 0.001;
      globe.rotation.y += 0.0008;

      visualsRef.current.forEach((v, idx) => {
        const currentActiveName = selectedRef.current?.name ?? hoveredRef.current?.name ?? null;
        const isActive = currentActiveName === v.country.name;
        const isHover = hoveredRef.current?.name === v.country.name;
        const mat = v.marker.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = isActive ? 1.2 : isHover ? 0.95 : 0.5;
        mat.color.set(isActive ? "#a7ffe0" : isHover ? "#7ef4cc" : "#8cf3cd");

        v.ring.visible = isActive;
        if (isActive) {
          const pulse = 1 + Math.sin(t * 2.5 + idx) * 0.2;
          v.ring.scale.setScalar(pulse);
          (v.ring.material as THREE.MeshBasicMaterial).opacity = 0.45 + Math.sin(t * 3.2 + idx) * 0.2;
        }

        for (let i = 0; i < v.plantBases.length; i += 1) {
          const b = v.plantBases[i];
          const sway = isActive ? Math.sin(t * 2.1 + b.phase) * 0.01 : 0;
          const bob = isActive ? Math.sin(t * 3.1 + b.phase) * 0.003 : 0;
          const pos = b.pos.clone().addScaledVector(new THREE.Vector3(0, 1, 0), sway).addScaledVector(b.normal, bob);
          dummy.position.copy(pos);
          dummy.lookAt(pos.clone().add(b.normal));
          dummy.rotateZ(isActive ? Math.sin(t * 2 + b.phase) * 0.15 : 0);
          dummy.scale.set(b.scale, b.scale * 1.4, 1);
          dummy.updateMatrix();
          v.plantMesh.setMatrixAt(i, dummy.matrix);
        }
        v.plantMesh.instanceMatrix.needsUpdate = true;
      });

      const currentActiveName = selectedRef.current?.name ?? hoveredRef.current?.name ?? null;
      if (currentActiveName && cameraRef.current) {
        const active = visualsRef.current.find((v) => v.country.name === currentActiveName);
        if (active && t - labelTickRef.current > 0.08) {
          const p = active.marker.position.clone().project(cameraRef.current);
          setActiveLabel({
            name: active.country.name,
            x: ((p.x + 1) / 2) * el.clientWidth,
            y: ((-p.y + 1) / 2) * el.clientHeight - 24,
          });
          labelTickRef.current = t;
        }
      } else {
        setActiveLabel(null);
      }

      controls.update();
      composer.render();
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    const onResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const pointerToNdc = (ev: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pointerRef.current.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onMove = (ev: PointerEvent) => {
      if (!cameraRef.current) return;
      pointerToNdc(ev);
      raycasterRef.current.setFromCamera(pointerRef.current, cameraRef.current);
      const hits = raycasterRef.current.intersectObjects(visualsRef.current.map((v) => v.hitMesh), false);
      const name = hits[0]?.object.userData.countryName as string | undefined;
      setHoveredCountry(name ? lookup.get(name) ?? null : null);
    };

    const onClick = (ev: PointerEvent) => {
      if (!cameraRef.current) return;
      pointerToNdc(ev);
      raycasterRef.current.setFromCamera(pointerRef.current, cameraRef.current);
      const hits = raycasterRef.current.intersectObjects(visualsRef.current.map((v) => v.hitMesh), false);
      if (hits.length > 0) {
        const name = hits[0].object.userData.countryName as string;
        onCountrySelect(lookup.get(name) ?? null);
        return;
      }
      onCountrySelect(null);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onClick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onClick);
      controls.dispose();
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
    };
  }, [lookup, onCountrySelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {!selectedCountry && (
        <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur border border-teal-900 rounded-lg px-3 py-2 z-20 text-xs text-slate-300 pointer-events-none">
          Hover or click a kava region
        </div>
      )}

      <div className="absolute bottom-8 right-4 bg-slate-900/90 backdrop-blur border border-teal-900 rounded-lg p-3 z-20 text-xs">
        <div className="text-teal-300 font-semibold mb-2">Pacific Kava Biome</div>
        <div className="text-slate-300 mb-1">Dense fan-leaf sprites = production core</div>
        <div className="text-slate-400">Hover glow, click for country profile</div>
      </div>

      {activeLabel && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{ left: `${activeLabel.x}px`, top: `${activeLabel.y}px`, transform: "translate(-50%, -100%)" }}
        >
          <div className="px-2 py-1 rounded bg-teal-950/80 border border-teal-500/40 text-teal-200 text-xs font-medium whitespace-nowrap">
            {activeLabel.name}
          </div>
        </div>
      )}
    </div>
  );
}
