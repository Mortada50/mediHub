

const ALLOWED_PAIRS = [
  ["doctor", "patient"],
  ["patient", "pharmacy"],
  ["admin", "doctor"],
  ["admin", "patient"],
  ["admin", "pharmacy"],
  ["patient", "patient"],
];

/**
 * هل يُسمح لهذَين الطرفَين بالتراسل؟
 * @param {string} roleA  lowercase
 * @param {string} roleB  lowercase
 * @returns {boolean}
 */
export const canChat = (roleA, roleB) => {
  const a = roleA?.toLowerCase();
  const b = roleB?.toLowerCase();
  return ALLOWED_PAIRS.some(
    ([x, y]) => (a === x && b === y) || (a === y && b === x),
  );
};

export const chatDeniedMsg = (roleA, roleB) =>
  `غير مسموح بالتراسل بين ${roleA} و ${roleB}`;
