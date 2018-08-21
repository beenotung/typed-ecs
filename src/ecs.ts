import {Box} from "./box";
import {GroupedObjectPool, TypedObjectPool} from "./objectpool";

export type id = number;

export interface Type<T> {
  new(...args: any[]): T;
}

export interface Entity {
  id: id;
}

export interface Component<T> {
  type: Type<T>;
}

export abstract class System<T> {
  constructor(public type: Type<T>) {
  }

  public abstract run(timeElapsed: number, timeRunning: number): void;
}

export interface Event<T> {
  type: Type<T>;
}

export class EntityManager {
  public entities: Entity[] = [];

  public GetEntity(id: id): Box<Entity> {
    if (this.entities[id]) {
      return [this.entities[id]];
    } else {
      return [];
    }
  }

  public RemoveEntity(id: id) {
    delete this.entities[id];
  }

  public CreateEntity(): Entity {
    const id = this.entities.length;
    const entity: Entity = {id};
    this.entities.push(entity);
    return entity;
  }
}

export class ComponentManager {
  public components = new TypedObjectPool<Component<any>>();


  public GetComponents<T extends Component<any>>(type: Type<T>): T[] {
    return this.components.Get(type) as T[] || [];
  }

  public AddComponent<T extends Component<any>>(component: T) {
    this.components.AddTyped(component);
  }

  public RemoveComponent<T extends Component<any>>(component: T) {
    this.components.RemoveTyped(component)
  }
}

export class SystemManager {
  public systems = new TypedObjectPool<System<any>>();
  public startTime: number = 0;
  public timeRunning: number = 0;
  public runInterval: number = 0;

  public GetSystems<T extends System<any>>(type: Type<T>): T[] {
    return this.systems.Get(type) as T[];
  }

  public AddSystem<T>(system: System<T>) {
    this.systems.AddTyped(system);
  }

  public RemoveSystem<T>(system: System<T>) {
    this.systems.RemoveTyped(system)
  }

  public Start(interval: number) {
    this.runInterval = interval;
    this.startTime = Date.now();
    this.timeRunning = 0;
    this.loop();
  }

  public loop() {
    const timeElapsed = Date.now() - this.startTime;
    this.timeRunning++;
    this.Run(timeElapsed, this.timeRunning);
    setTimeout(() => this.loop(), this.runInterval);
  }

  public Run(timeElapsed: number, timeRunning: number) {
    this.systems.pools.forEach((pool, type) => pool.forEach((system) => system.run(timeElapsed, timeRunning)));
  }
}

export class EventManager {
  public listeners = new TypedObjectPool<EventListener<any>>();

  public AddEventListener<T>(eventListener: EventListener<T>) {
    this.listeners.AddTyped(eventListener);
  }

  public SendEvent<T extends Event<any>>(event: T) {
    this.listeners.Iterate(event.type, x => x.onEvent(event));
  }
}

export interface EventListener<T> {
  type: Type<T>;

  onEvent(event: Event<T>): void;
}

export class ECSEngine {
  public EntityManager = new EntityManager();
  public ComponentManager = new ComponentManager();
  public SystemManager = new SystemManager();
  public EventManager = new EventManager();

  ecMap = new GroupedObjectPool<Entity, Component<any>>();
  ceMap = new GroupedObjectPool<Component<any>, Entity>();

  public LinkEC<T>(e: Entity, c: Component<T>) {
    this.ecMap.Add(e, c);
    this.ceMap.Add(c, e)
  }

  public UnlinkEC<T>(e: Entity, c: Component<T>) {
    this.ecMap.Remove(e,c);
    this.ceMap.Remove(c,e)
  }
}
