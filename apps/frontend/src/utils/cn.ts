import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// tailwind-merge must know the custom scale names in tailwind.config.js;
// otherwise it treats `text-body` (a font size) and `text-fg` (a color) as the
// same group and silently drops one of them.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display-xl', 'display-lg', 'display-md', 'title-lg', 'title-md', 'title-sm', 'body-lg', 'body', 'body-sm', 'label', 'meta', 'micro'] }],
      shadow: [{ shadow: ['hairline', 'raise', 'overlay'] }],
      rounded: [{ rounded: ['xs'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
