import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';

export type OrbState = 'idle' | 'thinking' | 'investigating' | 'executing' | 'verified' | 'error';

interface AiAgentOrbProps {
  state?: OrbState;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  sublabel?: string;
  showDetails?: boolean;
}

export const AiAgentOrb: React.FC<AiAgentOrbProps> = ({
  state = 'idle',
  size = 'md',
  label,
  sublabel,
  showDetails = true,
}) => {
  const sizeMap = {
    sm: { container: 'h-10 w-10', core: 'h-5 w-5', ring: 'h-9 w-9', orbit: 16 },
    md: { container: 'h-20 w-20', core: 'h-10 w-10', ring: 'h-18 w-18', orbit: 32 },
    lg: { container: 'h-32 w-32', core: 'h-16 w-16', ring: 'h-28 w-28', orbit: 48 },
  };

  const currentSize = sizeMap[size];

  // Core color mapping
  const coreGlow = {
    idle: 'bg-gradient-to-tr from-teal-500/80 via-emerald-400/90 to-cyan-300 shadow-[0_0_25px_rgba(20,184,166,0.35)]',
    thinking: 'bg-gradient-to-tr from-[#ff5733] via-amber-400 to-teal-400 shadow-[0_0_30px_rgba(255,87,51,0.45)]',
    investigating: 'bg-gradient-to-tr from-[#ff5733] via-purple-500 to-teal-400 shadow-[0_0_35px_rgba(168,85,247,0.4)]',
    executing: 'bg-gradient-to-tr from-cyan-400 via-teal-400 to-[#ff5733] shadow-[0_0_35px_rgba(45,212,191,0.5)]',
    verified: 'bg-gradient-to-tr from-teal-400 to-emerald-300 shadow-[0_0_40px_rgba(20,184,166,0.7)]',
    error: 'bg-gradient-to-tr from-rose-500 to-[#ff5733] shadow-[0_0_35px_rgba(244,63,94,0.6)]',
  };

  const stateLabels: Record<OrbState, { title: string; desc: string }> = {
    idle: { title: 'Agent Autonomous & Ready', desc: 'Monitoring digital chain of custody' },
    thinking: { title: 'Reasoning across data sources', desc: 'Synthesizing evidence and weights' },
    investigating: { title: 'Investigating Discrepancy', desc: 'Querying Smart Hub & MRF telemetry' },
    executing: { title: 'Executing Authorized Plan', desc: 'Running certified tool operations' },
    verified: { title: 'Recovery Verified & Sealed', desc: 'Ledger cryptographically reconciled' },
    error: { title: 'Anomaly Flagged', desc: 'Discrepancy exceeds safe tolerance' },
  };

  return (
    <div className="flex items-center gap-4">
      {/* Animated Orb Container */}
      <div className={`relative flex items-center justify-center ${currentSize.container}`}>
        {/* Outer ambient glow */}
        <motion.div
          animate={{
            scale: state === 'verified' ? [1, 1.25, 1] : state === 'executing' ? [1, 1.15, 1] : [1, 1.08, 1],
            opacity: state === 'idle' ? [0.4, 0.7, 0.4] : [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: state === 'thinking' ? 1.5 : 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute inset-0 rounded-full blur-xl pointer-events-none ${
            state === 'verified'
              ? 'bg-teal-500/40'
              : state === 'error'
              ? 'bg-rose-500/40'
              : state === 'investigating'
              ? 'bg-purple-500/30'
              : 'bg-[#ff5733]/25'
          }`}
        />

        {/* Outer Rotating Ring (Active during thinking/investigating/executing) */}
        <motion.div
          animate={{
            rotate: state === 'thinking' ? 360 : state === 'investigating' ? -360 : 360,
          }}
          transition={{
            duration: state === 'thinking' ? 6 : state === 'investigating' ? 4 : 18,
            repeat: Infinity,
            ease: 'linear',
          }}
          className={`absolute rounded-full border border-dashed border-teal-400/40 ${currentSize.ring}`}
        />

        {/* Orbiting particles for Investigating / Executing */}
        {(state === 'investigating' || state === 'executing' || state === 'thinking') && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="absolute h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]"
              style={{ transform: `translateY(-${currentSize.orbit}px)` }}
            />
            <div
              className="absolute h-1.5 w-1.5 rounded-full bg-[#ff5733] shadow-[0_0_8px_#ff5733]"
              style={{ transform: `translateX(${currentSize.orbit}px)` }}
            />
          </motion.div>
        )}

        {/* Inner Core Orb */}
        <motion.div
          animate={{
            y: state === 'idle' ? [-2, 2, -2] : [0, 0, 0],
            scale: state === 'verified' ? [1, 1.1, 1] : state === 'thinking' ? [0.95, 1.05, 0.95] : [1, 1.04, 1],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`relative rounded-full flex items-center justify-center transition-colors duration-500 ${currentSize.core} ${coreGlow[state]}`}
        >
          {state === 'verified' ? (
            <CheckCircle2 className="h-4 w-4 text-slate-950 font-black animate-pulse" />
          ) : state === 'error' ? (
            <AlertTriangle className="h-4 w-4 text-white" />
          ) : state === 'thinking' ? (
            <Sparkles className="h-4 w-4 text-slate-950" />
          ) : (
            <Cpu className="h-4 w-4 text-slate-950" />
          )}
        </motion.div>
      </div>

      {/* Optional Side Label Details */}
      {showDetails && (
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-white tracking-tight">
              {label || stateLabels[state].title}
            </h4>
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                state === 'verified'
                  ? 'bg-teal-400'
                  : state === 'error'
                  ? 'bg-rose-400'
                  : state === 'thinking'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-teal-400 animate-pulse'
              }`}
            />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {sublabel || stateLabels[state].desc}
          </p>
        </div>
      )}
    </div>
  );
};
