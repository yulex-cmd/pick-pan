import { useState } from 'react';

const storageKey = 'pinch-pan:recipe-book:v1';

export function useRecipeBook() {
  const [initial] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const ids: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string')) {
        throw new Error('Invalid recipe book');
      }
      return { ids: [...new Set(ids)] as string[], error: '' };
    } catch {
      return { ids: [] as string[], error: 'Your recipe book could not be loaded. Browser storage may be unavailable.' };
    }
  });
  const [savedIds, setSavedIds] = useState(initial.ids);
  const [storageError, setStorageError] = useState(initial.error);

  const saveIds = (next: string[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setSavedIds(next);
      setStorageError('');
      return true;
    } catch {
      setStorageError('Could not save your change. Please allow browser storage and try again.');
      return false;
    }
  };

  return {
    savedIds,
    storageError,
    confirm: (id: string) => savedIds.includes(id) || saveIds([...savedIds, id]),
    remove: (id: string) => saveIds(savedIds.filter((saved) => saved !== id)),
  };
}