import { useMemo } from 'react';
import { BuildingSpecification } from '@/lib/editor/types/buildingSpec';
import { useBuildingSound } from '@/lib/editor/hooks/useBuildingSound';

interface HospitalFormProps {
  spec: BuildingSpecification;
  onUpdate: (updates: Partial<BuildingSpecification>) => void;
}

const SLIDER_CLASS =
  'flex-4 h-4 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-12 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-400 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing';

const INPUT_CLASS =
  'flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm text-center focus:border-blue-400 focus:outline-none transition-colors duration-200';

export function HospitalForm({ spec, onUpdate }: HospitalFormProps) {
  const { play: playSound } = useBuildingSound();

  // Calculate building size metrics
  const totalFloorArea = spec.width * spec.depth * spec.numberOfFloors;
  const groundFloorArea = spec.width * spec.depth;

  // Current staff counts
  const currentDoctors = spec.hospitalDoctors ?? 0;
  const currentNurses = spec.hospitalNurses ?? 0;

  // Dynamic limits based on real-world hospital data
  // Sources: Definitive Healthcare, HFM Magazine
  // Average US hospital: 33,000 sq m, ~130 beds, 2,200-2,800 BGSF/bed (~200-260 sq m/bed)
  const limits = useMemo(() => {
    // Patient rooms: ~46 sq m per room (500 sq ft, standard patient room with circulation)
    const maxRooms = Math.max(1, Math.floor(totalFloorArea / 46));
    // Beds: ~1 per 200 sq ft (~19 sq m), accounts for multi-bed rooms
    const maxBeds = Math.max(1, Math.floor(totalFloorArea / 19));
    // Operating rooms: ~56 sq m each (600 sq ft) plus support space, ~1 per 2,000 sq m total
    const maxOperatingRooms = Math.max(1, Math.floor(totalFloorArea / 2000));
    // Emergency bays: ground floor only, ~1 per 30 sq m (~320 sq ft)
    const maxEmergencyBays = Math.max(1, Math.floor(groundFloorArea / 30));

    // Shared staff capacity pool: ~1 staff per 50 sq m (industry avg ~5 FTE per bed)
    const maxTotalStaff = Math.max(2, Math.floor(totalFloorArea / 50));
    // Doctors max = pool minus nurses already assigned
    const maxDoctors = Math.max(0, maxTotalStaff - currentNurses);
    // Nurses max = pool minus doctors already assigned
    const maxNurses = Math.max(0, maxTotalStaff - currentDoctors);

    return { maxRooms, maxDoctors, maxNurses, maxOperatingRooms, maxBeds, maxEmergencyBays, maxTotalStaff };
  }, [totalFloorArea, groundFloorArea, currentDoctors, currentNurses]);

  // Clamp values when limits shrink
  const clampedUpdate = (key: keyof BuildingSpecification, value: number, max: number) => {
    onUpdate({ [key]: Math.min(value, max) });
    playSound('resize_object');
  };

  const fields: {
    label: string;
    key: keyof BuildingSpecification;
    max: number;
    value: number;
    description: string;
  }[] = [
    {
      label: 'Patient Rooms',
      key: 'hospitalRooms',
      max: limits.maxRooms,
      value: Math.min(spec.hospitalRooms ?? 0, limits.maxRooms),
      description: 'General patient rooms across all floors',
    },
    {
      label: 'Beds',
      key: 'hospitalBeds',
      max: limits.maxBeds,
      value: Math.min(spec.hospitalBeds ?? 0, limits.maxBeds),
      description: 'Total bed capacity (including shared rooms)',
    },
    {
      label: 'Doctors',
      key: 'hospitalDoctors',
      max: limits.maxDoctors,
      value: Math.min(spec.hospitalDoctors ?? 0, limits.maxDoctors),
      description: 'Attending physicians on staff',
    },
    {
      label: 'Nurses',
      key: 'hospitalNurses',
      max: limits.maxNurses,
      value: Math.min(spec.hospitalNurses ?? 0, limits.maxNurses),
      description: 'Nursing staff on shift',
    },
    {
      label: 'Operating Rooms',
      key: 'hospitalOperatingRooms',
      max: limits.maxOperatingRooms,
      value: Math.min(spec.hospitalOperatingRooms ?? 0, limits.maxOperatingRooms),
      description: 'Surgical suites (~56 sq m each + support space)',
    },
    {
      label: 'Emergency Bays',
      key: 'hospitalEmergencyBays',
      max: limits.maxEmergencyBays,
      value: Math.min(spec.hospitalEmergencyBays ?? 0, limits.maxEmergencyBays),
      description: 'Ground-floor emergency treatment bays',
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 mb-2">Hospital Parameters</h3>

      {/* Building size summary */}
      <div className="bg-blue-50 px-4 py-3 rounded-lg border border-blue-200 space-y-1">
        <p className="text-sm text-gray-700">
          Building Size: <span className="font-bold text-blue-700">{spec.width}m x {spec.depth}m</span>
        </p>
        <p className="text-sm text-gray-700">
          Floors: <span className="font-bold text-blue-700">{spec.numberOfFloors}</span>
        </p>
        <p className="text-sm text-gray-700">
          Total Floor Area: <span className="font-bold text-blue-700">{totalFloorArea.toLocaleString()} sq m</span>
          <span className="text-gray-400 text-xs ml-1">({Math.round(totalFloorArea * 10.764).toLocaleString()} sq ft)</span>
        </p>
        <p className="text-sm text-gray-700">
          Staff Capacity: <span className="font-bold text-blue-700">{currentDoctors + currentNurses}</span>
          <span className="text-gray-500"> / {limits.maxTotalStaff}</span>
        </p>
      </div>

      {fields.map(({ label, key, max, value, description }) => (
        <div key={key} className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            {label}: <span className="text-blue-600">{value}</span>
            <span className="text-gray-400 text-xs ml-2">(max: {max})</span>
          </label>
          <p className="text-xs text-gray-500 -mt-1">{description}</p>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max={max}
              step="1"
              value={value}
              onChange={(e) => clampedUpdate(key, parseInt(e.target.value), max)}
              className={SLIDER_CLASS}
            />
            <input
              type="number"
              min="0"
              max={max}
              step="1"
              value={value}
              onChange={(e) => clampedUpdate(key, parseInt(e.target.value) || 0, max)}
              className={INPUT_CLASS}
            />
          </div>
        </div>
      ))}

      {/* Staff-to-patient ratios */}
      {(spec.hospitalRooms ?? 0) > 0 && (
        <div className="pt-4 mt-2 border-t-2 border-gray-200 space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Ratios</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <span className="text-gray-500">Beds / Room</span>
              <p className="font-bold text-gray-800">
                {(spec.hospitalRooms ?? 0) > 0
                  ? ((spec.hospitalBeds ?? 0) / (spec.hospitalRooms ?? 1)).toFixed(1)
                  : '—'}
              </p>
            </div>
            <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <span className="text-gray-500">Nurse / Bed</span>
              <p className="font-bold text-gray-800">
                {(spec.hospitalBeds ?? 0) > 0
                  ? `1 : ${((spec.hospitalBeds ?? 0) / Math.max(spec.hospitalNurses ?? 1, 1)).toFixed(1)}`
                  : '—'}
              </p>
            </div>
            <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <span className="text-gray-500">Doctor / Bed</span>
              <p className="font-bold text-gray-800">
                {(spec.hospitalBeds ?? 0) > 0
                  ? `1 : ${((spec.hospitalBeds ?? 0) / Math.max(spec.hospitalDoctors ?? 1, 1)).toFixed(1)}`
                  : '—'}
              </p>
            </div>
            <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <span className="text-gray-500">Sq m / Bed</span>
              <p className="font-bold text-gray-800">
                {(spec.hospitalBeds ?? 0) > 0
                  ? (totalFloorArea / (spec.hospitalBeds ?? 1)).toFixed(0)
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
