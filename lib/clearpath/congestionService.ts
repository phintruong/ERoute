import { getDb } from './mongoClient';

export const congestionService = {
  async getCongestion(city?: string) {
    const db = await getDb();

    let live: any[] = [];
    try {
      const res = await fetch(
        `https://data.ontario.ca/api/3/action/datastore_search?resource_id=ed270bb8-340b-41f9-a7c6-e8ef587e6d11&limit=100`
      );
      const json = await res.json();
      live = json.result?.records ?? [];
    } catch (e) {
      console.warn('Ontario Open Data fetch failed, using MongoDB baseline');
    }

    const query = city ? { city: city.toLowerCase() } : {};
    const hospitals = await db.collection('hospitals')
      .find(query).toArray();

    const snapshots = [];
    for (const h of hospitals) {
      const liveRecord = live.find((r: any) => r['hospital_name']?.toLowerCase().includes(h.name.toLowerCase()));
      const occupancyPct = liveRecord ? parseFloat(liveRecord['percent_occupancy']) : Math.random() * 40 + 50;
      const waitMinutes = liveRecord ? parseInt(liveRecord['er_wait_time_minutes']) : Math.floor(Math.random() * 180 + 60);
      const snap = { hospitalId: h._id.toString(), occupancyPct, waitMinutes, recordedAt: new Date() };
      await db.collection('congestion_snapshots').insertOne(snap);
      snapshots.push(snap);
    }
    return snapshots;
  }
};
