# Resume Extraction Contract

This document defines the strict contract between the AI output generation (`responseSchema`) and the backend validation layer (Zod). 

Both schemas must remain in sync. Modifying one requires modifying the other.

## Field Nullability and Required Status

| Field | Required? | Nullable? | Meaning of null/missing | Persistence behavior |
|-------|-----------|-----------|--------------------------|----------------------|
| `name` | Yes | No | Candidate name must be extractable for a valid profile. | N/A (Fails extraction) |
| `education[].institution` | Yes | No | An education entry must have an institution. | N/A (Fails extraction) |
| `education[].degree` | No | Yes | The resume omitted the degree for this institution. | Persisted as explicit `null` |
| `education[].year` | No | Yes | The resume omitted dates/year for this institution. | Persisted as explicit `null` |
| `experience[].company` | Yes | No | A work experience entry must have a company. | N/A (Fails extraction) |
| `experience[].role` | Yes | No | A work experience entry must have a role/title. | N/A (Fails extraction) |
| `experience[].duration` | No | Yes | The resume omitted the duration for this role. | Persisted as explicit `null` |
| `experience[].description`| No | Yes | The resume omitted description details for this role. | Persisted as explicit `null` |
| `skills` | Yes | No | Must be an array, can be empty `[]` if no skills found. | Persisted as `[]` |

## Persistence Strategy
- Missing data is always represented as **explicit `null`** inside the JSONB payload. 
- We do not mix representations (no `""`, `undefined`, or omitted keys).
- Zod parses using `.nullable()`, and Gemini SDK `responseSchema` uses `nullable: true`.

> [!NOTE]
> **Design Debt Acknowledgment:** Maintaining two independently hand-written schemas (Gemini `responseSchema` and Zod) is technical debt. Generating one from the other (e.g., Zod → JSON Schema → Gemini `responseSchema`) would be worth doing in a future hardening pass to ensure zero drift.
