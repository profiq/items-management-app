import { describe, expect, it } from 'vitest';
import { generateSubTestId } from './generateSubTestId';

describe('Testing generating sub test IDs', () => {
  it('should return valid subids', () => {
    const root_id = 'root_id';
    expect(generateSubTestId(root_id, '0')).toStrictEqual('root_id-0');
    expect(generateSubTestId(root_id, 'abcd')).toStrictEqual('root_id-abcd');
    expect(generateSubTestId(root_id, 'Fff')).toStrictEqual('root_id-Fff');
  });
  it('should return undefined', () => {
    const root_id = 'root_id';
    expect(generateSubTestId('', '')).toBeUndefined();
    expect(generateSubTestId(root_id, '')).toBeUndefined();
    expect(generateSubTestId('', '1')).toBeUndefined();
  });
});
