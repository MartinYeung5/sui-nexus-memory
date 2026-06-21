module nexus_memory::audit_log {
    use std::string::String;
    use sui::event;
    use sui::clock::{Self, Clock};

    public struct AuditEvent has copy, drop {
        actor: address,
        action: String,
        target_hash: String,
        ts_ms: u64,
    }

    public fun record(
        action: String,
        target_hash: String,
        clock: &Clock,
        ctx: &TxContext,
    ) {
        event::emit(AuditEvent {
            actor: tx_context::sender(ctx),
            action,
            target_hash,
            ts_ms: clock::timestamp_ms(clock),
        });
    }
}
