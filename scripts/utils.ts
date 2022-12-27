/**
 * Reduces the args from command line into an object
 */
export const reduceArgs = <T>(): T => process.argv.reduce(
  (a, c) => {
    c = c.split(':') as any; // eslint-disable-line

    if (c.length > 1) {
      a[c[0]] = c[1]; // eslint-disable-line
    }

    return a;
  },
  {},
) as T;
