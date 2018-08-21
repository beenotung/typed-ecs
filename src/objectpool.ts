import {Type} from "./ecs";

export type ObjectPool<T> = T[];

export class GroupedObjectPool<G, T> {
  pools: Map<G, ObjectPool<T>> = new Map();

  Add(group: G, object: T) {
    let pool = this.pools.get(group);
    if (!pool) {
      pool = [];
      this.pools.set(group, pool)
    }
    pool.push(object)
  }

  Remove(group: G, object: T) {
    let pool = this.pools.get(group);
    if (pool) {
      this.pools.set(group, pool.filter(x => x !== object))
    }
  }

  Get(group: G): ObjectPool<T> {
    return this.pools.get(group) || [];
  }

  Iterate(group: G, consumer: (object: T) => void) {
    let pool = this.pools.get(group);
    if (pool) {
      pool.forEach(consumer)
    }
  }
}

export class TypedObjectPool<T extends { type: Type<T> }> extends GroupedObjectPool<Type<T>, T> {
  AddTyped(object: T) {
    this.Add(object.type, object)
  }

  RemoveTyped(object: T) {
    this.Remove(object.type, object)
  }
}

/*
export type TypeObjectPool <T> = Map<any, ObjectPool<T>>;

export function newTypeObjectPool<T>(): TypeObjectPool<T> {
  return new Map();
}

export function appendTypedObjectPool<T>(typeObjectPool: TypeObjectPool<T>, type: any, object: T) {
  let pool = typeObjectPool.get(type);
  if (!pool) {
    pool = [];
    typeObjectPool.set(type, pool);
  }
  pool.push(object);
}

export function removeTypedObjectPool<T extends { type: any }>(typeObjectPool: TypeObjectPool<T>, object: T) {
  const type = object.type;
  const pool = typeObjectPool.get(type);
  if (!pool) {
    return;
  }
  typeObjectPool.set(type, pool.filter((x) => x !== object));
}

export function iterateObjectPool<T>(typeObjectPool: TypeObjectPool<T>, type: any, consumer: (t: T) => void) {
  const pool = typeObjectPool.get(type);
  if (pool) {
    pool.forEach(consumer);
  }
}
*/