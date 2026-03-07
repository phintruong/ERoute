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
      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
        Simulation Results
      </h3>
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-3 py-2 font-bold text-slate-600 uppercase">Hospital</th>
              <th className="text-right px-2 py-2 font-bold text-slate-600 uppercase">Before</th>
              <th className="text-right px-2 py-2 font-bold text-slate-600 uppercase">After</th>
              <th className="text-right px-3 py-2 font-bold text-slate-600 uppercase">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-2 font-medium text-slate-800 truncate max-w-[120px]">{row.name}</td>
                <td className="text-right px-2 py-2 text-slate-600">{row.before}%</td>
                <td className="text-right px-2 py-2 text-slate-600">{row.after}%</td>
                <td className={`text-right px-3 py-2 font-bold ${
                  row.delta < 0 ? 'text-green-600' : row.delta > 0 ? 'text-red-600' : 'text-slate-400'
                }`}>
                  {row.delta > 0 ? '+' : ''}{row.delta}%
                </td>
              </tr>
            ))}
            {result.after['proposed'] !== undefined && (
              <tr className="bg-blue-50 border-t border-blue-200">
                <td className="px-3 py-2 font-bold text-blue-800">Proposed ER</td>
                <td className="text-right px-2 py-2 text-slate-400">—</td>
                <td className="text-right px-2 py-2 font-bold text-blue-700">{result.after['proposed']}%</td>
                <td className="text-right px-3 py-2 text-blue-600 font-bold">New</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
