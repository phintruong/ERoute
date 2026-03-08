import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { BuildingWrapper } from './BuildingWrapper';
import { useBuildings } from '@/lib/editor/contexts/BuildingsContext';
import { DEFAULT_BUILDING_SPEC } from '@/lib/editor/types/buildingSpec';
import { useBuildingSound } from '@/lib/editor/hooks/useBuildingSound';
import { FloorPlanView } from '@/components/editor/FloorPlan/FloorPlanView';

const SNAP_THRESHOLD = 5; // Units within which snapping activates

/**
 * Animates the camera and orbit target to smoothly transition
 * to the selected floor's actual height.
 */
function FloorCameraAnimator({
  floorIndex,
  floorHeight,
  controlsRef,
}: {
  floorIndex: number;
  floorHeight: number;
  controlsRef: React.MutableRefObject<any>;
}) {
  const { camera } = useThree();
  const targetY = floorIndex * floorHeight;
  const initialized = useRef(false);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    // On first frame only, set a reasonable starting position
    if (!initialized.current) {
      initialized.current = true;
      camera.position.set(20, targetY + 15, 20);
      controls.target.set(0, targetY, 0);
      controls.update();
      return;
    }

    // Smoothly lerp only the orbit target Y to the selected floor height
    // Camera position is NOT forced — user can freely orbit/pan/zoom
    const lerpFactor = 0.06;
    const newTargetY = THREE.MathUtils.lerp(controls.target.y, targetY, lerpFactor);
    controls.target.y = newTargetY;
    controls.update();
  });

  return null;
}

interface SceneContentProps {
  sceneRef?: React.MutableRefObject<THREE.Scene | null>;
}

