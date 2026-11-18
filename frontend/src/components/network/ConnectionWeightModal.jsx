import React, { useState, useEffect, useRef } from 'react';
import { ArrowRightLeft, ArrowRight, Activity, X } from 'lucide-react';

export const ConnectionWeightModal = ({
  isOpen,
  connectionData, // { source, target, sourceLabel, targetLabel }
  onConfirm,
  onCancel,
}) => {
  const [weight, setWeight] = useState('5');
  const [direction, setDirection] = useState('BIDIRECTIONAL');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setWeight('5');
      setDirection('BIDIRECTIONAL');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen || !connectionData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numWeight = parseFloat(weight);

    if (isNaN(numWeight) || numWeight <= 0) {
      setError('Cost must be a positive number greater than 0');
      return;
    }

    // Format to max 2 decimal places
    const cleanWeight = Math.round(numWeight * 100) / 100;

    onConfirm({
      source: connectionData.source,
      target: connectionData.target,
      weight: cleanWeight,
      direction,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111C2F] border border-[#24344D] rounded-xl p-6 max-w-md w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#19263A] pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#38BDF8]" />
            <h3 className="text-base font-semibold text-[#F8FAFC]">Configure Communication Link</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Router pair preview */}
        <div className="flex items-center justify-center gap-4 py-3 px-4 bg-[#19263A] rounded-lg border border-[#24344D]">
          <div className="text-center">
            <div className="text-xs text-[#94A3B8] uppercase font-mono">From</div>
            <div className="text-sm font-bold text-[#F8FAFC]">{connectionData.sourceLabel || connectionData.source}</div>
          </div>
          <div className="flex items-center text-[#38BDF8]">
            {direction === 'BIDIRECTIONAL' ? (
              <ArrowRightLeft className="w-5 h-5" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </div>
          <div className="text-center">
            <div className="text-xs text-[#94A3B8] uppercase font-mono">To</div>
            <div className="text-sm font-bold text-[#F8FAFC]">{connectionData.targetLabel || connectionData.target}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] uppercase mb-1.5 tracking-wider">
              Communication Cost (Weight)
            </label>
            <input
              ref={inputRef}
              type="number"
              step="any"
              min="0.01"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. 5, 2.5"
              className="w-full px-3.5 py-2.5 bg-[#0B1220] border border-[#24344D] focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] rounded-lg text-[#F8FAFC] placeholder-slate-600 outline-none text-sm transition-all"
            />
            {error && <p className="text-rose-400 text-xs mt-1 font-medium">{error}</p>}
            <p className="text-[#94A3B8]/80 text-xs mt-1">
              Positive values represent transmission delay or metric distance.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] uppercase mb-1.5 tracking-wider">
              Link Direction
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection('BIDIRECTIONAL')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  direction === 'BIDIRECTIONAL'
                    ? 'bg-[#38BDF8]/15 border-[#38BDF8] text-[#38BDF8]'
                    : 'bg-[#0B1220] border-[#24344D] text-[#94A3B8] hover:border-slate-600'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4" />
                Bidirectional
              </button>
              <button
                type="button"
                onClick={() => setDirection('ONE_WAY')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  direction === 'ONE_WAY'
                    ? 'bg-[#38BDF8]/15 border-[#38BDF8] text-[#38BDF8]'
                    : 'bg-[#0B1220] border-[#24344D] text-[#94A3B8] hover:border-slate-600'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
                One-Way
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#19263A]">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#19263A] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#38BDF8] hover:bg-[#38BDF8]/90 text-slate-950 transition-all shadow-md"
            >
              Establish Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

