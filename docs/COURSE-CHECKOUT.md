# Course checkout and access

## Implemented locally

- Guest carts persist across page reload, login and registration. Duplicate course entries are prevented.
- Home and catalog share Add to cart / Go to cart / Watch lessons buttons.
- Public course view contains a 60-second sample and syllabus titles only.
- Checkout requires authentication; login and registration return to the cart.
- Orders are user-specific and retained across reload in the local adapter.
- Unpriced courses create an awaiting_quote order and cannot be reported as paid.
- Bank transfer details and QPay payment UI live in the cart checkout, not individual course enrollment dialogs.
- Reporting a bank transfer creates pending_review, never paid access.
- Only active entitlements with paymentStatus=paid from GET /me/courses grant playback.
- Full playback fetches lessons from GET /me/courses/:courseId/lessons. API failure denies access.
- My learning and progress show only entitled courses. Logging out or switching accounts removes access immediately.
- The old EnrollDialog is no longer reachable from the home or catalog.

## Current integration limits

The current deployment uses VITE_USE_MOCK=true, browser-local accounts, and no payment gateway/database backend.
The local adapter returns no paid entitlements; its only exception is the explicitly enabled temporary Power BI access. Users cannot unlock other lessons by clicking a payment button.
All nine courses are priced at 49,900 MNT. Course access lasts three calendar months from activation/payment; expired entitlements do not unlock playback. Active purchases and overlapping pending orders cannot be purchased twice. The local adapter grants signed-in accounts temporary Power BI access once for three months; it does not renew on reload or login.
Sample preview material consists of public YouTube courses, clipped using the embed's end parameter.
These public videos cannot become private paid media. Supply actual short trailers and private lesson media for production.

## Authenticated backend contract (VITE_USE_MOCK=false)

Use secure HttpOnly session cookies. The frontend includes credentials with API requests.
The backend must derive user identity from its session; never accept a client userId as ownership proof.

- GET /auth/me -> public profile { id, name, email, role }; 401 if unauthenticated.
- POST /auth/login { email, password } -> profile, set session cookie.
- POST /auth/register { name, email, password } -> profile, set session cookie.
- POST /auth/logout -> clear session cookie.
- GET /courses -> catalog, with official numeric MNT price per course.
- POST /orders { courseIds } -> order. Validate catalog IDs, recompute prices server-side,
  require session, reuse an existing identical unpaid order (idempotency), and reject already owned items.
- GET /me/orders -> this session's orders only.
- POST /orders/:id/bank-transfer -> pending_review (requires session and order ownership).
- POST /orders/:id/qpay -> authenticated provider invoice. Only expose qpayAvailable=true
  when a real merchant integration is configured. Return { qrImage: 'https://...' }.
- GET /me/courses -> [{ courseId, status: 'active', paymentStatus: 'paid', activatedAt, expiresAt }].
  ExpiresAt is three calendar months after activation. Reject duplicates while access is active; permit renewal after expiry. The temporary Power BI exception is represented by paymentStatus='waived', accessType='temporary' and the same dates.
- GET /me/courses/:courseId/lessons -> { lessons: [{ id, mn, en, creator, videoUrl }] }.
  Enforce ownership and paid status here; return 401/403 otherwise. videoUrl should be short-lived signed media URLs.

Order shape: { id, items: [{ courseId, title: {mn,en}, price }], amount, currency:'MNT',
status: 'awaiting_quote'|'pending_payment'|'pending_review'|'paid'|'cancelled', createdAt, qpayAvailable? }.

## Settlement

For QPay, check the provider's authenticated transaction API/webhook, match invoice, currency and amount,
then atomically mark the order paid and create entitlements. A frontend redirect is not payment proof.
For bank transfers, an authorized operator or bank integration must verify the matching incoming amount/reference,
then perform the same server-side settlement. Refunds/revocations must remove access.
Never expose merchant secrets in VITE_ variables, JavaScript bundles, localStorage, or this repository.
A backend and protected media storage are required before this can enforce paid access in production.
