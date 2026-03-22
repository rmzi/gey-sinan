# Census Concept — TABLED

## Status: Not for v1. Revisit after community trust is established.

## The Idea

Use Gey Sinan as a free service to gather voluntary community census data that doesn't exist anywhere else: household speaker counts, fluency levels, and geographic distribution of the Harari diaspora.

## Why It's Valuable

- No comprehensive Harari diaspora census exists
- The data could help understand language vitality and plan preservation efforts
- As a free community tool with organic adoption, Gey Sinan is uniquely positioned to gather this

## Why It's Tabled

The structured dataset this would create — mapping where Harari speakers live, how many are in each household, their fluency levels — could be dangerous in the wrong hands:

- **Authoritarian governments** tracking ethnic/linguistic minorities
- **Bad actors within diaspora politics** using community data for targeting
- **Well-meaning but careless researchers** publishing identifiable patterns
- **Data breaches** exposing a sensitive population map

This is especially concerning for a community of ~250,000 that has already been marginalized by national language policy (Amharic dominance in Ethiopia).

## The Better Approach (What We're Doing Instead)

Rather than explicitly asking users to report demographic data, we observe the organic signals from normal app usage:

- Signup counts by city (IP-derived at write time, IP discarded)
- Active users by region (aggregate only)
- Recording contributions by location
- Engagement patterns (which words, which lessons)

This gives the "how is our app spreading" picture without ever asking users to self-report sensitive information.

## If We Revisit This

Prerequisites before considering any census feature:
1. Established community trust through years of responsible operation
2. Legal review of data protection obligations (GDPR, local laws)
3. Community advisory board input on whether this is wanted
4. Technical maturity: encryption at rest, access controls, audit logging
5. Clear data retention and deletion policies
6. Transparency about exactly what is collected and who can see it

The framing should never be "census" — it should be "help us understand our community" with full opt-in and the ability to withdraw at any time.

## Related: Household Feature

The household/family learning group feature (4-char invite codes, shared progress, family challenges) exists as a **social engagement feature** completely divorced from census. It collects no demographic data. The community insight that might emerge from household adoption patterns is a passive side-effect, not an explicit goal.
