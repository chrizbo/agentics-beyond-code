# Responsible AI Compliance Review Policy

This policy defines when a responsible AI review is required for a launch and
what questions the responsible AI team needs answered. The compliance review
workflow reads this file at runtime. Customize it to match your organization's
standards.

## Rubric — When Is a Responsible AI Review Needed?

A responsible AI review is **needed** if ANY of the following are true:

- Launch uses or integrates AI/ML models for decision-making
- Launch introduces automated content generation or modification
- Launch uses AI for personalization, recommendations, or ranking
- Launch introduces chatbots, virtual assistants, or conversational AI
- Launch uses AI for moderation, filtering, or classification
- Launch involves training or fine-tuning models on user data
- Launch uses AI in ways that could affect user outcomes (hiring, lending, etc.)
- Launch introduces AI-generated content that could be mistaken for human content
- Launch body or sub-issues mention: AI, ML, model, LLM, GPT, copilot,
  machine learning, neural network, or similar terms

A responsible AI review is **not needed** if the launch:

- Does not involve any AI/ML components
- Uses only deterministic algorithms and rule-based logic
- Is purely data storage/retrieval with no AI processing

## Review Questions

When a responsible AI review is needed, the following questions must be
answered by the DRI and reviewed by the responsible AI team. These form
the starter review content that the workflow generates.

### AI System Overview

1. What AI/ML model(s) are used in this launch? Include model names, versions, and providers.
2. What is the specific use case — what decisions or outputs does the AI produce?
3. Who are the affected users or populations? Are any vulnerable groups disproportionately impacted?
4. What is the impact level if the AI produces incorrect or biased output (low / medium / high / critical)?

### Fairness & Bias

5. Has the model been tested for bias across demographic groups (age, gender, race, language, geography)?
6. What datasets were used for training or evaluation? Are they representative of the target population?
7. Are there known disparities in model performance across groups? How are they mitigated?
8. Is there a process for ongoing bias monitoring after launch?

### Transparency & Explainability

9. Are users clearly informed when they are interacting with AI (vs. a human or deterministic system)?
10. Can users understand why the AI produced a specific output (explanation, reasoning, confidence score)?
11. Is AI-generated content clearly labeled or distinguishable from human-created content?
12. Is the system's purpose, capabilities, and limitations documented for users?

### Human Oversight

13. Is there a human-in-the-loop for high-stakes decisions? Describe the escalation path.
14. Can a human override or correct AI decisions? How?
15. What is the feedback mechanism for users to report incorrect or harmful AI outputs?
16. How often is model performance reviewed by a human?

### Safety & Harm Prevention

17. What safeguards prevent the AI from generating harmful, offensive, or dangerous content?
18. Has the system been red-teamed or adversarially tested?
19. Are there content filters, guardrails, or output validation in place?
20. What happens when the AI encounters an out-of-distribution or adversarial input?

### Data & Training

21. Was the model trained or fine-tuned on user data? If so, was consent obtained?
22. How is training data quality ensured (deduplication, bias checks, harmful content removal)?
23. Is user data used for model improvement? Can users opt out?
24. Are there data retention and deletion policies for AI training data?

### User Agency

25. Can users opt out of AI-powered features and use a non-AI alternative?
26. Are users' preferences and choices respected by the AI system?
27. Is there a clear mechanism for users to provide feedback on AI outputs?

## Review Checklist

The responsible AI reviewer should verify:

- [ ] Fairness — tested for bias across demographic groups
- [ ] Transparency — users informed when interacting with AI
- [ ] Explainability — outputs can be explained/interpreted
- [ ] Human oversight — human-in-the-loop where appropriate
- [ ] Safety — harmful output mitigations in place
- [ ] Data quality — training data reviewed for bias/quality
- [ ] Content attribution — AI-generated content is labeled
- [ ] Opt-out mechanism — users can decline AI features

## Labels

- `needs:responsible-ai` — a responsible AI review is required and pending
- `approved:responsible-ai` — the responsible AI review has been completed and approved
