import { useState, useCallback } from 'react';

/**
 * useFormValidation
 *
 * A generic form validation hook.
 * Pass in initial field values and a validate function that returns
 * an errors object. The hook tracks touched fields and exposes helpers
 * to drive any controlled form.
 *
 * @param {Object} initialValues - Initial values for all form fields.
 * @param {(values: Object) => Object} validate - Returns { field: errorMsg } for invalid fields.
 * @returns {{
 *   values: Object,
 *   errors: Object,
 *   touched: Object,
 *   isValid: boolean,
 *   handleChange: Function,
 *   handleBlur: Function,
 *   handleSubmit: Function,
 *   resetForm: Function,
 * }}
 */
function useFormValidation(initialValues, validate) {
    const [values, setValues] = useState(initialValues);
    const [touched, setTouched] = useState({});

  const errors = validate ? validate(values) : {};
    const isValid = Object.keys(errors).length === 0;

  const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setValues((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
        }));
  }, []);

  const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = useCallback(
        (onSubmit) => (e) => {
                e.preventDefault();
                const allTouched = Object.keys(values).reduce(
                          (acc, key) => ({ ...acc, [key]: true }),
                  {}
                        );
                setTouched(allTouched);
                if (Object.keys(validate ? validate(values) : {}).length === 0) {
                          onSubmit(values);
                }
        },
        [values, validate]
      );

  const resetForm = useCallback(() => {
        setValues(initialValues);
        setTouched({});
  }, [initialValues]);

  return { values, errors, touched, isValid, handleChange, handleBlur, handleSubmit, resetForm };
}

export default useFormValidation;
