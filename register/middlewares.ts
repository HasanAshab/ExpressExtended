export default const middlewares: {[key: string]: string | string[]} = {
  "test": "/app/http/middlewares/Test",
  "auth": "/app/http/middlewares/Authenticate",
  "verified": [
    "/app/http/middlewares/Authenticate",
    "/app/http/middlewares/EnsureEmailIsVerified"
  ],
  "admin": "/app/http/middlewares/CheckIfTheUserIsAdmin",
  "limit": "/app/http/middlewares/LimitRequestRate",
  "signed": "/app/http/middlewares/ValidateSignature",
  "cache": "/app/http/middlewares/CacheResponse",
  "validate": "/app/http/middlewares/ValidateRequest",
  "response.wrap": "/app/http/middlewares/WrapResponse",
  "error.handle": "/app/http/middlewares/ErrorHandler"
}