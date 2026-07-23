import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import useFormValidation from './useFormValidation';

const validate = (values) => {
  const errors = {};
  if (!values.email) errors.email = 'Email is required';
  if (!values.password || values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  return errors;
};

describe('useFormValidation', () => {
  it('initializes with the given values and no touched fields', () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: '', password: '' }, validate)
    );

    expect(result.current.values).toEqual({ email: '', password: '' });
    expect(result.current.touched).toEqual({});
    expect(result.current.isValid).toBe(false);
  });

  it('reports isValid true when there are no validation errors', () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: 'a@b.com', password: 'secret1' }, validate)
    );

    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it('updates values on handleChange', () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: '', password: '' }, validate)
    );

    act(() => {
      result.current.handleChange({ target: { name: 'email', value: 'test@example.com', type: 'text' } });
    });

    expect(result.current.values.email).toBe('test@example.com');
  });

  it('handles checkbox inputs using the checked property', () => {
    const { result } = renderHook(() =>
      useFormValidation({ agree: false }, () => ({}))
    );

    act(() => {
      result.current.handleChange({ target: { name: 'agree', type: 'checkbox', checked: true } });
    });

    expect(result.current.values.agree).toBe(true);
  });

  it('marks a field as touched on handleBlur', () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: '' }, validate)
    );

    act(() => {
      result.current.handleBlur({ target: { name: 'email' } });
    });

    expect(result.current.touched).toEqual({ email: true });
  });

  it('calls onSubmit with values when the form is valid', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useFormValidation({ email: 'a@b.com', password: 'secret1' }, validate)
    );

    const preventDefault = vi.fn();
    act(() => {
      result.current.handleSubmit(onSubmit)({ preventDefault });
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret1' });
  });

  it('does not call onSubmit and touches all fields when invalid', () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useFormValidation({ email: '', password: '' }, validate)
    );

    act(() => {
      result.current.handleSubmit(onSubmit)({ preventDefault: () => {} });
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.touched).toEqual({ email: true, password: true });
  });

  it('resets the form to its initial values and clears touched state', () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: '', password: '' }, validate)
    );

    act(() => {
      result.current.handleChange({ target: { name: 'email', value: 'changed@example.com', type: 'text' } });
      result.current.handleBlur({ target: { name: 'email' } });
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values).toEqual({ email: '', password: '' });
    expect(result.current.touched).toEqual({});
  });
});
