module nexus_memory::artifact {
    use std::string::String;
    use sui::event;

    public struct Artifact has key, store {
        id: UID,
        owner: address,
        blob_id: String,
        content_hash: String,
        name: String,
        version: u64,
    }

    public struct ArtifactRegistered has copy, drop {
        artifact_id: ID,
        owner: address,
        blob_id: String,
        content_hash: String,
    }

    public fun register(
        name: String,
        blob_id: String,
        content_hash: String,
        ctx: &mut TxContext,
    ) {
        let a = Artifact {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            blob_id,
            content_hash,
            name,
            version: 1,
        };
        event::emit(ArtifactRegistered {
            artifact_id: object::id(&a),
            owner: a.owner,
            blob_id: a.blob_id,
            content_hash: a.content_hash,
        });
        transfer::transfer(a, tx_context::sender(ctx));
    }
}
