# Pro Informatique API - Architecture & Design Decisions

## Overview

This document outlines the architectural decisions, patterns, and design principles used in the Pro Informatique API backend.

## Architecture Pattern

### Modular Monolith

The application follows a **modular monolith** pattern rather than microservices, optimized for:
- Simplicity and single deployment unit
- Shared codebase with clear separation of concerns
- Easier debugging and monitoring
- Lower operational complexity

### Directory Structure

```
src/
├── types/          # TypeScript type definitions (shared across all modules)
├── lib/            # Core libraries (Firebase, logger, validation, etc.)
├── middleware/     # Express middleware (auth, error handling, cors, logging)
├── routes/         # API routes organized by domain
├── utils/          # Utility functions and constants
└── index.ts        # Application entry point
```

This structure ensures:
- **Clear separation of concerns** - Each layer has distinct responsibilities
- **Reusability** - Middleware and utilities are shared
- **Scalability** - Easy to add new routes and features
- **Testability** - Components can be tested in isolation

## Core Patterns

### 1. Request/Response Handling

**Pattern**: Standardized response format with helper functions

```typescript
// All responses follow this format
{
  success: boolean,
  message?: string,
  data?: T,
  error?: string,
  timestamp: string
}
```

**Benefits**:
- Consistent API contract for all clients
- Easy error handling on frontend
- Clear distinction between success and error responses
- Timestamp for debugging and audit trails

**Implementation**: `lib/responses.ts` provides helpers like:
- `sendSuccess()` - 200 OK
- `sendCreated()` - 201 Created
- `sendError()` - Generic error handler
- `sendNotFound()` - 404
- `sendUnauthorized()` - 401

### 2. Error Handling

**Pattern**: Centralized error middleware with custom ApiError class

```typescript
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) { ... }
}
```

**Benefits**:
- Consistent error responses across the API
- Proper HTTP status codes
- Stack traces only in development
- Sensitive data never leaked to clients

**Implementation**: `middleware/error.ts` global error handler catches:
- API errors
- Zod validation errors
- Unexpected errors
- Async handler errors (via `asyncHandler` wrapper)

### 3. Authentication & Authorization

**Pattern**: JWT-based with role-based access control (RBAC)

**Tokens**:
- **Access Token**: 15 minutes, for API access
- **Refresh Token**: 7 days, for obtaining new access tokens

**Roles**:
- `user` - Standard user
- `admin` - Full access
- `moderator` - Moderation capabilities

**Middleware**:
- `verifyToken()` - Checks valid JWT
- `verifyAdmin()` - Checks admin role
- `verifyModerator()` - (future) Checks moderator role

**Benefits**:
- Stateless authentication (no session storage)
- Scalable across multiple servers
- Fine-grained access control
- Token refresh for long-running applications

### 4. Validation

**Pattern**: Schema-first validation with Zod

```typescript
export const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  // ... more fields
});

// Usage
router.post('/', (req, res) => {
  const validatedData = createProductSchema.parse(req.body);
  // ... safe to use validatedData
});
```

**Benefits**:
- Type-safe validation
- Reusable schemas
- Clear error messages
- Single source of truth for validation rules

**Schemas Location**: `lib/validation.ts`

### 5. Logging

**Pattern**: Structured logging with Winston

**Log Levels** (configurable via LOG_LEVEL env):
- `error` - Error events
- `warn` - Warning events
- `info` - General information
- `debug` - Debug information

**Format**: JSON for production, pretty-printed for development

**Implementation**: `lib/logger.ts`

```typescript
logger.info('User logged in', { userId: '123' });
logger.error('Database error', { error: err.message });
```

**Benefits**:
- Machine-readable logs for log aggregation
- Structured data for filtering and searching
- Easy integration with monitoring tools
- Clear audit trail

### 6. Database Access

**Pattern**: Firestore-first with mock fallback

