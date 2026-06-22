import { useCallback, useState } from 'react';

/**
 * Manages a boolean piece of state with convenient helpers.
 *
 * Cuts down on repetitive useState boilerplate for things like
 * modals, dropdowns, and "show more" sections.
 *
 * @param {boolean} [initialValue=false] - Starting value.
 * @returns {{ value: boolean, toggle: Function, setOn: Function, setOff: Function, setValue: Function }}
 */
export default function useToggle(initialValue = false) {
  const [value, setValue] = useState(Boolean(initialValue));

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setOn = useCallback(() => setValue(true), []);
  const setOff = useCallback(() => setValue(false), []);

  return { value, toggle, setOn, setOff, setValue };
}
