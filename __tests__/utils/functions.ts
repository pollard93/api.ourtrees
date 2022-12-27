import { requiresUpdate } from '../../src/utils/functions';

test('requiresUpdate', async () => {
  /**
   * Should be false if minimum is smaller than client
   */
  expect(await requiresUpdate('2.2.2', '2.2.1')).toBeFalsy();
  expect(await requiresUpdate('2.2.2', '2.1.1')).toBeFalsy();
  expect(await requiresUpdate('2.2.2', '1.1.1')).toBeFalsy();

  /**
   * Should be false if they match
   */
  expect(await requiresUpdate('0.0.0', '0.0.0')).toBeFalsy();

  /**
   * Should be true if minimum is greater than client
   */
  expect(await requiresUpdate('2.2.2', '2.2.3')).toBeTruthy();
  expect(await requiresUpdate('2.2.2', '2.3.3')).toBeTruthy();
  expect(await requiresUpdate('2.2.2', '3.3.3')).toBeTruthy();

  /**
   * Should be null if versions cannot be parsed
   */
  expect(await requiresUpdate('0.0', '0.0.0')).toBeNull();
  expect(await requiresUpdate('0.0.0', '0.0')).toBeNull();
});
