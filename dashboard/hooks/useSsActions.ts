import { useState, useCallback } from "react";

export function useSsActions() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSaveEdit = useCallback(async (form: any, onSuccess: () => void) => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 500);
  }, []);

  return { error, loading, handleSaveEdit, setError };
}
