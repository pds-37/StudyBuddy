import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function FibonacciSphere3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    
    const container = containerRef.current;
    const canvas = canvasRef.current;

    const W = () => container.clientWidth;
    const H = () => container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 100);
    camera.position.set(0, 0, 3.2);

    /* ── Fibonacci sphere points ── */
    const N = 420;
    const PHI = Math.PI * (3 - Math.sqrt(5));
    const pts: THREE.Vector3[] = [];

    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = PHI * i;
      pts.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r));
    }

    /* ── Point cloud ── */
    const ptGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const ptMat = new THREE.PointsMaterial({
      color: 0xffffff, size: 0.018,
      transparent: true, opacity: 0.75,
      sizeAttenuation: true
    });
    const pointCloud = new THREE.Points(ptGeo, ptMat);

    /* ── Connection lines ── */
    const lineVerts: number[] = [];
    const THRESH = 0.38;

    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        if (pts[i].distanceTo(pts[j]) < THRESH) {
          lineVerts.push(pts[i].x, pts[i].y, pts[i].z);
          lineVerts.push(pts[j].x, pts[j].y, pts[j].z);
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineVerts, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x6d5ef5, transparent: true, opacity: 0.18
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);

    /* ── Inner glow core ── */
    const coreGeo = new THREE.SphereGeometry(0.78, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x4c3dd4, transparent: true, opacity: 0.04,
      side: THREE.BackSide
    });
    const core = new THREE.Mesh(coreGeo, coreMat);

    /* ── Outer atmosphere halo ── */
    const haloGeo = new THREE.SphereGeometry(1.15, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x6d5ef5, transparent: true, opacity: 0.025,
      side: THREE.BackSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);

    /* ── Equatorial ring ── */
    const ringGeo = new THREE.TorusGeometry(1.02, 0.003, 8, 120);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x8b7ff7, transparent: true, opacity: 0.3
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.8;

    /* ── Highlight nodes (larger, glowing) ── */
    const hiPositions = [
      new THREE.Vector3(0.6, 0.7, 0.3),
      new THREE.Vector3(-0.8, 0.1, 0.5),
      new THREE.Vector3(0.2, -0.8, 0.5),
      new THREE.Vector3(0.9, -0.2, -0.3),
      new THREE.Vector3(-0.3, 0.9, -0.2),
    ];

    const hiGroup = new THREE.Group();
    hiPositions.forEach(pos => {
      const geo = new THREE.SphereGeometry(0.022, 12, 12);
      const mat = new THREE.MeshBasicMaterial({ color: 0x8b7ff7 });
      const m = new THREE.Mesh(geo, mat);
      m.position.copy(pos.normalize());
      hiGroup.add(m);
    });

    /* ── Group everything ── */
    const group = new THREE.Group();
    group.add(core, halo, lines, pointCloud, ring, hiGroup);
    scene.add(group);

    /* ── Mouse reactive rotation ── */
    let mx = 0, my = 0;
    let targetRX = 0, targetRY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    document.addEventListener('mousemove', onMouseMove);

    /* ── Animate ── */
    let t = 0;
    let animationFrameId: number;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      t += 0.004;

      targetRX += (-my * 0.35 - targetRX) * 0.04;
      targetRY += (mx * 0.5 - targetRY) * 0.04;

      group.rotation.y = t + targetRY;
      group.rotation.x = targetRX;

      /* pulsing ring opacity */
      ring.material.opacity = 0.2 + Math.sin(t * 1.5) * 0.12;

      /* breathing halo */
      const scale = 1 + Math.sin(t * 0.8) * 0.02;
      halo.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };
    animate();

    /* ── Resize ── */
    const onResize = () => {
      renderer.setSize(W(), H());
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationFrameId);
      
      // Dispose Geometries and Materials
      ptGeo.dispose();
      ptMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="hero-r" id="hero-r">
      <canvas ref={canvasRef} id="c3d"></canvas>
      
      {/* floating chips overlaid on 3D */}
      <div className="chip">
        <div className="chip-dot p"></div>
        <div>
          <div>Roadmap Progress</div>
          <div className="chip-val">72% — Advanced JS next</div>
        </div>
      </div>
      <div className="chip">
        <div className="chip-dot g"></div>
        <div>
          <div>Recall Health</div>
          <div className="chip-val">84% · Strong · Keep it up</div>
        </div>
      </div>
      <div className="chip">
        <div className="chip-icon">💼</div>
        <div>
          <div>Job Match Found</div>
          <div className="chip-val">Frontend Intern · 85% match</div>
        </div>
      </div>
      <div className="chip">
        <div className="chip-dot a"></div>
        <div>
          <div>12-Day Streak</div>
          <div className="chip-val">Career Readiness · 68%</div>
        </div>
      </div>
    </div>
  );
}
