export type Box<T> = [T] | [];

export function unwrap<T>(xs: [T] | []): T {
  if (xs.length > 0) {
    return xs[0];
  }
  throw new Error("unwrapping empty box");
}

export function returnBox<T>(f: () => T | undefined): Box<T> {
  const x = f();
  if (x === undefined) {
    return [];
  } else {
    return [x];
  }
}
