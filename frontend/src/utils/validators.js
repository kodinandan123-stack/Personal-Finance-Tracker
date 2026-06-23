/**
 * Validates that a value is a positive number.
  * @param {*} value
   * @returns {string|null} Error message or null if valid.
    */
export function validateAmount(value) {
  if (value === '' || value === null || value === undefined) {
        return 'Amount is required.';
  }
    const num = Number(value);
  if (isNaN(num)) return 'Amount must be a number.';
  if (num <= 0) return 'Amount must be greater than zero.';
    return null;
}

  /**
   * Validates an email address format.
    * @param {string} email
     * @returns {string|null}
      */
  export function validateEmail(email) {
    if (!email || !email.trim()) return 'Email is required.';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email.trim())) return 'Please enter a valid email address.';
      return null;
  }

    /**
     * Validates a password meets minimum requirements.
      * @param {string} password
       * @returns {string|null}
        */
    export function validatePassword(password) {
      if (!password) return 'Password is required.';
      if (password.length < 8) return 'Password must be at least 8 characters.';
        return null;
    }

      /**
       * Validates that two password fields match.
        * @param {string} password
         * @param {string} confirmPassword
          * @returns {string|null}
           */
      export function validatePasswordMatch(password, confirmPassword) {
        if (!confirmPassword) return 'Please confirm your password.';
        if (password !== confirmPassword) return 'Passwords do not match.';
            return null;
          }

          /**
           * Validates a required text field.
            * @param {string} value
             * @param {string} fieldName
              * @returns {string|null}
               */
          export function validateRequired(value, fieldName = 'This field') {
            if (!value || !String(value).trim()) return `${fieldName} is required.`;
              return null;
          }
