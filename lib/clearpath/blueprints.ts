export interface ProposedBuilding {
  id: string;
  lat: number;
  lng: number;
  rotation: number;
  blueprint: Blueprint;
}

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  glbPath: string;
  beds: number;
  /** Minimum parcel area in m² for this blueprint to fit */
  minAreaM2: number;
}

export const PRESET_BLUEPRINTS: Blueprint[] = [
  {
    id: 'small-er',
    name: 'Small ER Clinic',
    description: '50-bed emergency clinic',
    glbPath: '/map-data/blueprints/small-er.glb',
    beds: 50,
    minAreaM2: 100,
  },
  {
    id: 'medium-hospital',
    name: 'Medium Hospital',
    description: '150-bed regional hospital',
    glbPath: '/map-data/blueprints/medium-hospital.glb',
    beds: 150,
    minAreaM2: 400,
  },
  {
    id: 'large-complex',
    name: 'Large Medical Complex',
    description: '400-bed full-service hospital',
    glbPath: '/map-data/blueprints/large-complex.glb',
    beds: 400,
    minAreaM2: 800,
  },
];

/** Build a Blueprint from an exported building returned by the editor API. */
export function createBlueprintFromBuilding(building: {
  id: string;
  name: string;
  beds: number;
  publicPath: string;
  metadata?: { groundFloorArea?: number } | null;
}): Blueprint {
  return {
    id: `custom-${building.id}`,
    name: building.name || 'Custom Building',
    description: `${building.beds}-bed custom design`,
    glbPath: building.publicPath,
    beds: building.beds,
    minAreaM2: building.metadata?.groundFloorArea ?? 100,
  };
}

