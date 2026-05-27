import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function NeuralConstellation3D() {
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
    camera.position.set(0, 0, 4);

    const group = new THREE.Group();
    scene.add(group);

    const particleCount = 250;
    const maxDistance = 0.75;
    
    const positions = new Float32Array(particleCount * 3);
    const velocities: { x: number, y: number, z: number }[] = [];

    const radius = 2.5;

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * radius;

      velocities.push({
        x: (Math.random() - 0.5) * 0.008,
        y: (Math.random() - 0.5) * 0.008,
        z: (Math.random() - 0.5) * 0.008
      });
    }

    const pGeometry = new THREE.BufferGeometry();
    pGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Core nodes
    const pMaterial = new THREE.PointsMaterial({
      color: 0x8b7ff7,
      size: 0.035,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeometry, pMaterial);
    group.add(particles);

    const linesGeometry = new THREE.BufferGeometry();
    const maxLines = (particleCount * (particleCount - 1)) / 2;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);
    
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    linesGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    
    const linesMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
    group.add(linesMesh);

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    
    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    document.addEventListener('mousemove', onMouseMove);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      targetX = mouseX * 0.4;
      targetY = mouseY * 0.4;

      group.rotation.y += (targetX - group.rotation.y) * 0.03;
      group.rotation.x += (-targetY - group.rotation.x) * 0.03;
      group.rotation.y += 0.001; // subtle constant drift
      
      let vertexpos = 0;
      let colorpos = 0;
      let numConnected = 0;

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += velocities[i].x;
        positions[i * 3 + 1] += velocities[i].y;
        positions[i * 3 + 2] += velocities[i].z;
        
        if (Math.abs(positions[i * 3]) > radius / 2) velocities[i].x *= -1;
        if (Math.abs(positions[i * 3 + 1]) > radius / 2) velocities[i].y *= -1;
        if (Math.abs(positions[i * 3 + 2]) > radius / 2) velocities[i].z *= -1;

        for (let j = i + 1; j < particleCount; j++) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          
          if (dist < maxDistance) {
            const alpha = 1.0 - (dist / maxDistance);
            
            linePositions[vertexpos++] = positions[i * 3];
            linePositions[vertexpos++] = positions[i * 3 + 1];
            linePositions[vertexpos++] = positions[i * 3 + 2];
            
            linePositions[vertexpos++] = positions[j * 3];
            linePositions[vertexpos++] = positions[j * 3 + 1];
            linePositions[vertexpos++] = positions[j * 3 + 2];
            
            // #6d5ef5 (109, 94, 245) mapped to 0-1
            const rCol = 0.42 * alpha;
            const gCol = 0.36 * alpha;
            const bCol = 0.96 * alpha;
            
            lineColors[colorpos++] = rCol;
            lineColors[colorpos++] = gCol;
            lineColors[colorpos++] = bCol;
            
            lineColors[colorpos++] = rCol;
            lineColors[colorpos++] = gCol;
            lineColors[colorpos++] = bCol;
            
            numConnected++;
          }
        }
      }
      
      linesMesh.geometry.setDrawRange(0, numConnected * 2);
      linesMesh.geometry.attributes.position.needsUpdate = true;
      linesMesh.geometry.attributes.color.needsUpdate = true;
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      renderer.setSize(W(), H());
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
      
      pGeometry.dispose();
      pMaterial.dispose();
      linesGeometry.dispose();
      linesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="hero-r" id="hero-r">
      <canvas ref={canvasRef} id="c3d"></canvas>
      
      <div className="chip">
        <div className="chip-dot p"></div>
        <div>
          <div>Neural Pathway</div>
          <div className="chip-val">Learning concepts linked</div>
        </div>
      </div>
      <div className="chip">
        <div className="chip-dot g"></div>
        <div>
          <div>Synaptic Strength</div>
          <div className="chip-val">Memory recall · 92%</div>
        </div>
      </div>
      <div className="chip">
        <div className="chip-icon">✨</div>
        <div>
          <div>AI Insights</div>
          <div className="chip-val">Identifying knowledge gaps</div>
        </div>
      </div>
      <div className="chip">
        <div className="chip-dot a"></div>
        <div>
          <div>Network Growth</div>
          <div className="chip-val">+45 nodes this week</div>
        </div>
      </div>
    </div>
  );
}