**Key Features**:
- No ORM (direct Firestore access for flexibility)
- Soft delete support (deletedAt field)
- Automatic timestamps (createdAt, updatedAt)
- Optional mock mode for development/testing

**Mock Mode Benefits**:
- Develop without Firebase credentials
- Faster feedback loops
- Easy testing without database setup
- Clear separation between real and test data

### 7. Route Organization

**Pattern**: Domain-driven routes with REST conventions

```
/v1/services       # Service management
/v1/products       # Product catalog
/v1/promotions     # Promotion campaigns
/v1/reviews        # Product reviews
/v1/cyber-tickets  # Security tickets
/v1/computers      # Computer inventory
/v1/users          # User management (admin)
/v1/auth           # Authentication endpoints
```

**Benefits**:
- Clear API navigation
- Easy to understand for clients
- Scalable to new features
- Standard REST conventions

### 8. Pagination & Filtering

**Pattern**: Query-based pagination with cursor support (future)

**Current Implementation**:
- Limit-offset pagination
- Default limit: 20, Max: 100
- Query parameters: `?page=1&limit=20`

```typescript
const paginationData = paginationSchema.parse(req.query);
const { page, limit } = parsePaginationQuery(paginationData);
const items = paginateArray(allItems, page, limit);
sendPaginated(res, items, page, limit, total);
```

**Future Improvements**:
- Cursor-based pagination for better performance
- Elasticsearch integration for advanced search
- Caching strategies

### 9. Middleware Stack

**Order matters** - Middleware executes in order:

```
1. Helmet          - Security headers
2. CORS            - Cross-origin handling
3. JSON parser     - Parse request bodies
4. Request logger  - Log incoming requests
5. Rate limiter    - Throttle requests
6. Route handlers  - Business logic
7. Error handler   - Catch all errors
```

### 10. Type System

**Philosophy**: Maximum type safety with zero `any`

**Type Organization**:
- `types/common.ts` - Shared types (ApiResponse, ApiError, etc.)
- `types/entities.ts` - Domain entities (Service, Product, User, etc.)
- Generic types for reusable patterns

**Benefits**:
- Compile-time error detection
- IDE autocomplete
- Self-documenting code
- Easier refactoring

## Security Considerations

### Implemented

✅ **Password Hashing**: bcryptjs with 10 rounds  
✅ **JWT Authentication**: Secure token-based auth  
✅ **CORS Protection**: Configurable origin whitelist  
✅ **Rate Limiting**: Express-rate-limit (100 req/15min)  
✅ **Security Headers**: Helmet  
✅ **Input Validation**: Zod schemas  
✅ **Error Sanitization**: No stack traces in production  
✅ **SQL Injection Protection**: Firestore (no SQL)  

### Future Enhancements

- [ ] HTTPS enforcer middleware
- [ ] Request signing for sensitive operations
- [ ] Two-factor authentication (2FA)
- [ ] Audit logging for sensitive operations
- [ ] IP whitelisting for admin endpoints
- [ ] Rate limiting per user instead of per IP
- [ ] Encryption at rest for sensitive fields

## Performance Considerations

### Current Optimizations

- **Lazy loading**: Firebase queries only what's needed
- **Pagination**: Prevent large result sets
- **Caching**: HTTP cache headers (future)
- **Compression**: gzip on Vercel
- **Indexing**: Firestore composite indexes (configured in Firebase Console)

### Potential Bottlenecks

1. **N+1 queries**: Related data fetching (mitigated by pagination)
2. **Firestore limitations**: Max document size (1MB), max writes/sec
3. **Cold starts**: Vercel serverless can be slow (mitigated by regions)

### Scaling Strategy

1. **Phase 1** (Current): Single monolith with Firestore
2. **Phase 2**: Add caching layer (Redis)
3. **Phase 3**: Database read replicas
4. **Phase 4**: Microservices if needed (separate services per domain)

## Testing Strategy

### Planned (Phase 4)

