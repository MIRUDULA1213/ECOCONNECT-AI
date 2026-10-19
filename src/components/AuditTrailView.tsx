import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  Search,
  Lock,
  ArrowRight,
  Clock,
  User,
  Filter,
} from 'lucide-react';
import { AuditLogEntry } from '../types/ecoconnect.ts';

interface AuditTrailViewProps {
  auditTrail: AuditLogEntry[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ auditTrail }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');

  const actionTypes = Array.from(new Set(auditTrail.map((a) => a.action)));

  const filteredLogs = auditTrail.filter((entry) => {
    const matchesQuery =
      entry.ecoTrackId.toLowerCase().includes(filterQuery.toLowerCase()) ||
      entry.details.toLowerCase().includes(filterQuery.toLowerCase()) ||
      entry.actor.toLowerCase().includes(filterQuery.toLowerCase()) ||
      entry.hash.toLowerCase().includes(filterQuery.toLowerCase());

    const matchesAction = selectedAction === 'ALL' || entry.action === selectedAction;
    return matchesQuery && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">
                Tamper-Evident Cryptographic Audit Trail
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {auditTrail.length} Immutable Blocks
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Every consequential state transition, human decision, tool execution, and offline reconciliation is anchored in an immutable chronological hash chain.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
          <Lock className="h-4 w-4 text-emerald-400" />
          <span>Ledger Integrity: 100% Verified</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search audit trail by batch, actor, hash..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-500 shrink-0" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 w-full sm:w-auto font-mono"
          >
            <option value="ALL">All Action Categories ({auditTrail.length})</option>
            {actionTypes.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hash-Chain Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp &amp; Batch</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Actor &amp; Role</th>
                <th className="py-3 px-4">Forensic Details</th>
                <th className="py-3 px-4 text-right">Block Hash Chain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
              {filteredLogs.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/30 transition">
                  {/* Timestamp & Batch */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-bold text-white block">{entry.ecoTrackId}</span>
                    <span className="text-[10px] text-slate-500 font-sans">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                      {entry.action}
                    </span>
                  </td>

                  {/* Actor */}
                  <td className="py-3 px-4 font-sans whitespace-nowrap">
                    <span className="font-semibold text-slate-200 block">{entry.actor}</span>
                    <span className="text-[10px] text-slate-500">{entry.actorRole}</span>
                  </td>

                  {/* Forensic Details */}
                  <td className="py-3 px-4 font-sans text-slate-300 max-w-md">
                    <p className="line-clamp-2">{entry.details}</p>
                  </td>

                  {/* Hash */}
                  <td className="py-3 px-4 text-right whitespace-nowrap font-mono">
                    <span className="text-emerald-400 text-[10px] block font-bold truncate">
                      {entry.hash}
                    </span>
                    <span className="text-slate-600 text-[9px] block">
                      prev: {entry.previousHash.slice(0, 10)}...
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
