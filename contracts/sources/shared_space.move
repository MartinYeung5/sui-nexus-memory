module nexus_memory::shared_space {
    use std::string::String;
    use sui::vec_map::{Self, VecMap};

    const E_NOT_OWNER: u64 = 0;

    public struct SharedSpace has key {
        id: UID,
        name: String,
        namespace: String,
        owner: address,
        // 0 = reader, 1 = writer, 2 = admin
        members: VecMap<address, u8>,
    }

    public fun create(name: String, namespace: String, ctx: &mut TxContext) {
        let space = SharedSpace {
            id: object::new(ctx),
            name,
            namespace,
            owner: tx_context::sender(ctx),
            members: vec_map::empty(),
        };
        transfer::share_object(space);
    }

    public fun add_member(space: &mut SharedSpace, who: address, role: u8, ctx: &TxContext) {
        assert!(tx_context::sender(ctx) == space.owner, E_NOT_OWNER);
        if (vec_map::contains(&space.members, &who)) {
            vec_map::remove(&mut space.members, &who);
        };
        vec_map::insert(&mut space.members, who, role);
    }

    public fun remove_member(space: &mut SharedSpace, who: address, ctx: &TxContext) {
        assert!(tx_context::sender(ctx) == space.owner, E_NOT_OWNER);
        if (vec_map::contains(&space.members, &who)) {
            vec_map::remove(&mut space.members, &who);
        };
    }

    public fun role(space: &SharedSpace, who: address): u8 {
        if (who == space.owner) { 2 }
        else if (vec_map::contains(&space.members, &who)) { *vec_map::get(&space.members, &who) }
        else { 255 }
    }
}
