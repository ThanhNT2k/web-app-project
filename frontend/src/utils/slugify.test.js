import { describe, expect, it } from 'vitest';

import { slugify } from './slugify';

describe('slugify', () => {
  it('turns a title into a URL-friendly slug', () => {
    expect(slugify('Hello World: Chapter 1')).toBe('hello-world-chapter-1');
  });

  it('removes extra separators from the beginning and end', () => {
    expect(slugify('---CMC   Truyen!!!')).toBe('cmc-truyen');
  });
});
