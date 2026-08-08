# Auth stub
**Important:** This is not production-ready solution, please do not use it in real life.

## Planning and Architecture Explanation
### Backend
I keep the backend part as simple as possible but still satisfying the requirements. ASP.NET Core Web Api project, minimal Api, no data storage, no external dependencies.

I deliberately left secret management, monitoring, logging, conteinerisation and other aspects out of scope here.

Deloberately no tests.
#### Structure:
- Program.cs – hosts the app, registers a minimal auth service and maps the endpoint
- Minimal Api endpoint map
- IAuthService that performs "authentication"
#### Request Flow
- Model validation (Data annotations)
- Model binding (JSON serialised into simple record)
- Auth service compares input against hardcoded sample
- Based on comparison outcome either hardcoded token or HTTP error code 401 (Unauthorized) is returned
#### Responsibilities
- Endpoint owns HTTP concerns
- Service owns business logic

### Frontend
I keep the frontend part as simple as possible but still satisfying the requirements. A single client-side page at `/login`, no global state, no context, no form library – just React state and one async handler.

#### Structure
- App router
- One Clent Component

The page owns:
- Controlled inputs for username/password
- A single piece of UI state (idle, loading, success, error)
- Call to the backend endpoint
- Conditional rendering of the call outcome

### Data Flow
User clicks Login -> client sets state to "loading" and disables the button -> POST /api/auth/login with JSON body ->

- 200 -> store the token in component state and show "Success! Token: ..."
- 401 / network error -> set error message and show it
finally -> clear "loading" state.

All UI state lives in the login component. The token is treated as opaque, no token decoding, no persistance.

### Tradeoffs
**Important** The requirements explicitly says `Accepts JSON with username and password` which is against healthy engineering practices. In production
environment prefer `Authorization: Basic` or a proper identity flow (OIDC / Authorization Code + PKCE, or at least secure httpOnly cookie sessions)

In production I would not return a long-lived token in the response body and would not accept a raw password over anything except HTTPS with strict transport security.
I would also introduce a proper identity provider (or at least ASP.NET Core Identity + cookie/JWT with refresh tokens), input sanitisation, rate limiting, and structured logging that never records credentials. 
The current design deliberately sacrifices those concerns for clarity and speed of implementation.

## Deployment Strategy
### Backend API -> Cloud Run
Containerise the ASP.NET Core app, deploy to Cloud Run. It scales to zero, with .NET support, HTTPS and custom domains out of the box. No cluster management required.
### Frontend app -> Cloud Run
Same service keeps the operational model consistent. I build a container that runs `next start`, Cloud Run handles the Node process, scaling, and TLS.

## JWT Validation
- Publish the identity provider’s JWKS endpoint.
- On API startup (or via a background refresh) fetch and cache the JWKS in memory (or distributed cache).
- On each request, validate the JWT signature, issuer, audience and expiry locally using the cached keys.
- Refresh the JWKS cache periodically (and on key-id miss) so we never call the IdP on the hot path.
- Reject tokens with unknown kid or failed signature immediately.

This gives cryptographic verification without a network hop on every request. Actual implementation could vary depending on the requirements and the environment.
