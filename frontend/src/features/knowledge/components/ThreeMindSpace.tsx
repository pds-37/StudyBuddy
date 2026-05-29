import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { type KnowledgeNode, type KnowledgeGraphData } from "../../../lib/api/knowledge";
import { Info } from "lucide-react";

interface ThreeMindSpaceProps {
  data: KnowledgeGraphData;
  onNodeClick: (node: KnowledgeNode) => void;
  selectedNode: KnowledgeNode | null;
}

const retentionColorsHex = {
  strong: 0x10b981,     // Emerald
  stable: 0x06b6d4,     // Cyan
  weakening: 0xf59e0b,  // Amber
  critical: 0xef4444,   // Red
  concept: 0xa78bfa,    // Purple (default)
  note: 0x64748b,       // Slate
  skill: 0x06b6d4,      // Cyan
  milestone: 0xf59e0b   // Amber
};

export function ThreeMindSpace({ data, onNodeClick, selectedNode }: ThreeMindSpaceProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 500;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020305, 0.002);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 300);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x7c5cff, 2.5, 400);
    pointLight.position.set(0, 50, 100);
    scene.add(pointLight);

    // 5. Generate stars background (Space Dust)
    const starCount = 350;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 800;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.25,
      transparent: true,
      opacity: 0.35
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 6. Node calculations & 3D Positions
    const nodes = data.nodes;
    const nodesWithPositions = nodes.map((node: KnowledgeNode, i: number) => {
      // Golden ratio spiral projection in 3D sphere
      const phi = Math.acos(-1 + (2 * i) / nodes.length);
      const theta = Math.sqrt(nodes.length * Math.PI) * phi;
      
      const r = node.type === "concept" ? 110 : node.type === "skill" ? 160 : node.type === "milestone" ? 200 : 130;
      
      return {
        ...node,
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi)
      };
    });

    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    // Store references for raycasting and animation
    const meshes: THREE.Mesh[] = [];
    const idToPos = new Map<string, THREE.Vector3>();

    nodesWithPositions.forEach((node: any) => {
      const color = node.retentionState 
        ? retentionColorsHex[node.retentionState as keyof typeof retentionColorsHex]
        : (retentionColorsHex[node.type as keyof typeof retentionColorsHex] || 0xa78bfa);

      const size = Math.max(4, Math.min(10, node.val / 2.5));

      // Glowing sphere node
      const geometry = new THREE.SphereGeometry(size, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
        wireframe: false
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(node.x, node.y, node.z);
      mesh.userData = { id: node.id, label: node.label, node: node };
      
      // Halo Ring mesh around the planet
      const ringGeo = new THREE.RingGeometry(size * 1.5, size * 1.55, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.25
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      mesh.add(ringMesh);

      nodeGroup.add(mesh);
      meshes.push(mesh);
      idToPos.set(node.id, mesh.position);
    });

    // 7. Render 3D Gravity Lines (Links)
    const lineGroup = new THREE.Group();
    scene.add(lineGroup);

    data.links.forEach((link: any) => {
      const startPos = idToPos.get(link.source);
      const endPos = idToPos.get(link.target);

      if (startPos && endPos) {
        const points = [startPos, endPos];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: link.relationship === "contains" ? 0x7c5cff : 0xffffff,
          transparent: true,
          opacity: link.relationship === "contains" ? 0.25 : 0.08,
          linewidth: link.strength ? link.strength * 1.5 : 1
        });
        const line = new THREE.Line(lineGeo, lineMat);
        lineGroup.add(line);
      }
    });

    // 8. Custom Mouse Interactions (Smooth Drag & Pan)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    const targetRotation = new THREE.Vector2();

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        
        targetRotation.y += deltaX * 0.005;
        targetRotation.x += deltaY * 0.005;

        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const selectedMesh = intersects[0].object as THREE.Mesh;
        const node = selectedMesh.userData.node as KnowledgeNode;
        onNodeClick(node);
      }
    };

    // Touch Support for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - prevMouseX;
        const deltaY = e.touches[0].clientY - prevMouseY;
        
        targetRotation.y += deltaX * 0.005;
        targetRotation.x += deltaY * 0.005;

        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    // Zoom listener
    const onWheel = (e: WheelEvent) => {
      camera.position.z = Math.max(100, Math.min(600, camera.position.z + e.deltaY * 0.4));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("mousedown", onMouseDown);
    domEl.addEventListener("mousemove", onMouseMove);
    domEl.addEventListener("mouseup", onMouseUp);
    domEl.addEventListener("click", onClick);
    domEl.addEventListener("wheel", onWheel);
    domEl.addEventListener("touchstart", onTouchStart, { passive: true });
    domEl.addEventListener("touchmove", onTouchMove, { passive: true });
    domEl.addEventListener("touchend", onMouseUp);

    // 9. Animation loop
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;

      // Smooth interpolation for rotations
      nodeGroup.rotation.y += (targetRotation.y - nodeGroup.rotation.y) * 0.05;
      nodeGroup.rotation.x += (targetRotation.x - nodeGroup.rotation.x) * 0.05;
      
      // Auto-orbit slowly if user is idle
      if (!isDragging) {
        targetRotation.y += 0.001;
      }

      lineGroup.rotation.copy(nodeGroup.rotation);

      // Starfield slow drift
      starField.rotation.y = elapsed * 0.015;

      // Glow pulsing animation on nodes using Sine waves
      meshes.forEach(mesh => {
        const baseScale = 1;
        const pulse = 1 + 0.15 * Math.sin(elapsed * 2.5 + mesh.position.x);
        mesh.scale.set(baseScale * pulse, baseScale * pulse, baseScale * pulse);

        // Slow halo ring rotation
        const ring = mesh.children[0] as THREE.Mesh;
        if (ring) {
          ring.rotation.z += 0.01;
        }

        // Highlight selected node
        if (selectedNode && mesh.userData.id === selectedNode.id) {
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = 1.0;
          mesh.scale.set(pulse * 1.4, pulse * 1.4, pulse * 1.4);
        } else {
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.8;
        }
      });

      // Hover Raycasting
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);
      if (intersects.length > 0) {
        const hovered = intersects[0].object as THREE.Mesh;
        setHoveredNode(hovered.userData.label);
      } else {
        setHoveredNode(null);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      domEl.removeEventListener("mousedown", onMouseDown);
      domEl.removeEventListener("mousemove", onMouseMove);
      domEl.removeEventListener("mouseup", onMouseUp);
      domEl.removeEventListener("click", onClick);
      domEl.removeEventListener("wheel", onWheel);
      domEl.removeEventListener("touchstart", onTouchStart);
      domEl.removeEventListener("touchmove", onTouchMove);
      domEl.removeEventListener("touchend", onMouseUp);
      if (mountRef.current && domEl) {
        mountRef.current.removeChild(domEl);
      }
    };
  }, [data, onNodeClick, selectedNode]);

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="flex-1 w-full h-full bg-[#030407]" />

      {/* Floating HUD controls */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
        <div className="px-3.5 py-2 rounded-xl bg-black/60 border border-white/5 backdrop-blur-xl pointer-events-auto flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-light" />
          <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">
            Drag to Orbit • Scroll to Zoom • Click Planet to Inspect
          </span>
        </div>
      </div>

      {/* Dynamic Hover HUD overlay */}
      {hoveredNode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl bg-black/80 border border-white/10 shadow-[0_0_20px_rgba(124,92,255,0.25)] text-center backdrop-blur-xl z-20 animate-fade-in pointer-events-none">
          <span className="text-xs font-black tracking-wide text-white uppercase font-display">
            {hoveredNode}
          </span>
        </div>
      )}
    </div>
  );
}
