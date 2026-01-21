// This entire file exists to have something to test.

function is_int(num: number) {
  return Number.isInteger(num);
}

export function exp_in_gf(a: number, exponent: number, n: number) {
  if (!(is_int(a) && is_int(exponent) && is_int(n))) {
    throw new Error('This function only supports integers!');
  }
  if (exponent < 0) {
    throw new Error('Unsupported operation!');
  }
  if (exponent == 0) {
    return 0;
  }
  let multiplier = 1;
  while (exponent > 0) {
    if (exponent % 2) {
      multiplier = (multiplier * a) % n;
      exponent -= 1;
    }
    a = (a * a) % n;
    exponent = Math.floor(exponent / 2);
  }
  return a * multiplier;
}

export function is_prime(num: number) {
  // for testing only - could be optimized with a sieve
  if (!is_int(num)) {
    return false;
  }
  if (num <= 1) {
    return false;
  }

  for (let i = 2; i < num; i++) {
    if (num % i == 0) {
      return false;
    }
  }
  return true;
}
