import {Component, ECSEngine, Entity, Event, id, System, Type} from "ecs";

const engine = new ECSEngine();
const componentManager = engine.ComponentManager;
const entityManager = engine.EntityManager;
const systemManager = engine.SystemManager;
const eventManager = engine.EventManager;

// type element = 'element';
// type attack = 'attack';
// let element = 'element';
// let attack = 'attack';

export class ElementComponent implements Component<ElementComponent> {
    public type: Type<ElementComponent> = ElementComponent;
    public Attack: number = 1;
    public Defend: number = 0;
    public Health: number = 100;

    constructor(public IdEntity: Entity, public Name: string) {
    }
}

const fire = new ElementComponent(entityManager.CreateEntity(), "fire");
const water = new ElementComponent(entityManager.CreateEntity(), "water");

componentManager.AddComponent(fire);
componentManager.AddComponent(water);

export interface AttackEvent extends Event<AttackEvent> {
    type: Type<AttackEvent>;
    Attacker: id;
    Defender: id;
    Amount: number;
}

export class AttackEvent implements AttackEvent {
}

export class AttackSystem extends System<AttackSystem> {
    constructor() {
        super(AttackSystem);
    }

    public run(timeElapsed: number, timeRunning: number): void {
        // console.log('running attack system');
        componentManager.GetComponents(ElementComponent).forEach((c) => {
            const attacker: ElementComponent = c as any;
            // console.log({attacker});
            componentManager.GetComponents(ElementComponent).forEach((c) => {
                const defender: ElementComponent = c as any;
                // console.log({defender});
                if (attacker === defender) {
                    // console.log('skip attacking self');
                    return;
                }
                // console.log('check defend');
                if (defender.Defend < attacker.Attack) {
                    // console.log('before', {attacker, defender});
                    const Amount = attacker.Attack - defender.Defend;
                    defender.Health -= Amount;
                    const event: AttackEvent = {
                        type: AttackEvent,
                        Attacker: attacker.IdEntity.id,
                        Defender: defender.IdEntity.id,
                        Amount,
                    };
                    eventManager.SendEvent(event);
                    // console.log('after', {attacker, defender});
                }
            });
        });
    }
}

systemManager.AddSystem(new AttackSystem());

eventManager.AddEventListener({
    type: AttackEvent, onEvent: (event: AttackEvent) => {
        const es: ElementComponent[] = componentManager.GetComponents<ElementComponent>(ElementComponent);
        const attacker = es.find((x) => x.IdEntity.id === event.Attacker);
        const defender = es.find((x) => x.IdEntity.id === event.Defender);
        if (!attacker || !defender) {
            console.error("invalid attack event:", event);
            throw new Error("invalid attack event");
        }
        console.log(`${attacker.Name} attacks ${defender.Name} ${event.Amount} pt`);
    },
});

console.log("start");
systemManager.Start(1000);
console.log("started");
