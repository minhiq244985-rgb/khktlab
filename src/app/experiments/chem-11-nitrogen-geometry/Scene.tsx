"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";
function Sim({ p1, p2, paused }: { p1: number;
 p2: number;
 paused: boolean }) { const ref = useRef<THREE.Group>(null);
 const tRef = useRef(0);
 const items = useMemo(() => Array.from({ length: 28 }, (_, i) => i), []);
 const mode: string = "molecule";
 useFrame((_, d) => { if (paused || !ref.current) return;
 tRef.current += d;
 const t = tRef.current;
 if (mode === "orbit") ref.current.rotation.y += d * p1 * 0.7;
 else if (mode === "helix" || mode === "molecule" || mode === "nuclear") ref.current.rotation.y += d * (0.4 + p2 * 0.25);
 else if (mode === "heart") { const b = 1 + Math.pow(Math.sin(t * (p1 / 60) * Math.PI), 4) * 0.22;
 ref.current.scale.set(b, b, b);
 } else if (mode === "lever") ref.current.rotation.z = THREE.MathUtils.clamp((p1 * p2 - 120) * 0.002, -0.45, 0.45);
 else if (mode === "incline") { const r = (p1 * Math.PI) / 180;
 const sl = ((t * (1 + Math.sin(r) * 3)) % 3.2) - 1.6;
 ref.current.position.set(sl * Math.cos(r), -sl * Math.sin(r) + 0.3, 0);
 ref.current.rotation.z = -r;
 } else if (mode === "emwave" || mode === "barton") ref.current.children.forEach((c, i) => { c.position.y = Math.sin(t * p1 * 1.4 - i * 0.35) * (p2 * 0.65);
 });
 else ref.current.children.forEach((c, i) => { const sp = 0.6 + Math.abs(p1) * 0.04;
 c.position.set(Math.sin(t * sp + i * 1.1) * 1.45, Math.cos(t * sp + i * 1.7) * 1.15, Math.sin(t * sp + i * 2.3) * 1.45);
 });
 });
 const rad = (p1 * Math.PI) / 180;
 return (<group>
<gridHelper args={[8, 16, "#1e293b", "#0f172a"]} position={[0, -2.1, 0]} />
{mode === "vectors" && <group>
<Line points={[[0,0,0],[Math.cos(rad/2)*2.4,Math.sin(rad/2)*2.4,0]]} color="#38bdf8" lineWidth={4} />
<Line points={[[0,0,0],[Math.cos(-rad/2)*2.4,Math.sin(-rad/2)*2.4,0]]} color="#f472b6" lineWidth={4} />
<Line points={[[0,0,0],[-2.4*Math.cos(rad/2),0,0]]} color="#34d399" lineWidth={4} /></group>}{mode === "incline" && <Line points={[[-2.2*Math.cos(rad),2.2*Math.sin(rad),0],[2.2*Math.cos(rad),-2.2*Math.sin(rad),0]]} color="#64748b" lineWidth={6} />}
<group ref={ref}>
{items.map((i) => { const t = (i / 28) * Math.PI * 4;
 let pos: [number, number, number] = [0, 0, 0];
 let col = "#F472B6";
 let r = 0.14;
 if (mode === "helix") { const st = i % 2 === 0 ? 1 : -1;
 pos = [Math.cos(t)*0.9*st, (i-14)*0.14, Math.sin(t)*0.9*st];
 col = i%2===0?"#38bdf8":"#f472b6";
 } else if (mode === "emwave") { pos = [(i-14)*0.22, 0, i%2===0?0.5:-0.5];
 col = i%2===0?"#38bdf8":"#f43f5e";
 } else if (mode === "barton") { pos = [(i-14)*0.22, 0, 0];
 col = i===Math.round(p1*10)%28?"#f43f5e":"#a855f7";
 r=0.12;
 } else if (mode === "orbit") { pos = i===0?[0,1.8,0]:[Math.cos(t)*p2,-0.4,Math.sin(t)*p2];
 col=i===0?"#fbbf24":"#38bdf8";
 r=i===0?0.2:0.12;
 } else if (mode === "heart") { const a=(i/28)*Math.PI*2;
 pos=[Math.cos(a)*0.95,Math.sin(a)*1.1,Math.sin(a*2)*0.5];
 col=i%2===0?"#ef4444":"#3b82f6";
 r=0.24;
 } else if (mode === "lever") { pos=[(i-14)*0.18,0,0];
 col=i<14?"#38bdf8":"#f59e0b";
 r=0.13;
 } else if (mode === "incline") { if (i>0) return null;
 r=0.28;
 } else { const a=(i/28)*Math.PI*2;
 pos=[Math.cos(a*2)*1.1,Math.sin(a*3)*0.9,Math.sin(a)*1.1];
 col=i%3===0?"#38bdf8":i%3===1?"#f472b6":"#34d399";
 } return <mesh key={i} position={pos}>
<sphereGeometry args={[r,20,20]} />
<meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.25} /></mesh>;
 })}
</group>
<Html position={[0, 2.35, 0]} center>
<div className="px-3.5 py-1 rounded-full bg-slate-900/90 border border-white/15 text-xs font-bold text-white whitespace-nowrap">Cấu Tạo Phân Tử NH3 (Chóp Tam Giác) & Ion NH4+ (Tứ Diện) ({p1} | {p2})</div></Html></group>);
 }export default function Scene(props: { p1: number;
 p2: number;
 paused: boolean }) { return <div className="w-full h-full bg-[#060913]">
<Canvas camera={{ position: [0, 1.2, 6.2], fov: 45 }} dpr={[1, 2]}>
<ambientLight intensity={0.7} />
<directionalLight position={[6, 8, 6]} intensity={1.3} />
<Sim {...props} />
<OrbitControls enableDamping /></Canvas></div>;
 }