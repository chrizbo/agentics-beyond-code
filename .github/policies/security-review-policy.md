# Security Compliance Review Policy

This policy defines when a security review is required for a launch and what
questions the security team needs answered. The compliance review workflow
reads this file at runtime. Customize it to match your organization's standards.

## Rubric — When Is a Security Review Needed?

A security review is **needed** if ANY of the following are true:

- Launch involves authentication, authorization, or identity changes
- Launch processes, stores, or transmits sensitive or personal data
- Launch introduces new API endpoints or modifies existing ones
- Launch integrates with third-party services or external systems
- Launch changes encryption, key management, or secrets handling
- Launch modifies network configuration, firewall rules, or access controls
- Launch involves payment processing or financial transactions
- Launch changes data export, import, or migration functionality
- Launch introduces new infrastructure or deployment changes
- Launch body or sub-issues mention: security, auth, token, credential,
  encryption, vulnerability, penetration test, or similar terms

A security review is **not needed** if the launch is purely:

- Documentation or content-only changes
- UI copy/text/translation changes with no logic changes
- Internal tooling with no customer data access
- Design-only changes (mockups, wireframes)

## Review Questions

When a security review is needed, the following questions must be answered
by the DRI and reviewed by the security team. These form the starter review
content that the workflow generates.

### Threat Model

1. What assets (data, systems, credentials) are at risk in this launch?
2. What trust boundaries are crossed (e.g., client→server, service→service, internal→external)?
3. What is the new or changed attack surface (new endpoints, inputs, integrations)?
4. Who are the potential threat actors and what are their motivations?

### Authentication & Authorization

5. Does this launch change how users authenticate? If so, describe the change.
6. Does this launch introduce or modify authorization checks? What resources are protected?
7. Are there any new roles, permissions, or access control rules?

### Data Protection

8. What sensitive data does this launch handle (PII, credentials, financial data)?
9. Is data encrypted at rest and in transit? What algorithms/protocols are used?
10. Are there any new secrets, API keys, or credentials? How are they managed?

### Input & Output

11. What new user inputs does this launch accept? How are they validated?
12. Is output encoding applied to prevent injection attacks (XSS, SQLi, etc.)?
13. Are there file uploads? If so, what validation and sandboxing is in place?

### Dependencies & Infrastructure

14. Are new third-party dependencies introduced? Have they been scanned for vulnerabilities?
15. Does the launch change infrastructure (new services, containers, cloud resources)?
16. Are there rate limiting and abuse prevention controls on new endpoints?

### Monitoring & Response

17. Are security-relevant events logged (auth failures, access denials, data access)?
18. Does the incident response plan need updating for this launch?
19. Is there a rollback plan if a security issue is discovered post-launch?

## Review Checklist

The security reviewer should verify:

- [ ] Authentication & authorization changes reviewed
- [ ] Input validation and output encoding verified
- [ ] Secrets management reviewed (no hardcoded credentials)
- [ ] API rate limiting and abuse prevention assessed
- [ ] Data encryption at rest and in transit verified
- [ ] Dependency security scan (no known vulnerabilities)
- [ ] Logging & monitoring for security events
- [ ] Incident response plan updated if needed

## Labels

- `needs:security` — a security review is required and pending
- `approved:security` — the security review has been completed and approved
