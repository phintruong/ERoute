import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import type { BuildingSpecification } from '@/lib/editor/types/buildingSpec';
import { ROOM_TYPES } from '@/lib/editor/floorplan/roomTypes';
import { generateFloorPlan } from '@/lib/editor/floorplan/layoutAlgorithm';
import type { FloorPlanLayout, PlacedRoom } from '@/lib/editor/floorplan/layoutAlgorithm';

const WALL_HEIGHT = 2.5;

function OuterWalls({ layout }: { layout: FloorPlanLayout }) {
  const { totalWidth, totalDepth, wallThickness } = layout;
  const wallColor = layout.wallColor;
  const halfHeight = WALL_HEIGHT / 2;

  return (
    <group>
      {/* Front wall */}
      <mesh position={[totalWidth / 2, halfHeight, 0]}>
        <boxGeometry args={[totalWidth, WALL_HEIGHT, wallThickness]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      {/* Back wall */}
      <mesh position={[totalWidth / 2, halfHeight, totalDepth]}>
        <boxGeometry args={[totalWidth, WALL_HEIGHT, wallThickness]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      {/* Left wall */}
      <mesh position={[0, halfHeight, totalDepth / 2]}>
        <boxGeometry args={[wallThickness, WALL_HEIGHT, totalDepth]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      {/* Right wall */}
      <mesh position={[totalWidth, halfHeight, totalDepth / 2]}>
        <boxGeometry args={[wallThickness, WALL_HEIGHT, totalDepth]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
    </group>
  );
}

function RoomDividers({ layout }: { layout: FloorPlanLayout }) {
  const { rooms, wallThickness, wallColor } = layout;
  const halfHeight = WALL_HEIGHT / 2;

  // Build inner walls between adjacent rooms
  const walls: { x: number; z: number; w: number; d: number }[] = [];

  for (const room of rooms) {
    // Right wall of each room (vertical divider)
    const rightX = room.x + room.width;
    walls.push({
      x: rightX + wallThickness / 2,
      z: room.z + room.depth / 2,
      w: wallThickness,
      d: room.depth,
    });

    // Bottom wall of each room (horizontal divider)
    const bottomZ = room.z + room.depth;
    walls.push({
      x: room.x + room.width / 2,
      z: bottomZ + wallThickness / 2,
      w: room.width,
      d: wallThickness,
    });
  }

  return (
    <group>
      {walls.map((wall, i) => (
        <mesh key={i} position={[wall.x, halfHeight, wall.z]}>
          <boxGeometry args={[wall.w, WALL_HEIGHT, wall.d]} />
          <meshStandardMaterial color={wallColor} opacity={0.7} transparent />
        </mesh>
      ))}
    </group>
  );
}

function RoomLabel({ room }: { room: PlacedRoom }) {
  return (
    <Text
      position={[room.x + room.width / 2, 0.02, room.z + room.depth / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
      fontSize={0.4}
      color="#9ca3af"
      anchorX="center"
      anchorY="middle"
    >
      {`#${room.index + 1}`}
    </Text>
  );
}

interface FloorPlanViewProps {
  roomType: string;
  spec: BuildingSpecification;
}

export function FloorPlanView({ roomType, spec }: FloorPlanViewProps) {
  const layout = useMemo(() => {
    const roomDef = ROOM_TYPES.find((r) => r.id === roomType);
    if (!roomDef) return null;
    const count = roomDef.getCount(spec);
    return generateFloorPlan(roomDef, count);
  }, [roomType, spec]);

  if (!layout || layout.rooms.length === 0) return null;

  return (
    <group position={[-layout.totalWidth / 2, 0, -layout.totalDepth / 2]}>
      {/* Floor plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[layout.totalWidth / 2, -0.01, layout.totalDepth / 2]}
      >
        <planeGeometry args={[layout.totalWidth, layout.totalDepth]} />
        <meshStandardMaterial color={layout.floorColor} />
      </mesh>

      {/* Outer walls */}
      <OuterWalls layout={layout} />

      {/* Inner room dividers */}
      <RoomDividers layout={layout} />

      {/* Furniture blocks */}
      {layout.rooms.flatMap((room) =>
        room.furniture.map((f, fi) => (
          <mesh
            key={`${room.index}-${fi}`}
            position={[f.x + f.width / 2, f.height / 2, f.z + f.depth / 2]}
          >
            <boxGeometry args={[f.width, f.height, f.depth]} />
            <meshStandardMaterial color={f.color} />
          </mesh>
        ))
      )}

      {/* Room number labels */}
      {layout.rooms.map((room) => (
        <RoomLabel key={`label-${room.index}`} room={room} />
      ))}
    </group>
  );
}
