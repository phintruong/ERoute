'use client';

interface SimulationResultPanelProps {
  result: {
    before: Record<string, number>;
    after: Record<string, number>;
    delta: Record<string, number>;
  };
  hospitals: any[];
}

export default function SimulationResultPanel({ result, hospitals }: SimulationResultPanelProps) {
  const hospitalMap: Record<string, string> = {};
  for (const h of hospitals) {
    hospitalMap[(h._id ?? h.id)?.toString()] = h.name;
  }

  const rows = Object.keys(result.before).map((id) => ({
    id,
    name: hospitalMap[id] ?? id,
    before: result.before[id],
    after: result.after[id],
    delta: result.delta[id],
  }));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          Simulation Results
        </h3>
      </div>
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-3 py-2 font-bold text-slate-500 uppercase tracking-wide">Hospital</th>
              <th className="text-right px-2 py-2 font-bold text-slate-500 uppercase tracking-wide">Before</th>
              <th className="text-right px-2 py-2 font-bold text-slate-500 uppercase tracking-wide">After</th>
              <th className="text-right px-3 py-2 font-bold text-slate-500 uppercase tracking-wide">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="px-3 py-2 font-medium text-slate-700 truncate max-w-[120px]">{row.name}</td>
                <td className="text-right px-2 py-2 text-slate-500 font-mono">{row.before}%</td>
                <td className="text-right px-2 py-2 text-slate-600 font-mono">{row.after}%</td>
                <td className={`text-right px-3 py-2 font-bold font-mono ${
                  row.delta < 0 ? 'text-green-600' : row.delta > 0 ? 'text-red-500' : 'text-slate-400'
                }`}>
                  {row.delta > 0 ? '+' : ''}{row.delta}%
                </td>
              </tr>
            ))}
            {result.after['proposed'] !== undefined && (
              <tr className="bg-blue-50/70 border-t border-blue-200">
                <td className="px-3 py-2 font-bold text-blue-800">Proposed ER</td>
                <td className="text-right px-2 py-2 text-slate-400">—</td>
                <td className="text-right px-2 py-2 font-bold text-blue-700 font-mono">{result.after['proposed']}%</td>
                <td className="text-right px-3 py-2">
                  <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-bold uppercase tracking-wide">New</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
