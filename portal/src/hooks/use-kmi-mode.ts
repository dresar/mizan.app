import { useState, useEffect } from 'react';

/**
 * Hook to manage KMI Data Mode (Real API vs Beta Mock)
 * Persisted in localStorage for convenience.
 */
export function useKMIMode() {
  // Permanently set to Beta (mock) mode for pure frontend demo
  const isBetaMode = true;

  const toggleMode = () => {
    // No-op for demo
    console.log('Mode toggle is disabled for this standalone demo.');
  };

  return { isBetaMode, toggleMode };
}
