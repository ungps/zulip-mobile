/* @flow strict-local */
import type { InputSelectionType } from '../types';

export default (textWhole: string, autocompleteText: string, selection: InputSelectionType) => {
  const { start, end } = selection;
  let remainder = '';
  let text = textWhole;
  if (start === end && start !== text.length) {
    // new letter is typed
    remainder = text.substring(start, text.length);
    text = text.substring(0, start);
  }

  const lastIndex: number = Math.max(
    text.lastIndexOf(':'),
    text.lastIndexOf('#'),
    text.lastIndexOf('@'),
  );

  let prefix = text[lastIndex] === ':' ? ':' : `${text[lastIndex]}`;
  if (text[lastIndex] === '@' && text[lastIndex + 1] === '_') {
    prefix += '_';
  }
  const suffix = text[lastIndex] === ':' ? ':' : '';

  return `${text.substring(0, lastIndex)}${prefix}${autocompleteText}${suffix} ${remainder}`;
};
