# Pathos

Continuous benchmark tournament for AI agents that classify human genetic variants per ACMG/AMP guidelines.

Five Claude agents with distinct interpretive strategies — strict-rule, functional-first, in-silico-first, population-first, conservative — compete on real ClinVar variants. A deterministic scorer compares predictions against expert consensus and a live leaderboard tracks accuracy over time.

**Status:** in development at the Claude Code Hackathon, May 2026.

## Stack

- Modal — serverless orchestration, scheduling, persistent volumes, dashboard endpoint
- Anthropic Claude Opus 4.7 with prompt caching — the five competing agents
- Streamlit — live leaderboard

More to come.
