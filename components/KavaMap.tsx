"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { kavaCountries, KavaCountry } from "@/lib/kavaData";
import { VisualMode } from "@/app/page";

interface KavaMapProps {
  onCountrySelect: (country: KavaCountry | null) => void;
  selectedCountry?: KavaCountry | null;
  visualMode: VisualMode;
}

type CountryVisual = {
  country: KavaCountry;
  hitMesh: THREE.Mesh;
  marker: THREE.Mesh;
  ring: THREE.Mesh;
  dataPoints: THREE.InstancedMesh;
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

const getColors = (mode: VisualMode) => {
  switch (mode) {
    case "nvg":
      return {
        bg: "#000800",
        earth: "#001a00",
        grid: "#003300",
        atmosphere: "#1d720b",
        marker: "#39ff14", // neon green
        glow: "#1d720b",
        dataPrimary: "#39ff14",
        dataSecondary: "#66ff66",
        bloom: { strength: 1.5, radius: 0.8, threshold: 0.2 },
      };
    case "flir":
      return {
        bg: "#0a0a0a",
        earth: "#111111",
        grid: "#220000",
        atmosphere: "#8b0000",
        marker: "#ffffff", // extreme hot
        glow: "#ff3333", // red hot
        dataPrimary: "#ffb000", // warm orange
        dataSecondary: "#ff3333", // cool red
        bloom: { strength: 2.5, radius: 1.2, threshold: 0.1 },
      };
    default: // standard tactical
      return {
        bg: "#020606",
        earth: "#051010",
        grid: "#002222",
        atmosphere: "#005555",
        marker: "#0ff", // cyan
        glow: "#00aaaa",
        dataPrimary: "#0aa",
        dataSecondary: "#055",
        bloom: { strength: 1.2, radius: 0.5, threshold: 0.3 },
      };
  }
};

export default function KavaMap({ onCountrySelect, selectedCountry, visualMode = "standard" }: KavaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const visualsRef = useRef<CountryVisual[]>([]);
  const labelsRef = useRef<{name: string, pos: THREE.Vector3}[]>([]);
  
  const [hoveredCountry, setHoveredCountry] = useState<KavaCountry | null>(null);
  const [activeLabel, setActiveLabel] = useState<{ name: string; x: number; y: number } | null>(null);
  const [targetBoxes, setTargetBoxes] = useState<{name: string, x: number, y: number}[]>([]);
  
  // RAG Intel State
  const [intelData, setIntelData] = useState<Record<string, { chemotype: string, cagr: string }>>({});
  const [intelLoading, setIntelLoading] = useState<Record<string, boolean>>({});

  const hoveredRef = useRef<KavaCountry | null>(null);
  const selectedRef = useRef<KavaCountry | null>(selectedCountry ?? null);
  const modeRef = useRef<VisualMode>(visualMode);
  const labelTickRef = useRef(0);
  
  // Scene mutable refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const earthMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const atmosMatRef = useRef<THREE.ShaderMaterial | null>(null);
  const bloomRef = useRef<UnrealBloomPass | null>(null);

  const lookup = useMemo(() => {
    const map = new Map<string, KavaCountry>();
    kavaCountries.forEach((c) => map.set(c.name, c));
    return map;
  }, []);

  useEffect(() => {
    selectedRef.current = selectedCountry ?? null;
  }, [selectedCountry]);

  // Handle RAG Fetching on Hover
  useEffect(() => {
    hoveredRef.current = hoveredCountry;

    // Fetch Intel Data when hovering over a new country
    if (hoveredCountry && !intelData[hoveredCountry.name] && !intelLoading[hoveredCountry.name]) {
       const cName = hoveredCountry.name;
       setIntelLoading(prev => ({...prev, [cName]: true}));
       
       // Trigger fetches in parallel
       Promise.all([
         fetch('/api/intel', { method: 'POST', body: JSON.stringify({ country: cName, type: 'chemotype' }) }).then(res => res.json()),
         fetch('/api/intel', { method: 'POST', body: JSON.stringify({ country: cName, type: 'cagr' }) }).then(res => res.json())
       ]).then(([chemoRes, cagrRes]) => {
         setIntelData(prev => ({
           ...prev,
           [cName]: {
             chemotype: chemoRes.data || "UNKNOWN",
             cagr: cagrRes.data || "UNKNOWN"
           }
         }));
       }).catch(err => {
         console.error("Intel fetch failed:", err);
         setIntelData(prev => ({
           ...prev,
           [cName]: { chemotype: "ERR_UPLINK", cagr: "ERR_UPLINK" }
         }));
       }).finally(() => {
         setIntelLoading(prev => ({...prev, [cName]: false}));
       });
    }

  }, [hoveredCountry]);

  // Handle visual mode switching instantly
  useEffect(() => {
    modeRef.current = visualMode;
    if (!sceneRef.current || !earthMatRef.current || !atmosMatRef.current || !bloomRef.current) return;
    
    const colors = getColors(visualMode);
    sceneRef.current.background = new THREE.Color(colors.bg);
    earthMatRef.current.emissive.set(colors.earth);
    earthMatRef.current.color.set(colors.grid); // use base color for grid lines
    atmosMatRef.current.uniforms.glowColor.value.set(colors.atmosphere);
    
    bloomRef.current.strength = colors.bloom.strength;
    bloomRef.current.radius = colors.bloom.radius;
    bloomRef.current.threshold = colors.bloom.threshold;

    // Update all markers
    visualsRef.current.forEach(v => {
      const mat = v.marker.material as THREE.MeshStandardMaterial;
      mat.color.set(colors.marker);
      mat.emissive.set(colors.marker);
      
      const ringMat = v.ring.material as THREE.MeshBasicMaterial;
      ringMat.color.set(colors.glow);
    });

  }, [visualMode]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // --- Scene ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const initialColors = getColors(visualMode);
    scene.background = new THREE.Color(initialColors.bg);

    const camera = new THREE.PerspectiveCamera(46, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.copy(latLngToVec(-12, 170, 2.5));
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    el.appendChild(renderer.domElement);

    // --- Post-processing with bloom ---
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(el.clientWidth, el.clientHeight),
      initialColors.bloom.strength,
      initialColors.bloom.radius,
      initialColors.bloom.threshold
    );
    bloomRef.current = bloomPass;
    composer.addPass(bloomPass);

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 1.2;
    controls.maxDistance = 3.4;
    controls.rotateSpeed = 0.4;

    // --- Lighting ---
    scene.add(new THREE.AmbientLight("#ffffff", 0.2));
    const key = new THREE.DirectionalLight("#ffffff", 1.0);
    key.position.set(5, 3, 5);
    scene.add(key);

    // --- Globe group ---
    const globe = new THREE.Group();
    scene.add(globe);

    // --- Earth mesh (Wireframe / Grid style) ---
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      color: initialColors.grid,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      emissive: new THREE.Color(initialColors.earth),
      emissiveIntensity: 0.8,
    });
    earthMatRef.current = earthMat;
    
    // Solid base inner sphere to hide backfaces of wireframe
    const innerEarth = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS * 0.99, 32, 32),
      new THREE.MeshBasicMaterial({ color: "#000000" })
    );
    globe.add(innerEarth);
    
    const earth = new THREE.Mesh(earthGeometry, earthMat);
    globe.add(earth);

    // --- Atmospheric edge glow ---
    const atmosMat = new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          glowColor: { value: new THREE.Color(initialColors.atmosphere) },
          intensity: { value: 0.6 },
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
          uniform float intensity;
          void main() {
            float rim = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
            gl_FragColor = vec4(glowColor, max(0.0, rim) * intensity);
          }
        `,
      });
    atmosMatRef.current = atmosMat;
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.05, 64, 64), atmosMat);
    globe.add(atmosphere);

    // --- Data Points (Replaces plants) ---
    const dataPointGeo = new THREE.BoxGeometry(0.004, 0.004, 0.02); // Small tactical pill/bar
    dataPointGeo.translate(0, 0, 0.01); // base at origin

    visualsRef.current = [];
    labelsRef.current = [];
    
    kavaCountries.forEach((country) => {
      const anchor = latLngToVec(country.lat, country.lng, 1.0);

      // Primary Tactical Marker (Target)
      const marker = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.015, 0), // Diamond shape
        new THREE.MeshStandardMaterial({
          color: initialColors.marker,
          emissive: initialColors.marker,
          emissiveIntensity: 1.0,
          wireframe: true
        })
      );
      marker.position.copy(anchor);
      marker.lookAt(new THREE.Vector3(0,0,0));
      globe.add(marker);

      // Selection Radar Ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.05, 0.002, 4, 32),
        new THREE.MeshBasicMaterial({ color: initialColors.glow, transparent: true, opacity: 0.8 })
      );
      ring.position.copy(anchor);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      ring.visible = false;
      globe.add(ring);

      // Tactical Data Points cluster (representing Nakamals/Agroforestry)
      const nPoints = Math.max(20, Math.min(150, Math.round(country.productionTonnes / 10)));
      const dataMat = new THREE.MeshBasicMaterial({
        color: initialColors.dataPrimary,
        transparent: true,
        opacity: 0.8,
      });
      const dataMesh = new THREE.InstancedMesh(dataPointGeo, dataMat, nPoints);
      dataMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      const dummy = new THREE.Object3D();
      const spreadLat = country.name.includes("Hawaii") ? 4 : country.name.includes("Papua") ? 6 : 2.5;
      const spreadLng = country.name.includes("Papua") ? 8 : country.name.includes("Hawaii") ? 4 : 2.5;

      for (let i = 0; i < nPoints; i += 1) {
        const latJitter = (Math.random() - 0.5) * spreadLat;
        const lngJitter = (Math.random() - 0.5) * spreadLng;
        const p = latLngToVec(country.lat + latJitter, country.lng + lngJitter, 1.0);
        const normal = p.clone().normalize();
        
        dummy.position.copy(p);
        dummy.lookAt(p.clone().add(normal));
        
        // Randomize height (representing data value)
        const val = 0.5 + Math.random() * 2.0;
        dummy.scale.set(1, 1, val);
        dummy.updateMatrix();
        
        // Use secondary color for some points
        if (Math.random() > 0.7) dataMesh.setColorAt(i, new THREE.Color(initialColors.dataSecondary));
        else dataMesh.setColorAt(i, new THREE.Color(initialColors.dataPrimary));
        
        dataMesh.setMatrixAt(i, dummy.matrix);
      }
      if(dataMesh.instanceColor) dataMesh.instanceColor.needsUpdate = true;
      globe.add(dataMesh);
      
      labelsRef.current.push({ name: country.name, pos: anchor.clone().multiplyScalar(1.05) });

      // Hit mesh for raycasting
      const hitMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 12),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
      );
      hitMesh.position.copy(anchor);
      hitMesh.userData.countryName = country.name;
      globe.add(hitMesh);

      visualsRef.current.push({ country, hitMesh, marker, ring, dataPoints: dataMesh });
    });

    // --- User interaction tracking ---
    let userInteracting = false;
    let lastInteractionTime = 0;
    const AUTO_ROTATE_RESUME_DELAY = 4;

    controls.addEventListener("start", () => { userInteracting = true; });
    controls.addEventListener("end", () => {
      userInteracting = false;
      lastInteractionTime = performance.now() * 0.001;
    });

    // --- Camera fly-to state ---
    let flyTo = { active: false, progress: 0, startPos: new THREE.Vector3(), targetPos: new THREE.Vector3() };
    let lastFlyName: string | null = selectedRef.current?.name ?? null;

    // --- Animation loop ---
    let raf = 0;
    const animate = () => {
      const t = performance.now() * 0.001;

      // Check for new country selection → trigger fly
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
            targetPos: dir.multiplyScalar(1.8), // zoom in close
          };
          controls.enabled = false;
        }
      } else if (!sel && lastFlyName) {
        lastFlyName = null;
        controls.enabled = true;
      }

      // Camera fly animation (fast, tactical snap)
      if (flyTo.active) {
        flyTo.progress = Math.min(1, flyTo.progress + 0.025);
        const eased = 1 - Math.pow(1 - flyTo.progress, 4); // sharp ease out
        camera.position.lerpVectors(flyTo.startPos, flyTo.targetPos, eased);
        camera.lookAt(0, 0, 0);
        if (flyTo.progress >= 1) {
          flyTo.active = false;
          controls.enabled = true;
        }
      }

      // Idle Rotation
      const idleTime = t - lastInteractionTime;
      if (!flyTo.active && !sel && !userInteracting && idleTime > AUTO_ROTATE_RESUME_DELAY) {
        const easeIn = Math.min(1, (idleTime - AUTO_ROTATE_RESUME_DELAY) / 2);
        globe.rotation.y += 0.0005 * easeIn;
      }

      // Update Visuals
      const currentActiveName = sel?.name ?? hoveredRef.current?.name ?? null;
      visualsRef.current.forEach((v, idx) => {
        const isActive = currentActiveName === v.country.name;
        const isSelected = sel?.name === v.country.name;
        
        // Spin the marker diamond
        v.marker.rotation.y = t * 2 + idx;
        v.marker.rotation.x = t + idx;
        
        const scale = isActive ? 1.5 : 1.0;
        v.marker.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);

        // Radar ring animation
        v.ring.visible = isSelected;
        if (isSelected) {
          // expand and fade out rapidly
          const cycle = (t * 1.5) % 1; 
          v.ring.scale.setScalar(1 + cycle * 4);
          (v.ring.material as THREE.MeshBasicMaterial).opacity = 1 - cycle;
        }
        
        // Data points pulsing
        if (isActive && v.dataPoints.material instanceof THREE.Material) {
           v.dataPoints.material.opacity = 0.6 + Math.sin(t*10)*0.4;
        } else if (v.dataPoints.material instanceof THREE.Material) {
           v.dataPoints.material.opacity = 0.4;
        }
      });

      // Update Target Boxes (Labels)
      if (t - labelTickRef.current > 0.03) {
        globe.updateMatrixWorld();
        const boxes: typeof targetBoxes = [];
        
        labelsRef.current.forEach(label => {
            const worldP = label.pos.clone().applyMatrix4(globe.matrixWorld);
            // Check if behind globe based on camera dot product
            const toCam = camera.position.clone().normalize();
            const dot = worldP.clone().normalize().dot(toCam);
            
            if (dot > 0.2) { // Only show if facing camera
               worldP.project(camera);
               boxes.push({
                   name: label.name,
                   x: ((worldP.x + 1) / 2) * el.clientWidth,
                   y: ((-worldP.y + 1) / 2) * el.clientHeight,
               });
            }
        });
        
        setTargetBoxes(boxes);
        
        // Active hover text
        if (currentActiveName && cameraRef.current) {
          const active = boxes.find(b => b.name === currentActiveName);
          if (active) setActiveLabel({...active, y: active.y - 30});
          else setActiveLabel(null);
        } else {
          setActiveLabel(null);
        }
        
        labelTickRef.current = t;
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

    // --- Interaction ---
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
      el.style.cursor = name ? "crosshair" : "crosshair"; // Always crosshair
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

  // Derived style vars for floating UI
  const isFlir = visualMode === "flir";
  const pColor = isFlir ? "text-tactical-amber" : "text-tactical-green";
  const bColor = isFlir ? "border-tactical-amber/50" : "border-tactical-green/50";
  const bgColor = isFlir ? "bg-[#3a0000]/80" : "bg-[#001500]/80";

  return (
    <div className="relative w-full h-full cursor-crosshair">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Background static grid lines just for flavor */}
      <div className="absolute inset-0 pointer-events-none opacity-10" 
           style={{ backgroundImage: `linear-gradient(${isFlir ? '#ff0000' : '#39ff14'} 1px, transparent 1px), linear-gradient(90deg, ${isFlir ? '#ff0000' : '#39ff14'} 1px, transparent 1px)`, backgroundSize: '40px 40px'}}>
      </div>

      {/* Passive Target Boxes (Background Labels) */}
      {targetBoxes.map((b, idx) => (
         <div key={b.name + idx} className={`absolute z-10 pointer-events-none text-[8px] font-mono tracking-widest uppercase opacity-40 transition-opacity ${b.name === selectedCountry?.name || b.name === hoveredCountry?.name ? 'opacity-0' : ''}`}
              style={{ left: `${b.x}px`, top: `${b.y}px`, transform: "translate(10px, -10px)" }}>
             [{b.name.substring(0,3)}]
         </div>
      ))}

      {/* Active Hover Label / Target Data */}
      {activeLabel && (
        <div
          className="absolute z-30 pointer-events-none animate-fade-in"
          style={{
            left: `${activeLabel.x}px`,
            top: `${activeLabel.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className={`${bgColor} ${bColor} border p-2 backdrop-blur shadow-[0_0_15px_rgba(0,0,0,0.8)] crt-scanlines`}>
             <div className="flex justify-between items-center mb-1 pb-1 border-b border-white/20">
               <span className={`${pColor} text-[10px] font-bold font-mono uppercase tracking-widest`}>TARGET LOCK</span>
               <span className={`${pColor} text-[8px] animate-pulse`}>REC</span>
             </div>
             <div className="text-white text-xs font-mono font-bold uppercase mb-1">{activeLabel.name}</div>
             
             {/* RAG Fetched Data */}
             <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] font-mono text-gray-400 mt-2 min-w-[140px]">
                <span>CHEMOTYPE</span>
                <span className={pColor}>
                    {intelLoading[activeLabel.name] ? <span className="animate-pulse">DECRYPTING...</span> : intelData[activeLabel.name]?.chemotype || "PENDING"}
                </span>
                <span>CAGR (5Y)</span>
                <span className={pColor}>
                    {intelLoading[activeLabel.name] ? <span className="animate-pulse">DECRYPTING...</span> : intelData[activeLabel.name]?.cagr || "PENDING"}
                </span>
                <span>STATUS</span>
                <span className={isFlir ? "text-tactical-red" : "text-tactical-cyan"}>ACTIVE</span>
             </div>
          </div>
          
          {/* Tactical crosshair lines to center */}
          <div className={`absolute bottom-0 left-1/2 w-px h-4 ${isFlir ? 'bg-tactical-amber' : 'bg-tactical-green'} opacity-50`}></div>
        </div>
      )}
      
      {/* Viewport Crosshair Center */}
      <div className={`absolute top-1/2 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 border border-dashed rounded-full pointer-events-none opacity-20 ${bColor}`}></div>
      <div className={`absolute top-1/2 left-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none opacity-40 ${isFlir ? "bg-tactical-amber" : "bg-tactical-green"}`}></div>
    </div>
  );
}
