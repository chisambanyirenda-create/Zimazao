import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Component, type ReactNode, useMemo, useRef } from "react"
import * as THREE from "three"

const EMERALD = new THREE.Color("#34d399")
const GOLD = new THREE.Color("#fbbf24")
const CYAN = new THREE.Color("#67e8f9")
const R = 2

class GlobeBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

function latLon(lat: number, lon: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))
}

const CITIES: [number, number][] = [
  [-15.42, 28.28], [-12.96, 28.64], [-12.8, 28.21], [-17.86, 25.85],
  [-13.64, 32.65], [-10.21, 31.18], [-12.17, 26.4], [-15.25, 23.13],
]

function World() {
  const rig = useRef<THREE.Group>(null!)
  const { camera, pointer } = useThree()

  const wire = useMemo(() => new THREE.SphereGeometry(R, 40, 40), [])
  const dots = useMemo(() => new THREE.SphereGeometry(R * 1.002, 44, 22).attributes.position.array.slice() as Float32Array, [])
  const hub = useMemo(() => latLon(CITIES[0][0], CITIES[0][1], R), [])
  const curves = useMemo(() => CITIES.slice(1).map(([la, lo]) => {
    const end = latLon(la, lo, R)
    const mid = hub.clone().add(end).multiplyScalar(0.5)
    mid.setLength(R * (1 + hub.distanceTo(end) * 0.35))
    return new THREE.QuadraticBezierCurve3(hub.clone(), mid, end)
  }), [hub])
  const tubes = useMemo(() => curves.map((c) => new THREE.TubeGeometry(c, 44, 0.012, 8, false)), [curves])
  const markers = useMemo(() => CITIES.map(([la, lo]) => latLon(la, lo, R)), [])
  const pulses = useRef<THREE.Group>(null!)

  const stars = useMemo(() => {
    const a = new Float32Array(500 * 3)
    for (let i = 0; i < 500; i++) {
      const rr = 12 + Math.random() * 20, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1)
      a[i * 3] = rr * Math.sin(ph) * Math.cos(th); a[i * 3 + 1] = rr * Math.cos(ph); a[i * 3 + 2] = rr * Math.sin(ph) * Math.sin(th)
    }
    return a
  }, [])

  useFrame(({ clock }, dt) => {
    rig.current.rotation.y += dt * 0.1
    camera.position.x += (pointer.x * 0.8 - camera.position.x) * 0.03
    camera.position.y += (pointer.y * 0.5 - camera.position.y) * 0.03
    camera.lookAt(0, 0, 0)
    const t = clock.getElapsedTime()
    pulses.current?.children.forEach((m, i) => {
      const p = (t * 0.3 + i * 0.13) % 1
      m.position.copy(curves[i].getPointAt(p))
      m.scale.setScalar(0.05 + Math.sin(p * Math.PI) * 0.05)
    })
  })

  return (
    <>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[stars, 3]} /></bufferGeometry>
        <pointsMaterial color={CYAN} size={0.05} sizeAttenuation transparent opacity={0.55} />
      </points>
      <group ref={rig} rotation={[0.35, 0, 0.1]}>
        <mesh><sphereGeometry args={[R * 0.985, 48, 48]} /><meshBasicMaterial color="#03140d" /></mesh>
        <mesh geometry={wire}><meshBasicMaterial color={EMERALD} wireframe transparent opacity={0.18} /></mesh>
        <points>
          <bufferGeometry><bufferAttribute attach="attributes-position" args={[dots, 3]} /></bufferGeometry>
          <pointsMaterial color={GOLD} size={0.02} sizeAttenuation transparent opacity={0.6} />
        </points>
        <mesh scale={1.16}>
          <sphereGeometry args={[R, 48, 48]} />
          <meshBasicMaterial color={EMERALD} transparent opacity={0.09} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {tubes.map((g, i) => (
          <mesh key={i} geometry={g}><meshBasicMaterial color={i % 2 ? GOLD : EMERALD} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        ))}
        {markers.map((p, i) => (
          <mesh key={i} position={p}><sphereGeometry args={[i === 0 ? 0.06 : 0.035, 14, 14]} /><meshBasicMaterial color={i === 0 ? GOLD : EMERALD} /></mesh>
        ))}
        <group ref={pulses}>
          {curves.map((_, i) => (<mesh key={i}><sphereGeometry args={[1, 10, 10]} /><meshBasicMaterial color="#ffffff" /></mesh>))}
        </group>
      </group>
    </>
  )
}

export default function HeroGlobe() {
  return (
    <GlobeBoundary>
      <Canvas
        className="!absolute inset-0"
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 6], fov: 42 }}
      >
        <World />
      </Canvas>
    </GlobeBoundary>
  )
}
