# Privacy Compliance Review Policy

This policy defines when a privacy review is required for a launch and what
questions the privacy team needs answered. The compliance review workflow
reads this file at runtime. Customize it to match your organization's standards.

## Rubric — When Is a Privacy Review Needed?

A privacy review is **needed** if ANY of the following are true:

- Launch collects, processes, or stores personal data (PII)
- Launch changes how user data is shared with third parties
- Launch introduces new tracking, analytics, or telemetry
- Launch affects data retention, deletion, or export capabilities
- Launch targets EU users or involves GDPR/CCPA compliance
- Launch changes cookie usage or consent mechanisms
- Launch introduces user profiling or behavioral analysis
- Launch modifies data subject rights (access, erasure, portability)
- Launch body or sub-issues mention: privacy, GDPR, CCPA, PII,
  personal data, consent, data protection, or similar terms

A privacy review is **not needed** if the launch:

- Does not touch user data in any way
- Is purely internal-facing with no personal data
- Is a visual/UI redesign with no data flow changes

## Review Questions

When a privacy review is needed, the following questions must be answered
by the DRI and reviewed by the privacy team. These form the starter review
content that the workflow generates.

### Data Inventory

1. What personal data is collected or processed by this launch? List specific data types (name, email, IP address, device ID, etc.).
2. What is the lawful basis for processing this data (consent, legitimate interest, contractual necessity, legal obligation)?
3. Is any data considered sensitive or special category (health, biometric, racial/ethnic origin, political opinions)?

### Data Flow

4. Where does personal data originate (user input, automatic collection, third-party sources)?
5. Where is personal data stored? In what systems, regions, and for how long?
6. Is personal data shared with third parties? If so, which ones and under what agreements?
7. Does data cross international borders? If so, what transfer mechanisms are in place?

### User Rights & Transparency

8. Are users informed about this data collection via a privacy notice or disclosure? Is the notice updated?
9. Can users access, correct, and delete their data? Does this launch affect those capabilities?
10. Can users export their data in a portable format?
11. Is there an opt-out or consent withdrawal mechanism?

### Tracking & Analytics

12. Does this launch introduce new cookies, pixels, fingerprinting, or tracking mechanisms?
13. Is a consent mechanism in place for non-essential tracking?
14. What analytics or telemetry data is collected? Is it aggregated or individual-level?

### Data Lifecycle

15. What is the retention period for data collected by this launch?
16. How is data deleted when no longer needed? Is deletion automated?
17. Are there any data backup or archival considerations?

### Third-Party Processors

18. Are any new third-party processors or sub-processors involved?
19. Is a Data Processing Agreement (DPA) in place with each processor?
20. Have processor security practices been assessed?

## Review Checklist

The privacy reviewer should verify:

- [ ] Data minimization — only necessary data collected
- [ ] Purpose limitation — data used only for stated purpose
- [ ] Legal basis identified (consent, legitimate interest, etc.)
- [ ] Privacy notice / disclosure updated
- [ ] Data subject rights supported (access, delete, export)
- [ ] Cross-border transfer assessed (if applicable)
- [ ] Data processing agreement in place (if third parties)
- [ ] Cookie / tracking consent mechanism reviewed

## Labels

- `needs:privacy` — a privacy review is required and pending
- `approved:privacy` — the privacy review has been completed and approved
