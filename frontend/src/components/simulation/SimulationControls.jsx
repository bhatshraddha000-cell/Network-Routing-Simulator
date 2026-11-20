import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap,
  Gauge,
  CheckCircle2,
} from 'lucide-react';

export const SimulationControls = ({
  isPlaying,
  currentStepIndex,
  totalSteps,
  playbackSpeed,
  isCompleted,
  onPlay,
  onPause,
  onNextStep,
  onPreviousStep,
  onReset,
  onRestart,
  onSpeedChange,
}) => {
  const progressPercent = totalSteps > 0
    ? Math.round(((currentStepIndex + 1) / totalSteps) * 100)
    : 0;

  const isAtStart = currentStepIndex === 0;
  const isAtEnd = totalSteps > 0 && currentStepIndex >= totalSteps - 1;

  const speeds = [0.5, 1.0, 1.5, 2.0];

  return (
    <div className="bg-[#111C2F] border-t border-[#24344D] p-4 select-none space-y-3.5 shadow-2xl">
      {/* Progress Bar & Step Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-[#F8FAFC] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#38BDF8] fill-current" />
              Dijkstra Step-by-Step Simulation
            </span>
            <span className="text-xs font-mono font-bold text-[#38BDF8] bg-[#19263A] px-2.5 py-0.5 rounded border border-[#24344D]">
              Step {totalSteps > 0 ? currentStepIndex + 1 : 0} of {totalSteps}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {isCompleted && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed
              </span>
            )}
            <span className="text-sm font-mono font-bold text-[#94A3B8]">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-2 bg-[#0B1220] rounded-full overflow-hidden border border-[#24344D]/80">
          <div
            className="h-full bg-gradient-to-r from-[#38BDF8] to-[#22C55E] transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Playback Buttons & Speed Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Playback action buttons */}
        <div className="flex items-center gap-2">
          {/* Reset button */}
          <button
            type="button"
            onClick={onReset}
            disabled={isAtStart}
            className={`p-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${isAtStart
                ? 'bg-[#19263A]/40 border-[#24344D] text-slate-600 cursor-not-allowed'
                : 'bg-[#19263A] hover:bg-[#24344D] text-[#94A3B8] hover:text-[#F8FAFC] border-[#24344D]'
              }`}
            title="Reset to step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Previous Step */}
          <button
            type="button"
            onClick={onPreviousStep}
            disabled={isAtStart}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${isAtStart
                ? 'bg-[#19263A]/40 border-[#24344D] text-slate-600 cursor-not-allowed'
                : 'bg-[#19263A] hover:bg-[#24344D] text-[#F8FAFC] border-[#24344D] active:scale-95'
              }`}
            title="Step backward"
          >
            <SkipBack className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Play / Pause Toggle */}
          {isPlaying ? (
            <button
              type="button"
              onClick={onPause}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              title="Pause animation"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={isAtEnd ? onRestart : onPlay}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 font-bold text-sm shadow-md shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
              title={isAtEnd ? 'Restart from beginning' : 'Play animation'}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isAtEnd ? 'Replay' : 'Play'}</span>
            </button>
          )}

          {/* Next Step */}
          <button
            type="button"
            onClick={onNextStep}
            disabled={isAtEnd}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${isAtEnd
                ? 'bg-[#19263A]/40 border-[#24344D] text-slate-600 cursor-not-allowed'
                : 'bg-[#19263A] hover:bg-[#24344D] text-[#F8FAFC] border-[#24344D] active:scale-95'
              }`}
            title="Step forward"
          >
            <span>Next</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <Gauge className="w-4 h-4 text-[#38BDF8]" />
            <span className="font-semibold">Speed:</span>
          </div>
          <div className="flex rounded-lg bg-[#0B1220] p-1 border border-[#24344D]">
            {speeds.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSpeedChange(s)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${playbackSpeed === s
                    ? 'bg-[#19263A] text-[#38BDF8] shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
