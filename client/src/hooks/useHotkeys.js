import { useEffect, useCallback } from 'react';

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export const useHotkeys = (keyMap, deps = []) => {
  const handleKeyPress = useCallback((event) => {
    const { key, ctrlKey, metaKey, altKey, shiftKey } = event;

    // Check each hotkey combination in the keyMap
    Object.entries(keyMap).forEach(([combination, callback]) => {
      const keys = combination.toLowerCase().split('+');
      const mainKey = keys[keys.length - 1];
      
      const requiresCtrl = keys.includes('ctrl');
      const requiresMeta = keys.includes('meta') || keys.includes('cmd');
      const requiresAlt = keys.includes('alt');
      const requiresShift = keys.includes('shift');

      // Check if the pressed key combination matches
      if (
        key.toLowerCase() === mainKey.toLowerCase() &&
        ((requiresCtrl && ctrlKey) || (!requiresCtrl && !ctrlKey)) &&
        ((requiresMeta && metaKey) || (!requiresMeta && !metaKey)) &&
        ((requiresAlt && altKey) || (!requiresAlt && !altKey)) &&
        ((requiresShift && shiftKey) || (!requiresShift && !shiftKey))
      ) {
        event.preventDefault();
        callback(event);
      }
    });
  }, [keyMap]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress, ...deps]);
};

// Helper function to format hotkey combinations for display
export const formatHotkey = (combination) => {
  const keys = combination.toLowerCase().split('+');
  return keys
    .map(key => {
      switch (key) {
        case 'ctrl':
          return isMac ? '⌃' : 'Ctrl';
        case 'meta':
        case 'cmd':
          return isMac ? '⌘' : 'Win';
        case 'alt':
          return isMac ? '⌥' : 'Alt';
        case 'shift':
          return isMac ? '⇧' : 'Shift';
        default:
          return key.charAt(0).toUpperCase() + key.slice(1);
      }
    })
    .join(' + ');
};

// Example usage:
/*
const NoteEditor = () => {
  const handleSave = useCallback(() => {
    // Save note logic
  }, []);

  const handleNew = useCallback(() => {
    // Create new note logic
  }, []);

  useHotkeys({
    'ctrl+s': handleSave,
    'ctrl+n': handleNew,
    'ctrl+shift+s': () => {
      // Save as logic
    }
  }, [handleSave, handleNew]);

  return (
    <div>
      <p>Press {formatHotkey('ctrl+s')} to save</p>
      <p>Press {formatHotkey('ctrl+n')} to create new note</p>
    </div>
  );
};
*/

export default useHotkeys;