function SceneContent({ sceneRef }: SceneContentProps) {
  const { buildings, selectedBuildingId, selectBuilding, addBuilding, placementMode, clearSelection, floorPlanFloor, getSelectedBuilding } = useBuildings();
  const { scene } = useThree();
  const { play: playSound } = useBuildingSound();
  const gridPlaneRef = useRef<THREE.Mesh>(null);
  const floorPlanControlsRef = useRef<any>(null);
  const [ghostPosition, setGhostPosition] = useState<{ x: number; y: number; z: number } | null>(null);
  const [isSnapped, setIsSnapped] = useState(false);

  // Sync scene ref
  useEffect(() => {
    if (sceneRef) {
      sceneRef.current = scene;
    }
  }, [scene, sceneRef]);

  // Reset camera animator on floor change
  const prevFloorRef = useRef<number | null>(null);
  useEffect(() => {
    if (floorPlanFloor !== prevFloorRef.current) {
      prevFloorRef.current = floorPlanFloor;
    }
  }, [floorPlanFloor]);

  // Handle space key to deselect all buildings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection]);

  // Calculate snapped position based on existing buildings (including vertical stacking)
  const getSnappedPosition = useCallback((rawX: number, rawZ: number): { x: number; y: number; z: number; snapped: boolean } => {
    if (buildings.length === 0) {
      return { x: Math.round(rawX), y: 0, z: Math.round(rawZ), snapped: false };
    }

    const newWidth = DEFAULT_BUILDING_SPEC.width;
    const newDepth = DEFAULT_BUILDING_SPEC.depth;

    let bestSnapX = rawX;
    let bestSnapZ = rawZ;
    let bestSnapY = 0;
    let minDistX = SNAP_THRESHOLD;
    let minDistZ = SNAP_THRESHOLD;
    let snappedX = false;
    let snappedZ = false;
    let snappedY = false;

    for (const building of buildings) {
      const bx = building.position.x;
      const by = building.position.y;
      const bz = building.position.z;
      const bWidth = building.spec.width;
      const bDepth = building.spec.depth;
      const bHeight = building.spec.floorHeight * building.spec.numberOfFloors;

      // Snap points for X axis (left and right of existing building)
      const snapLeftX = bx - bWidth / 2 - newWidth / 2;
      const snapRightX = bx + bWidth / 2 + newWidth / 2;

      // Snap points for Z axis (front and back of existing building)
      const snapFrontZ = bz - bDepth / 2 - newDepth / 2;
      const snapBackZ = bz + bDepth / 2 + newDepth / 2;

      // Check X snapping
      if (Math.abs(rawX - snapLeftX) < minDistX) {
        minDistX = Math.abs(rawX - snapLeftX);
        bestSnapX = snapLeftX;
        snappedX = true;
      }
      if (Math.abs(rawX - snapRightX) < minDistX) {
        minDistX = Math.abs(rawX - snapRightX);
        bestSnapX = snapRightX;
        snappedX = true;
      }

      // Check Z snapping
      if (Math.abs(rawZ - snapFrontZ) < minDistZ) {
        minDistZ = Math.abs(rawZ - snapFrontZ);
        bestSnapZ = snapFrontZ;
        snappedZ = true;
      }
      if (Math.abs(rawZ - snapBackZ) < minDistZ) {
        minDistZ = Math.abs(rawZ - snapBackZ);
        bestSnapZ = snapBackZ;
        snappedZ = true;
      }

      // Also snap to align with existing building centers (for stacking on top)
      if (Math.abs(rawX - bx) < minDistX) {
        minDistX = Math.abs(rawX - bx);
        bestSnapX = bx;
        snappedX = true;
      }
      if (Math.abs(rawZ - bz) < minDistZ) {
        minDistZ = Math.abs(rawZ - bz);
        bestSnapZ = bz;
        snappedZ = true;
      }

      // Check if we're close enough to stack on top of this building
      const distToCenter = Math.sqrt(Math.pow(rawX - bx, 2) + Math.pow(rawZ - bz, 2));
      if (distToCenter < Math.max(bWidth, bDepth) / 2) {
        // We're over this building, stack on top
        const stackY = by + bHeight;
        if (stackY > bestSnapY) {
          bestSnapY = stackY;
          bestSnapX = bx;
          bestSnapZ = bz;
          snappedX = true;
          snappedZ = true;
          snappedY = true;
        }
      }
    }

    const finalX = snappedX ? bestSnapX : Math.round(rawX);
    const finalZ = snappedZ ? bestSnapZ : Math.round(rawZ);
    const finalY = snappedY ? bestSnapY : 0;

    return { x: finalX, y: finalY, z: finalZ, snapped: snappedX || snappedZ || snappedY };
  }, [buildings]);

  const handlePointerMove = (e: any) => {
    if (!placementMode) {
      setGhostPosition(null);
      setIsSnapped(false);
      return;
    }

    const point = e.point;
    const { x, y, z, snapped } = getSnappedPosition(point.x, point.z);
    setGhostPosition({ x, y, z });
    setIsSnapped(snapped);
  };

  const handleGridClick = (e: any) => {
    if (!placementMode) return;

    const point = e.point;
    const { x, y, z } = getSnappedPosition(point.x, point.z);

    addBuilding({ x, y, z });
    playSound('brick_place');
    setGhostPosition(null);
    setIsSnapped(false);
  };

  const selectedBuilding = getSelectedBuilding();
  const isFloorPlanMode = floorPlanFloor !== null && !!selectedBuilding;

  return (
    <>
      {/* Lighting - brighter for clearer floor plan views */}
      <ambientLight intensity={1.2} />
      <hemisphereLight args={[0xffffff, 0xffffff, 0.7]} />
      <pointLight position={[50, 50, 50]} intensity={0.5} />
      <pointLight position={[-50, 50, 50]} intensity={0.5} />
      <pointLight position={[50, 50, -50]} intensity={0.5} />
      <pointLight position={[-50, 50, -50]} intensity={0.5} />

      {isFloorPlanMode ? (
        <>
          {/* Render ghost floors first (renderOrder 0), then selected floor on top (renderOrder 1) */}
          {Array.from({ length: selectedBuilding!.spec.numberOfFloors }, (_, i) =>
            i !== floorPlanFloor ? (
              <FloorPlanView
                key={i}
                floorIndex={i}
                spec={selectedBuilding!.spec}
                opacity={0.06}
              />
            ) : null
          )}
          <FloorPlanView
            key={`selected-${floorPlanFloor}`}
            floorIndex={floorPlanFloor!}
            spec={selectedBuilding!.spec}
            opacity={1}
          />

          {/* Camera animator that transitions to floor height */}
          <FloorCameraAnimator
            floorIndex={floorPlanFloor!}
            floorHeight={selectedBuilding!.spec.floorHeight}
            controlsRef={floorPlanControlsRef}
          />

          {/* Full 3D orbit controls for floor plan — no angle restriction */}
          <OrbitControls
            ref={floorPlanControlsRef}
            enableDamping
            dampingFactor={0.05}
            minDistance={5}
            maxDistance={150}
          />
        </>
      ) : (
        <>
          {/* Invisible grid plane for click detection */}
          <mesh
            ref={gridPlaneRef}
            name="click-detection-plane"
            userData={{ excludeFromExport: true }}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
            onClick={handleGridClick}
            onPointerMove={handlePointerMove}
            visible={false}
          >
            <planeGeometry args={[1000, 1000]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>

          {/* Grid */}
          <group name="grid-helper" userData={{ excludeFromExport: true }}>
            <Grid
              position={[0, -0.01, 0]}
              args={[100, 100]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#a0a0a0"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#707070"
              fadeDistance={100}
              fadeStrength={1}
              infiniteGrid
            />
          </group>

          {/* Ghost building preview */}
          {placementMode && ghostPosition && (
            <group position={[ghostPosition.x, ghostPosition.y + (DEFAULT_BUILDING_SPEC.floorHeight * DEFAULT_BUILDING_SPEC.numberOfFloors) / 2, ghostPosition.z]}>
              <mesh>
                <boxGeometry args={[DEFAULT_BUILDING_SPEC.width, DEFAULT_BUILDING_SPEC.floorHeight * DEFAULT_BUILDING_SPEC.numberOfFloors, DEFAULT_BUILDING_SPEC.depth]} />
                <meshStandardMaterial color={isSnapped ? "#22c55e" : "#3b82f6"} transparent opacity={0.4} />
              </mesh>
            </group>
          )}

          {/* Buildings */}
          {buildings.map((building) => (
            <BuildingWrapper
              key={building.id}
              building={building}
              isSelected={building.id === selectedBuildingId}
              onSelect={() => selectBuilding(building.id)}
            />
          ))}

          {/* Controls */}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={10}
            maxDistance={200}
          />
        </>
      )}
    </>
  );
}

interface SceneProps {
  sceneRef?: React.MutableRefObject<THREE.Scene | null>;
}

export function Scene({ sceneRef }: SceneProps) {
  return (
    <div className="w-full h-full bg-sky-100">
      <Canvas
        camera={{ position: [30, 30, 30], fov: 50 }}
        gl={{
          preserveDrawingBuffer: true,
          alpha: false,
          toneMapping: THREE.NoToneMapping,  // Prevent darkening of textures
        }}
        scene={{ background: new THREE.Color('#ffffff') }}
        style={{ background: '#ffffff' }}
      >
        <SceneContent sceneRef={sceneRef} />
      </Canvas>
    </div>
  );
}
