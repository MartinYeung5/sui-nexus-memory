module nexus_memory::memory_acl {
    use std::string::String;
    use sui::event;
    use sui::vec_set::{Self, VecSet};

    const E_NOT_OWNER: u64 = 0;

    public struct MemoryACL has key, store {
        id: UID,
        owner: address,
        agent_id: ID,
        blob_id: String,
        content_hash: String,
        readers: VecSet<address>,
        writers: VecSet<address>,
        version: u64,
    }

    public struct MemoryRegistered has copy, drop {
        acl_id: ID,
        owner: address,
        blob_id: String,
        content_hash: String,
        version: u64,
    }

    public struct MemoryVersionBumped has copy, drop {
        acl_id: ID,
        new_hash: String,
        new_version: u64,
    }

    public fun create(
        agent_id: ID,
        blob_id: String,
        content_hash: String,
        ctx: &mut TxContext,
    ) {
        let acl = MemoryACL {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            agent_id,
            blob_id,
            content_hash,
            readers: vec_set::empty(),
            writers: vec_set::empty(),
            version: 1,
        };
        event::emit(MemoryRegistered {
            acl_id: object::id(&acl),
            owner: acl.owner,
            blob_id: acl.blob_id,
            content_hash: acl.content_hash,
            version: 1,
        });
        transfer::share_object(acl);
    }

    public fun grant_read(acl: &mut MemoryACL, who: address, ctx: &TxContext) {
        assert!(tx_context::sender(ctx) == acl.owner, E_NOT_OWNER);
        if (!vec_set::contains(&acl.readers, &who)) {
            vec_set::insert(&mut acl.readers, who);
        };
    }

    public fun grant_write(acl: &mut MemoryACL, who: address, ctx: &TxContext) {
        assert!(tx_context::sender(ctx) == acl.owner, E_NOT_OWNER);
        if (!vec_set::contains(&acl.writers, &who)) {
            vec_set::insert(&mut acl.writers, who);
        };
    }

    public fun bump_version(acl: &mut MemoryACL, new_hash: String, ctx: &TxContext) {
        let s = tx_context::sender(ctx);
        assert!(s == acl.owner || vec_set::contains(&acl.writers, &s), E_NOT_OWNER);
        acl.version = acl.version + 1;
        acl.content_hash = new_hash;
        event::emit(MemoryVersionBumped {
            acl_id: object::id(acl),
            new_hash: acl.content_hash,
            new_version: acl.version,
        });
    }

    public fun can_read(acl: &MemoryACL, who: address): bool {
        who == acl.owner || vec_set::contains(&acl.readers, &who)
    }
}
