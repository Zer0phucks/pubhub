import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const result = cn('base-class', true && 'conditional-class', false && 'should-not-appear');
    expect(result).toContain('base-class');
    expect(result).toContain('conditional-class');
    expect(result).not.toContain('should-not-appear');
  });

  it('should merge conflicting tailwind classes correctly', () => {
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle undefined and null values', () => {
    const result = cn('class-1', undefined, null, 'class-2');
    expect(result).toContain('class-1');
    expect(result).toContain('class-2');
  });

  it('should handle array of classes', () => {
    const result = cn(['class-1', 'class-2']);
    expect(result).toContain('class-1');
    expect(result).toContain('class-2');
  });

  it('should handle object with boolean values', () => {
    const result = cn({
      'class-1': true,
      'class-2': false,
      'class-3': true,
    });
    expect(result).toContain('class-1');
    expect(result).not.toContain('class-2');
    expect(result).toContain('class-3');
  });
});
