'use client';

import { useBuildings } from '@/lib/editor/contexts/BuildingsContext';
import { ROOM_TYPES } from '@/lib/editor/floorplan/roomTypes';

export function FloorPlanBackButton() {
  const { floorPlanRoomType, setFloorPlanRoomType, getSelectedBuilding } = useBuildings();

  if (!floorPlanRoomType) return null;

  const roomDef = ROOM_TYPES.find((r) => r.id === floorPlanRoomType);
  const selectedBuilding = getSelectedBuilding();
  const count = selectedBuilding && roomDef ? roomDef.getCount(selectedBuilding.spec) : 0;

  return (
    <div className="absolute left-4 top-4 z-20">
      <button
        onClick={() => setFloorPlanRoomType(null)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
      >
        <span className="text-gray-500">←</span>
        <div className="text-left">
          <div className="text-sm font-semibold text-gray-800">
            {roomDef?.label ?? 'Floor Plan'}
          </div>
          <div className="text-xs text-gray-500">
            {count} {count === 1 ? 'room' : 'rooms'} · Click to return
          </div>
        </div>
      </button>
    </div>
  );
}
