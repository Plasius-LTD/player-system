# ADR-0005: Player System Audio and Voice Orchestration Boundary

## Status

Accepted

## Context

The Player System needs to route narrated responses, localized cues, and voice
commands across ambient, focused, and combat-safe contexts. Audio policy already
lives in `@plasius/ai-speech`, while voice UI and recognition engines live in
`@plasius/voice`. Coupling the non-rendering runtime package to the React voice
runtime would make package consumers pay for a host-specific implementation and
would blur ownership between orchestration and presentation.

## Decision

`@plasius/player-system` consumes the published `@plasius/ai-speech` contracts
and policy resolver through `resolvePlayerSystemAudioRoute()`. It exposes a
renderer-neutral voice registration shape and a pure context resolver through
`createPlayerSystemVoiceCommandRegistration()` and
`resolvePlayerSystemVoiceCommand()`.

The inherited rollout flag is `isekai.player-system.audio.enabled`. Combat-safe
voice commands must opt in explicitly, pane-scoped commands fail closed when no
matching pane is active, and the shared speech policy remains the source of
truth for mute, duplicate, priority, ducking, and delivery decisions.

## Alternatives considered

- Importing `@plasius/voice` directly would couple this package to React and the
  browser voice runtime.
- Reimplementing audio priority and delivery policy here would create two
  inconsistent policy sources.
- Leaving context routing to each host would duplicate combat-safety logic and
  make tutorial, mission, MCC, and warning behavior inconsistent.

## Consequences

- Hosts can adapt the pure registration shape to `@plasius/voice` or another
  recognition engine without a runtime dependency on either UI implementation.
- Audio policy remains shared and testable in `@plasius/ai-speech`.
- The package adds a small published dependency and must keep its public
  contracts compatible with the shared speech package.
- Tests cover rollout-disabled, combat-safe, pane, family, and bounded-input
  behavior before release.
