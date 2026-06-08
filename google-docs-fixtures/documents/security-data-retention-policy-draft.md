# Security Data Retention Policy - Draft

**Document owner:** Security  
**Status:** Draft for cross-functional review  
**Last reviewed:** 2026-06-06

## Purpose

Define minimum controls for customer-configurable retention features and
exported audit data.

## Draft Requirements

1. Customer-facing retention claims must match enforced system behavior.
2. Retention periods longer than 30 days require an approved storage-cost and
   access-control model.
3. Deletion must complete within seven days of the configured expiration date.
4. The system must record evidence that scheduled deletion completed.
5. Export files must include a generated timestamp and integrity checksum.
6. Product documentation must distinguish platform retention from
   customer-managed retention of downloaded exports.

## Current Security Position

Security does not object to a 30-day Beta if:

- The limitation is explicit in Beta documentation.
- No sales or product materials imply that 365-day platform retention exists.
- Exported files include timestamps and checksums.
- A manual test verifies deletion behavior before Beta begins.

Security has not approved configurable 365-day platform retention. The control
design and storage model are still incomplete.

## Open Review Items

- Confirm whether deletion evidence must be customer-visible.
- Define who can change retention settings.
- Determine whether long-retention storage needs a separate encryption key.
- Review the customer-managed export workaround with Legal.

