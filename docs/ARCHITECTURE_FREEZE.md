# Architecture Freeze

Status: ACTIVE

The EduFlow architecture has been reviewed, approved and frozen.

The implementation phase has started.

## Rule

The approved documentation is the source of truth.

Implementation must follow the documentation exactly.

Do not redesign the architecture during implementation.

## Allowed changes

Architectural changes are only allowed when:

- implementation is impossible;
- the documentation contains a demonstrable contradiction or factual error;
- the Product Owner explicitly requests an architectural change.

In those cases:

1. Stop implementation.
2. Open a dedicated Architecture Issue.
3. Wait until the documentation has been updated.
4. Continue implementation afterwards.

Do not silently change architecture during implementation.

## Pull Requests

Implementation Pull Requests must never contain architectural changes.

Architecture changes and implementation changes are separate Pull Requests.

## Reviews

Reviewers should focus on:

- correctness
- bugs
- accessibility
- privacy
- performance
- consistency with the approved documentation

Do not propose new architecture unless one of the allowed conditions applies.

## Principle

A finished implementation of the approved architecture is preferred over a better architecture that delays the project.
