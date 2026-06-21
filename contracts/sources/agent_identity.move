module nexus_memory::agent_identity {
    use std::string::String;
    use sui::event;
    use sui::clock::{Self, Clock};

    public struct Agent has key, store {
        id: UID,
        owner: address,
        name: String,
        namespace: String,
        created_at_ms: u64,
    }

    public struct AgentRegistered has copy, drop {
        agent_id: ID,
        owner: address,
        namespace: String,
    }

    public fun register(
        owner: address,
        name: String,
        namespace: String,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let agent = Agent {
            id: object::new(ctx),
            owner,
            name,
            namespace,
            created_at_ms: clock::timestamp_ms(clock),
        };
        event::emit(AgentRegistered {
            agent_id: object::id(&agent),
            owner,
            namespace: agent.namespace,
        });
        transfer::transfer(agent, owner);
    }

    public fun owner(a: &Agent): address { a.owner }
    public fun namespace(a: &Agent): String { a.namespace }
}
