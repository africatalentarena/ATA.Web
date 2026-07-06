# Security Specifications

## Data Invariants
1. A user can cast a maximum of 5 votes across all performers.
2. A user can vote for the same performer only once. 
3. A vote operation must explicitly increment the user's `totalVotes` by exactly 1.
4. A vote operation must explicitly increment the performer's `voteCount` by exactly 1.
5. Updating a performer's `voteCount` must be atomically accompanied by the creation of a corresponding `vote` document.
6. A comment can only be posted for an existing performer.
7. Only defined system administrators can create or edit performers.

## The "Dirty Dozen" Payloads
1. **Vote Spam Attack:** Submitting a payload that directly creates multiple vote records for the same `{performerId}`.
2. **Infinite Wallet Error:** Creating votes beyond the limit of 5.
3. **Ghost Performer Link:** Posting a vote or comment directed at a non-existent `performerId`.
4. **Shadow Admin Update:** Non-admin attempting to append a new category or change `category` in `performers`.
5. **Score Stuffing:** Incrementing the `voteCount` by 10 instead of 1.
6. **Disembodied Update:** Attempting to update `voteCount` without simultaneously creating a vote document. 
7. **Role Spoofing Attack:** Changing `email` on user profile update.
8. **Invalid Format:** Posting a vote ID that uses invalid characters to attempt NoSQL injection.
9. **Fake Timestamp:** Updating `timestamp` to a future or past date instead of `request.time`.
10. **Empty Payload Attack:** Sending a document creation request missing required fields like `favorites`.
11. **Type Poisoning:** Setting `voteCount` to a string instead of a number.
12. **Comment Impersonation:** Creating a comment with a `userId` that doesn't match `request.auth.uid`.

## The Test Runner (`firestore.rules.test.ts`)
```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Tests will verify each of the Dirty Dozen fail with PERMISSION_DENIED.
// (Setup mock environment using rules-unit-testing)
```
