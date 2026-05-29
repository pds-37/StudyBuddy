import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Info } from "lucide-react";

export interface GalaxyNode {
  id: string;
  label: string;
  type: "phase" | "mission" | "task";
  status: "completed" | "pending" | "skipped";
  description: string;
  x: number;
  y: number;
  z: number;
  val: number;
  originalData: any;
}

interface ThreeSkillGalaxyProps {
  roadmap: any;
  onNodeClick: (node: GalaxyNode) => void;
  selectedNode: GalaxyNode | null;
}

const statusColorsHex = {
  completed: 0x06b6d4, // Neon Cyan
  pending: 0x334155,   // Dark Basalt Gray
  skipped: 0x64748b    // Slate Gray
};

export function ThreeSkillGalaxy({ roadmap, onNodeClick, selectedNode }: ThreeSkillGalaxyProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current || !roadmap || !roadmap.phases) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 500;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030406, 0.0025);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 250);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 3, 300);
    pointLight.position.set(0, 50, 100);
    scene.add(pointLight);

    // 5. Starfield Background (Cosmic Dust)
    const starCount = 300;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 800;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.1,
      transparent: true,
      opacity: 0.4
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 6. Constellation Node Position Calculations
    const phases = roadmap.phases;
    const nodes: GalaxyNode[] = [];
    const idToPos = new Map<string, THREE.Vector3>();

    phases.forEach((phase: any, pIdx: number) => {
      // Space phases along the X-axis in 3D
      const pX = (pIdx - (phases.length - 1) / 2) * 150;
      const pY = 0;
      const pZ = 0;

      const phaseNode: GalaxyNode = {
        id: phase.id,
        label: phase.title,
        type: "phase",
        status: phase.status || (phase.missions.every((m: any) => m.status === "completed") ? "completed" : "pending"),
        description: phase.description || "Milestone Phase",
        x: pX,
        y: pY,
        z: pZ,
        val: 9,
        originalData: phase
      };
      nodes.push(phaseNode);

      phase.missions.forEach((mission: any, mIdx: number) => {
        // Orbit missions circularly around their parent Phase star
        const mAngle = (mIdx / (phase.missions.length || 1)) * Math.PI * 2;
        const mRadius = 45;
        const mX = pX + mRadius * Math.cos(mAngle);
        const mY = pY + mRadius * Math.sin(mAngle);
        const mZ = pZ + (Math.sin(mIdx * 3) * 10);

        const missionNode: GalaxyNode = {
          id: mission.id,
          label: mission.title,
          type: "mission",
          status: mission.status || (mission.tasks && mission.tasks.every((t: any) => t.status === "completed") ? "completed" : "pending"),
          description: mission.description || "Mission objective block",
          x: mX,
          y: mY,
          z: mZ,
          val: 6,
          originalData: mission
        };
        nodes.push(missionNode);

        const tasks = mission.tasks || [];
        tasks.forEach((task: any, tIdx: number) => {
          // Orbit micro tasks around their parent Mission node
          const tAngle = (tIdx / (tasks.length || 1)) * Math.PI * 2;
          const tRadius = 15;
          const tX = mX + tRadius * Math.cos(tAngle);
          const tY = mY + tRadius * Math.sin(tAngle);
          const tZ = mZ + (Math.cos(tIdx * 2) * 5);

          const taskNode: GalaxyNode = {
            id: task.id,
            label: task.title,
            type: "task",
            status: task.status || "pending",
            description: task.aiHint || "Vocal learning card",
            x: tX,
            y: tY,
            z: tZ,
            val: 3.5,
            originalData: task
          };
          nodes.push(taskNode);
        });
      });
    });

    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    // Create 3D sphere meshes for each node
    const meshes: THREE.Mesh[] = [];

    nodes.forEach((node) => {
      let color = statusColorsHex[node.status] || 0x334155;
      
      // If task is in progress (i.e. pending but it is the active one in a phase)
      if (node.status === "pending" && node.type === "task" && node.originalData.status === "in_progress") {
        color = 0xf59e0b; // Amber highlight for active target
      }

      const geometry = new THREE.SphereGeometry(node.val, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.85
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(node.x, node.y, node.z);
      mesh.userData = { id: node.id, label: node.label, node: node };

      // Halo Rings around stars
      const ringGeo = new THREE.RingGeometry(node.val * 1.45, node.val * 1.5, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.22
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      mesh.add(ringMesh);

      nodeGroup.add(mesh);
      meshes.push(mesh);
      idToPos.set(node.id, mesh.position);
    });

    // 7. Render Constellation Laser Links
    const lineGroup = new THREE.Group();
    scene.add(lineGroup);

    // Connect Missions to parent Phases, and Tasks to parent Missions
    phases.forEach((phase: any) => {
      const phasePos = idToPos.get(phase.id);
      if (!phasePos) return;

      phase.missions.forEach((mission: any) => {
        const missionPos = idToPos.get(mission.id);
        if (missionPos) {
          const points = [phasePos, missionPos];
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const lineMat = new THREE.LineBasicMaterial({
            color: mission.status === "completed" ? 0x06b6d4 : 0x1e293b,
            transparent: true,
            opacity: mission.status === "completed" ? 0.35 : 0.12,
            linewidth: 1.5
          });
          const line = new THREE.Line(lineGeo, lineMat);
          lineGroup.add(line);
        }

        const tasks = mission.tasks || [];
        tasks.forEach((task: any) => {
          const taskPos = idToPos.get(task.id);
          if (missionPos && taskPos) {
            const points = [missionPos, taskPos];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const lineMat = new THREE.LineBasicMaterial({
              color: task.status === "completed" ? 0x06b6d4 : 0x1e293b,
              transparent: true,
              opacity: task.status === "completed" ? 0.22 : 0.08,
              linewidth: 1
            });
            const line = new THREE.Line(lineGeo, lineMat);
            lineGroup.add(line);
          }
        });
      });
    });

    // 8. Custom Smooth Drag & Orbit Controls
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
        const node = selectedMesh.userData.node as GalaxyNode;
        onNodeClick(node);
      }
    };

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

    const onWheel = (e: WheelEvent) => {
      camera.position.z = Math.max(80, Math.min(500, camera.position.z + e.deltaY * 0.4));
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

    // 9. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth rotate interpolation
      nodeGroup.rotation.y += (targetRotation.y - nodeGroup.rotation.y) * 0.05;
      nodeGroup.rotation.x += (targetRotation.x - nodeGroup.rotation.x) * 0.05;

      if (!isDragging) {
        targetRotation.y += 0.001; // slow auto drift
      }

      lineGroup.rotation.copy(nodeGroup.rotation);
      starField.rotation.y = elapsed * 0.01;

      // Glow pulse animation
      meshes.forEach((mesh) => {
        const pulse = 1 + 0.12 * Math.sin(elapsed * 3 + mesh.position.x * 0.5);
        mesh.scale.set(pulse, pulse, pulse);

        const ring = mesh.children[0] as THREE.Mesh;
        if (ring) {
          ring.rotation.z += 0.008;
        }

        // Highlight selected
        if (selectedNode && mesh.userData.id === selectedNode.id) {
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = 1.0;
          mesh.scale.set(pulse * 1.35, pulse * 1.35, pulse * 1.35);
        } else {
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.85;
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

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

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
  }, [roadmap, onNodeClick, selectedNode]);

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col rounded-3xl border border-white/5 bg-[#030406]">
      <div ref={mountRef} className="flex-1 w-full h-full" />

      {/* Floating HUD Instructions */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
        <div className="px-3.5 py-2 rounded-xl bg-black/60 border border-white/5 backdrop-blur-xl pointer-events-auto flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan" />
          <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest">
            Drag to Rotate • Scroll to Zoom • Select Node to Inspect
          </span>
        </div>
      </div>

      {/* Hover overlay HUD */}
      {hoveredNode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/80 border border-cyan/30 shadow-[0_0_20px_rgba(6,182,212,0.25)] text-center backdrop-blur-xl z-20 pointer-events-none">
          <span className="text-[11px] font-black tracking-wide text-white uppercase font-display">
            {hoveredNode}
          </span>
        </div>
      )}
    </div>
  );
}
