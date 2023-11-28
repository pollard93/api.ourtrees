import { RequiresUpdate } from 'types/UserSelf';

/**
 * Generate a random numeric only code
 * @param length
 */
export const randomNumericCode = (length: number = 6): string =>
  Array.from(Array(length).keys())
    .map(() => Math.round(Math.random() * 9))
    .join('');

/**
 * Creates a new object with only allowed keys given
 * @param where - where input
 * @param allowedKeys
 */
export const cleanseWhereInput = <T>(where: T, allowedKeys: (keyof T)[]) => {
  if (!where) return null;

  // Extend array of keys into all possibilities
  const keys = allowedKeys.flatMap((key) => [
    `${key as string}`,
    `${key as string}_contains`,
    `${key as string}_every`,
    `${key as string}_gt`,
    `${key as string}_gte`,
    `${key as string}_in`,
    `${key as string}_lt`,
    `${key as string}_lte`,
    `${key as string}_none`,
    `${key as string}_not_in`,
    `${key as string}_not`,
    `${key as string}_some`,
  ]);

  // Create new object with only valid keys
  return Object.keys(where).reduce((res, key) => {
    if (keys.includes(key)) {
      res[key] = where[key];
    }
    return res;
  }, {} as T);
};

/**
 * Test client version is greater than the minimum given
 * @param c - client version
 * @param m - minimum version
 * @return boolean - false if client version is greater than the minimum, true if not
 */
export const requiresUpdate = (c: string, m: string): RequiresUpdate | null => {
  try {
    // If they match, no update is required
    if (c === m) return null;

    const minimum: number[] = m.split('.').map((n) => parseInt(n, 10));
    const client: number[] = c.split('.').map((n) => parseInt(n, 10));

    // Check they are both of length 3
    if (client.length !== 3 || minimum.length !== 3) return null;

    // Check if any of the 3 client numbers are smaller than their client counterparts
    // If so then return true as an update is required
    for (let i = 0; i < 3; i++) {
      if (client[i] < minimum[i]) {
        return {
          appStoreUrl: process.env.APP_STORE_URL || '',
          playStoreUrl: process.env.PLAY_STORE_URL || '',
        };
      }
    }

    // Does not require update
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * Get client url type based on stage
 */
export const getMobileClientUrl = () => {
  switch (process.env.NODE_ENV) {
    case 'staging':
      return `${process.env.CLIENT_URL_MOBILE}.beta://`;

    case 'development':
      return `${process.env.CLIENT_URL_MOBILE}.debug://`;

    default:
      return `${process.env.CLIENT_URL_MOBILE}://`;
  }
};