- **Unit tests**: Jest for lib/ and utils/
- **Integration tests**: Supertest for API routes
- **E2E tests**: Postman collections or Playwright
- **Load tests**: Artillery for performance

### Current Gaps

- No automated tests (manual testing only)
- No test coverage reports
- No CI/CD pipeline (GitHub Actions planned)

## Deployment

### Vercel

**Advantages**:
- Zero-config Node.js deployment
- Automatic HTTPS
- Global CDN
- Easy environment variables
- GitHub integration

**Configuration**: `vercel.json` (auto-generated, minimal config needed)

**Environment-specific Configs**:
- Development: .env.local
- Production: Vercel Dashboard > Settings > Environment Variables

## Monitoring & Observability

### Logging

- Winston for structured logs
- JSON format for production
- Log aggregation ready (no current integration)

### Metrics (Future)

- Request latency
- Error rates
- Database query times
- Rate limit hits

### Health Checks

- `/health` - Basic server health
- `/health/db` - Database connection status

### Error Tracking (Future)

- Sentry integration planned
- Error context (user, request, environment)

## API Versioning

**Current**: `/v1/` prefix

**Strategy**:
- URL versioning for clear separation
- Support multiple versions simultaneously
- Deprecate old versions with warning period

**Future Versions**:
```
/v2/ - Major breaking changes
/v1/ - Current stable
/v1-deprecated/ - Old version (warning headers)
```

## Code Style & Conventions

### Naming

- **Routes**: kebab-case (`/cyber-tickets`)
- **Files**: camelCase or kebab-case (`auth.ts`)
- **Functions**: camelCase (`verifyToken()`)
- **Classes**: PascalCase (`ApiError`)
- **Types**: PascalCase with suffix (`UserRequest`, `UserResponse`)
- **Constants**: UPPER_SNAKE_CASE (`JWT_SECRET`)

### Imports

- Use absolute imports (configured in TypeScript)
- Group imports: stdlib, packages, local code
- Use `.js` extension in ES modules

### Error Messages

- User-friendly messages (no stack traces)
- Clear, actionable error descriptions
- Include validation errors for forms
- Log full errors internally for debugging

## Database Schema

### Collections

```
users/                 # User accounts
  - email, password, name, role, createdAt, updatedAt, deletedAt

services/              # Service offerings
  - title, description, category, features, price, createdAt, updatedAt, deletedAt

products/              # Product catalog
  - name, description, price, category, stock, rating, createdAt, updatedAt, deletedAt

promotions/            # Marketing promotions
  - title, description, discount, startDate, endDate, createdAt, updatedAt, deletedAt

reviews/               # Product reviews
  - productId, userId, rating, title, comment, verified, createdAt, updatedAt, deletedAt

cyber_tickets/         # Security tickets
  - title, description, status, priority, userId, assignedTo, createdAt, updatedAt, deletedAt

computers/             # Computer inventory
  - brand, model, status, location, specifications, createdAt, updatedAt, deletedAt
```

### Composite Indexes

```
users (email, deletedAt)
products (category, deletedAt)
reviews (productId, rating DESC)
cyber_tickets (status, priority DESC, userId)
```

## Future Architecture Changes

### Short Term (v1.x)

- [ ] Add OpenAPI/Swagger documentation
- [ ] Implement rate limiting per user
- [ ] Add request ID tracking
- [ ] Structured logging aggregation

### Medium Term (v2.0)

- [ ] Split monolith into services (if growth demands)
- [ ] Add Redis caching layer
- [ ] Elasticsearch for full-text search
- [ ] Message queue for async operations

### Long Term (v3.0)

- [ ] GraphQL API alongside REST
- [ ] WebSocket support for notifications
- [ ] Event sourcing for audit trail
- [ ] CQRS pattern for complex domains

## References

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [REST API Design Best Practices](https://restfulapi.net/)

---

**Last Updated**: 2024-01-XX  
**Author**: Pro Informatique Development Team
