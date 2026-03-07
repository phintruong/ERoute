import type { RoomTypeDefinition } from './roomTypes';

export interface PlacedFurniture {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  label: string;
}

export interface PlacedRoom {
  x: number;
  z: number;
  width: number;
  depth: number;
  furniture: PlacedFurniture[];
  index: number;
}

export interface FloorPlanLayout {
  totalWidth: number;
  totalDepth: number;
  rooms: PlacedRoom[];
  floorColor: string;
  wallColor: string;
  wallThickness: number;
}

const WALL_THICKNESS = 0.15;
const CORRIDOR_WIDTH = 2.0;

export function generateFloorPlan(
  roomDef: RoomTypeDefinition,
  count: number
): FloorPlanLayout {
  if (count <= 0) {
    return {
      totalWidth: 0,
      totalDepth: 0,
      rooms: [],
      floorColor: roomDef.floorColor,
      wallColor: roomDef.wallColor,
      wallThickness: WALL_THICKNESS,
    };
  }

  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);

  const cellWidth = roomDef.unitWidth + WALL_THICKNESS;
  const cellDepth = roomDef.unitDepth + WALL_THICKNESS;

  const totalWidth = cols * cellWidth + WALL_THICKNESS;
  const totalDepth = rows * cellDepth + (rows > 1 ? (rows - 1) * CORRIDOR_WIDTH : 0) + WALL_THICKNESS;

  const rooms: PlacedRoom[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const roomIndex = row * cols + col;
      if (roomIndex >= count) break;

      const roomX = WALL_THICKNESS + col * cellWidth;
      const roomZ = WALL_THICKNESS + row * (cellDepth + CORRIDOR_WIDTH);

      const furniture: PlacedFurniture[] = roomDef.furniture.map((item) => ({
        x: roomX + item.relativeX,
        z: roomZ + item.relativeZ,
        width: item.width,
        depth: item.depth,
        height: item.height,
        color: item.color,
        label: item.label,
      }));

      rooms.push({
        x: roomX,
        z: roomZ,
        width: roomDef.unitWidth,
        depth: roomDef.unitDepth,
        furniture,
        index: roomIndex,
      });
    }
  }

  return {
    totalWidth,
    totalDepth,
    rooms,
    floorColor: roomDef.floorColor,
    wallColor: roomDef.wallColor,
    wallThickness: WALL_THICKNESS,
  };
}
