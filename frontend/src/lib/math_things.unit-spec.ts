import { describe, expect, it } from 'vitest';
import { exp_in_gf, is_prime } from '@/lib/math_things';
import { faker } from '@faker-js/faker';
describe('Mathematics', () => {
  it('should return error', () => {
    const float = faker.number.float();
    expect(() => exp_in_gf(float, 2, 3)).toThrow();
  });
  it('should return 25', () => {
    expect(exp_in_gf(5, 2, 26)).toBe(25);
  });
  it('should return 0', () => {
    expect(exp_in_gf(5, 2, 25)).toBe(0);
  });

  it('should return false due to decimals not being primes', () => {
    expect(is_prime(1.1)).toBe(false);
  });
  it('should return false due to 1 not being a prime', () => {
    expect(is_prime(1)).toBe(false);
  });
  it('should return false due to -1 not being a prime', () => {
    expect(is_prime(-1)).toBe(false);
  });
  it('should return false due to 4 bit being a prime', () => {
    expect(is_prime(4)).toBe(false);
  });
  it('should return true due to 2 being a prime', () => {
    expect(is_prime(2)).toBe(true);
  });
  it('should return true due to 65537 being a prime', () => {
    expect(is_prime(65537)).toBe(true);
  });
});
