import { useState, useEffect, useRef, useCallback } from 'react';

const SPEED_INTERVALS = {
  0.5: 1600,
  1.0: 900,
  1.5: 500,
  2.0: 250,
};

export const useAlgorithmSimulation = (snapshots = []) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const timerRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const totalSteps = snapshots.length;
  const isAtEnd = totalSteps > 0 && currentStepIndex >= totalSteps - 1;

  // Clear running timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Pause playback
  const pause = useCallback(() => {
    setIsPlaying(false);
    clearTimer();
  }, [clearTimer]);

  // Advance by one step
  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev < totalSteps - 1) {
        return prev + 1;
      }
      pause();
      return prev;
    });
  }, [totalSteps, pause]);

  // Move back by one step
  const previousStep = useCallback(() => {
    pause();
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, [pause]);

  // Direct jump to a specific step
  const goToStep = useCallback(
    (index) => {
      pause();
      const clamped = Math.max(0, Math.min(totalSteps - 1, index));
      setCurrentStepIndex(clamped);
    },
    [totalSteps, pause]
  );

  // Reset to step 0
  const resetSimulation = useCallback(() => {
    pause();
    setCurrentStepIndex(0);
  }, [pause]);

  // Restart from step 0 and start playing
  const restartSimulation = useCallback(() => {
    clearTimer();
    setCurrentStepIndex(0);
    setIsPlaying(true);
  }, [clearTimer]);

  // Start playback
  const play = useCallback(() => {
    if (totalSteps === 0) return;
    if (currentStepIndex >= totalSteps - 1) {
      restartSimulation();
      return;
    }
    setIsPlaying(true);
  }, [totalSteps, currentStepIndex, restartSimulation]);

  // Change playback speed safely without restarting
  const changeSpeed = useCallback((speed) => {
    setPlaybackSpeed(speed);
  }, []);

  // Timer loop effect
  useEffect(() => {
    if (!isPlaying) {
      clearTimer();
      return;
    }

    if (currentStepIndex >= totalSteps - 1) {
      setIsPlaying(false);
      clearTimer();
      return;
    }

    const interval = SPEED_INTERVALS[playbackSpeed] || 900;

    timerRef.current = setTimeout(() => {
      setCurrentStepIndex((prev) => {
        if (prev < totalSteps - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, interval);

    return () => clearTimer();
  }, [isPlaying, currentStepIndex, totalSteps, playbackSpeed, clearTimer]);

  // When snapshots array changes (e.g. fresh calculation or graph reset), reset state
  useEffect(() => {
    pause();
    setCurrentStepIndex(0);
  }, [snapshots.length, pause]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const currentSnapshot = snapshots[currentStepIndex] || null;

  return {
    currentSnapshot,
    currentStepIndex,
    totalSteps,
    isPlaying,
    playbackSpeed,
    isAtEnd,
    play,
    pause,
    nextStep,
    previousStep,
    goToStep,
    resetSimulation,
    restartSimulation,
    setSpeed: changeSpeed,
  };
};

