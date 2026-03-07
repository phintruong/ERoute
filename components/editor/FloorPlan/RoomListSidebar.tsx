'use client';

import { useBuildings } from '@/lib/editor/contexts/BuildingsContext';
import { ROOM_TYPES } from '@/lib/editor/floorplan/roomTypes';

export function RoomListSidebar() {
  const { getSelectedBuilding, floorPlanRoomType, setFloorPlanRoomType } = useBuildings();
  const selectedBuilding = getSelectedBuilding();

  if (!selectedBuilding) return null;

  const spec = selectedBuilding.spec;

  // Only show if building has any hospital activity
  const roomEntries = ROOM_TYPES.map((rt) => ({
    ...rt,
    count: rt.getCount(spec),
  }));

  const hasActivity = roomEntries.some((r) => r.count > 0);
  if (!hasActivity) return null;

  return (
    <div className="absolute right-4 top-4 z-20 w-56 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
        <h3 className="text-sm font-semibold text-gray-800">Floor Plans</h3>
        <p className="text-xs text-gray-500 mt-0.5">Click to view room layout</p>
      </div>
      <div className="py-1">
        {roomEntries.map((room) => {
          const isActive = floorPlanRoomType === room.id;
          const isDisabled = room.count === 0;

          return (
            <button
              key={room.id}
              disabled={isDisabled}
              onClick={() => setFloorPlanRoomType(isActive ? null : room.id)}
              className={`w-full text-left px-4 py-2.5 transition-colors ${
                isActive
                  ? 'bg-blue-50 border-l-2 border-blue-500'
                  : isDisabled
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-gray-50 border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                  {room.label}
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {room.count}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{room.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
