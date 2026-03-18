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
const EARTH_TEXTURE_URL = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";

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
  const ctx = canvas.getContext("2d")!;
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, 256, 256);

  // Stem
  ctx.strokeStyle = "rgba(60, 160, 100, 0.9)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(128, 240);
  ctx.lineTo(128, 100);
  ctx.stroke();

  // Radial glow base
  const grad = ctx.createRadialGradient(128, 110, 15, 128, 110, 105);
  grad.addColorStop(0, "rgba(122, 245, 196, 1)");
  grad.addColorStop(0.6, "rgba(60, 200, 140, 0.6)");
  grad.addColorStop(1, "rgba(24, 115, 82, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(128, 110, 100, 0, Math.PI * 2);
  ctx.fill();

  // Leaf petals
  ctx.save();
  ctx.translate(128, 110);
  for (let i = 0; i < 7; i += 1) {
    ctx.rotate((Math.PI * 2) / 7);
    ctx.fillStyle = i % 2 ? "rgba(111, 255, 190, 0.95)" : "rgba(46, 197, 132, 0.95)";
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.quadraticCurveTo(16, -80, 0, -110);
    ctx.quadraticCurveTo(-16, -80, 0, -10);
    ctx.fill();
    // Leaf vein
    ctx.strokeStyle = "rgba(30, 120, 80, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(0, -95);
    ctx.stroke();
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function makeCoralTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
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

    // --- Scene ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#060d1a");

    const camera = new THREE.PerspectiveCamera(46, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.copy(latLngToVec(-12, 170, 2.5));
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    el.appendChild(renderer.domElement);

    // --- Post-processing with bloom ---
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(el.clientWidth, el.clientHeight),
      1.2,   // strength (increased)
      0.4,   // radius
      0.85   // threshold
    );
    composer.addPass(bloomPass);

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 1.35;
    controls.maxDistance = 3.4;
    controls.rotateSpeed = 0.5;

    // --- Lighting ---
    scene.add(new THREE.AmbientLight("#87d7ff", 0.55));
    const key = new THREE.DirectionalLight("#b5f6ff", 1.2);
    key.position.set(4, 1.3, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight("#1a6b5a", 0.4);
    rim.position.set(-3, -1, -2);
    scene.add(rim);

    // --- Globe group ---
    const globe = new THREE.Group();
    scene.add(globe);

    // --- Earth mesh with NASA Blue Marble ---
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(EARTH_TEXTURE_URL);
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS, 128, 128),
      new THREE.MeshStandardMaterial({
        map: earthTexture,
        roughness: 0.9,
        metalness: 0.05,
        emissive: new THREE.Color("#061520"),
        emissiveIntensity: 0.25,
      })
    );
    globe.add(earth);

    // --- Atmospheric edge glow (deep teal, additive) ---
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.08, 64, 64),
      new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          glowColor: { value: new THREE.Color("#0d6b6e") },
          intensity: { value: 0.55 },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          uniform vec3 glowColor;
          uniform float intensity;
          void main() {
            float rim = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
            gl_FragColor = vec4(glowColor, max(0.0, rim) * intensity);
          }
        `,
      })
    );
    globe.add(atmosphere);

    // Second outer glow layer
    const outerGlow = new THREE.Mesh(
      new THREE.SphereGeometry(1.15, 48, 48),
      new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          glowColor: { value: new THREE.Color("#0a4f4f") },
        },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          uniform vec3 glowColor;
          void main() {
            float rim = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
            gl_FragColor = vec4(glowColor, max(0.0, rim) * 0.25);
          }
        `,
      })
    );
    globe.add(outerGlow);

    // --- Stars ---
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const r = 12 + Math.random() * 25;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = r * Math.sin(p) * Math.cos(t);
      starPositions[i * 3 + 1] = r * Math.cos(p);
      starPositions[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
      // Slight color variation
      const brightness = 0.5 + Math.random() * 0.5;
      starColors[i * 3] = 0.6 * brightness;
      starColors[i * 3 + 1] = 0.85 * brightness;
      starColors[i * 3 + 2] = 0.95 * brightness;
    }
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starsGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    scene.add(
      new THREE.Points(
        starsGeo,
        new THREE.PointsMaterial({
          size: 0.03,
          transparent: true,
          opacity: 0.7,
          vertexColors: true,
          sizeAttenuation: true,
        })
      )
    );

    // --- Plant sprites ---
    const leafTex = makeLeafTexture();
    const coralTex = makeCoralTexture();
    const plantGeo = new THREE.PlaneGeometry(1, 1.4);
    // Shift geometry up so base is at origin (plants grow upward from surface)
    plantGeo.translate(0, 0.7, 0);

    visualsRef.current = [];
    kavaCountries.forEach((country) => {
      const anchor = latLngToVec(country.lat, country.lng, 1.025);

      // Country marker (glowing sphere)
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 16, 16),
        new THREE.MeshStandardMaterial({
          color: "#8cf3cd",
          emissive: "#5de9c0",
          emissiveIntensity: 0.6,
        })
      );
      marker.position.copy(anchor);
      globe.add(marker);

      // Selection ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.065, 0.005, 8, 32),
        new THREE.MeshBasicMaterial({ color: "#54f0d5", transparent: true, opacity: 0.6 })
      );
      ring.position.copy(anchor);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      ring.visible = false;
      globe.add(ring);

      // Increased plant density — more sprites in producing regions
      const nPlants = Math.max(60, Math.min(400, Math.round(country.productionTonnes / 5)));
      const plantMat = new THREE.MeshBasicMaterial({
        map: leafTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.92,
        side: THREE.DoubleSide,
      });
      const plantMesh = new THREE.InstancedMesh(plantGeo, plantMat, nPlants);
      plantMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      const bases: CountryVisual["plantBases"] = [];
      const dummy = new THREE.Object3D();
      const spreadLat = country.name.includes("Hawaii") ? 4.5 : country.name.includes("Papua") ? 6 : 3.5;
      const spreadLng = country.name.includes("Papua") ? 9 : country.name.includes("Hawaii") ? 5 : 4.5;

      for (let i = 0; i < nPlants; i += 1) {
        const latJitter = (Math.random() - 0.5) * spreadLat;
        const lngJitter = (Math.random() - 0.5) * spreadLng;
        const surfaceR = 1.005 + Math.random() * 0.015;
        const p = latLngToVec(country.lat + latJitter, country.lng + lngJitter, surfaceR);
        const normal = p.clone().normalize();
        const scale = 0.022 + Math.random() * 0.032;
        bases.push({ pos: p, normal, scale, phase: Math.random() * Math.PI * 2 });
        dummy.position.copy(p);
        dummy.lookAt(p.clone().add(normal));
        dummy.scale.set(scale, scale * 1.2, 1);
        dummy.updateMatrix();
        plantMesh.setMatrixAt(i, dummy.matrix);
      }
      globe.add(plantMesh);

      // Hit mesh for raycasting
      const hitMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 12, 12),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
      );
      hitMesh.position.copy(anchor);
      hitMesh.userData.countryName = country.name;
      globe.add(hitMesh);

      visualsRef.current.push({ country, hitMesh, marker, ring, plantMesh, plantBases: bases });
    });

    // --- Ocean coral decoration ---
    const coralMat = new THREE.MeshBasicMaterial({
      map: coralTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const coralMesh = new THREE.InstancedMesh(plantGeo, coralMat, 160);
    const coralDummy = new THREE.Object3D();
    const coralCenters = [
      { lat: -17.7, lng: 178 },
      { lat: -15.3, lng: 166.9 },
      { lat: -13.9, lng: -171.8 },
      { lat: -21.1, lng: -175.2 },
    ];
    for (let i = 0; i < 160; i += 1) {
      const c = coralCenters[i % coralCenters.length];
      const p = latLngToVec(
        c.lat + (Math.random() - 0.5) * 8,
        c.lng + (Math.random() - 0.5) * 9,
        1.005 + Math.random() * 0.01
      );
      coralDummy.position.copy(p);
      coralDummy.lookAt(p.clone().add(p.clone().normalize()));
      const s = 0.016 + Math.random() * 0.018;
      coralDummy.scale.set(s, s * 1.1, 1);
      coralDummy.updateMatrix();
      coralMesh.setMatrixAt(i, coralDummy.matrix);
    }
    globe.add(coralMesh);

    // --- User interaction tracking (pause auto-rotate while user controls globe) ---
    let userInteracting = false;
    let lastInteractionTime = 0;
    const AUTO_ROTATE_RESUME_DELAY = 3; // seconds of idle before auto-rotate resumes

    controls.addEventListener("start", () => {
      userInteracting = true;
    });
    controls.addEventListener("end", () => {
      userInteracting = false;
      lastInteractionTime = performance.now() * 0.001;
    });

    // --- Camera fly-to state ---
    let flyTo = {
      active: false,
      progress: 0,
      startPos: new THREE.Vector3(),
      targetPos: new THREE.Vector3(),
    };
    let lastFlyName: string | null = selectedRef.current?.name ?? null;

    // Reusable objects for billboard computation
    const _invMat = new THREE.Matrix4();
    const _localCamPos = new THREE.Vector3();
    const _up = new THREE.Vector3();
    const _toCamera = new THREE.Vector3();
    const _right = new THREE.Vector3();
    const _forward = new THREE.Vector3();
    const _rotMat = new THREE.Matrix4();
    const _dummy = new THREE.Object3D();

    // --- Animation loop ---
    let raf = 0;
    const animate = () => {
      const t = performance.now() * 0.001;

      // --- Check for new country selection → trigger camera fly-to ---
      const sel = selectedRef.current;
      if (sel && sel.name !== lastFlyName) {
        lastFlyName = sel.name;
        const vis = visualsRef.current.find((v) => v.country.name === sel.name);
        if (vis) {
          globe.updateMatrixWorld();
          const worldPos = new THREE.Vector3();
          vis.marker.getWorldPosition(worldPos);
          const dir = worldPos.clone().normalize();
          flyTo = {
            active: true,
            progress: 0,
            startPos: camera.position.clone(),
            targetPos: dir.multiplyScalar(2.0),
          };
          controls.enabled = false;
        }
      } else if (!sel && lastFlyName) {
        lastFlyName = null;
        controls.enabled = true;
      }

      // --- Camera fly-to animation ---
      if (flyTo.active) {
        flyTo.progress = Math.min(1, flyTo.progress + 0.016);
        const eased = 1 - Math.pow(1 - flyTo.progress, 3); // ease-out cubic
        camera.position.lerpVectors(flyTo.startPos, flyTo.targetPos, eased);
        camera.lookAt(0, 0, 0);
        if (flyTo.progress >= 1) {
          flyTo.active = false;
          controls.enabled = true;
        }
      }

      // --- Smooth auto-rotation (only when idle + user not interacting) ---
      const idleTime = t - lastInteractionTime;
      if (!flyTo.active && !sel && !userInteracting && idleTime > AUTO_ROTATE_RESUME_DELAY) {
        // Ease back into rotation smoothly
        const easeIn = Math.min(1, (idleTime - AUTO_ROTATE_RESUME_DELAY) / 2);
        globe.rotation.y += 0.0006 * easeIn;
      }

      // --- Compute camera position in globe local space (for billboard) ---
      globe.updateMatrixWorld();
      _invMat.copy(globe.matrixWorld).invert();
      _localCamPos.copy(camera.position).applyMatrix4(_invMat);

      // --- Update country visuals ---
      visualsRef.current.forEach((v, idx) => {
        const currentActiveName = sel?.name ?? hoveredRef.current?.name ?? null;
        const isActive = currentActiveName === v.country.name;
        const isSelected = sel?.name === v.country.name;
        const isHover = hoveredRef.current?.name === v.country.name;
        const mat = v.marker.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = isSelected ? 1.4 : isHover ? 1.0 : 0.6;
        mat.color.set(isSelected ? "#a7ffe0" : isHover ? "#7ef4cc" : "#8cf3cd");

        // Ring pulse on selection
        v.ring.visible = isSelected;
        if (isSelected) {
          const pulse = 1 + Math.sin(t * 2.5 + idx) * 0.22;
          v.ring.scale.setScalar(pulse);
          (v.ring.material as THREE.MeshBasicMaterial).opacity =
            0.45 + Math.sin(t * 3.2 + idx) * 0.2;
        }

        // --- Update plant instances (billboard + animation) ---
        for (let i = 0; i < v.plantBases.length; i += 1) {
          const b = v.plantBases[i];

          // Sway animation when selected
          const sway = isActive ? Math.sin(t * 1.8 + b.phase) * 0.012 : 0;
          const bob = isActive ? Math.sin(t * 2.8 + b.phase) * 0.004 : 0;

          // Position with animation offset
          _dummy.position.copy(b.pos);
          _dummy.position.addScaledVector(new THREE.Vector3(0, 1, 0), sway);
          _dummy.position.addScaledVector(b.normal, bob);

          // Constrained billboard: up = surface normal, face camera
          _up.copy(b.normal);
          _toCamera.subVectors(_localCamPos, _dummy.position);
          _right.crossVectors(_up, _toCamera).normalize();
          if (_right.lengthSq() < 0.001) {
            // Degenerate case: camera directly above, pick arbitrary right
            _right.set(1, 0, 0);
          }
          _forward.crossVectors(_right, _up).normalize();
          _rotMat.makeBasis(_right, _up, _forward);
          _dummy.rotation.setFromRotationMatrix(_rotMat);

          // Additional sway rotation when active
          if (isActive) {
            _dummy.rotateZ(Math.sin(t * 1.5 + b.phase) * 0.12);
          }

          _dummy.scale.set(b.scale, b.scale * 1.2, 1);
          _dummy.updateMatrix();
          v.plantMesh.setMatrixAt(i, _dummy.matrix);
        }
        v.plantMesh.instanceMatrix.needsUpdate = true;
      });

      // --- Floating label ---
      const currentActiveName = sel?.name ?? hoveredRef.current?.name ?? null;
      if (currentActiveName && cameraRef.current) {
        const active = visualsRef.current.find((v) => v.country.name === currentActiveName);
        if (active && t - labelTickRef.current > 0.06) {
          globe.updateMatrixWorld();
          const worldP = new THREE.Vector3();
          active.marker.getWorldPosition(worldP);
          worldP.project(cameraRef.current);
          setActiveLabel({
            name: active.country.name,
            x: ((worldP.x + 1) / 2) * el.clientWidth,
            y: ((-worldP.y + 1) / 2) * el.clientHeight - 28,
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

    // --- Resize handler ---
    const onResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // --- Pointer helpers ---
    const pointerToNdc = (ev: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pointerRef.current.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onMove = (ev: PointerEvent) => {
      if (!cameraRef.current) return;
      pointerToNdc(ev);
      raycasterRef.current.setFromCamera(pointerRef.current, cameraRef.current);
      const hits = raycasterRef.current.intersectObjects(
        visualsRef.current.map((v) => v.hitMesh),
        false
      );
      const name = hits[0]?.object.userData.countryName as string | undefined;
      setHoveredCountry(name ? lookup.get(name) ?? null : null);
      el.style.cursor = name ? "pointer" : "grab";
    };

    const onClick = (ev: PointerEvent) => {
      if (!cameraRef.current) return;
      pointerToNdc(ev);
      raycasterRef.current.setFromCamera(pointerRef.current, cameraRef.current);
      const hits = raycasterRef.current.intersectObjects(
        visualsRef.current.map((v) => v.hitMesh),
        false
      );
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

      {activeLabel && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            left: `${activeLabel.x}px`,
            top: `${activeLabel.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="px-3 py-1.5 rounded-lg bg-teal-950/90 border border-teal-500/50 text-teal-200 text-xs font-semibold whitespace-nowrap backdrop-blur shadow-lg shadow-teal-900/30">
            {activeLabel.name}
          </div>
        </div>
      )}
    </div>
  );
}
