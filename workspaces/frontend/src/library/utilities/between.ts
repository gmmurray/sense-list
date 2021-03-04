export const isBetween = (
  input: number,
  min: number,
  max: number,
  inclusive: boolean,
): boolean => {
  if (inclusive) {
    return max >= input && input >= min;
  } else {
    return max > input && input > min;
  }
};
