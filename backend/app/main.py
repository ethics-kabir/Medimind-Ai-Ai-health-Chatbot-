import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database.session import Base, engine
from app.api import chat, symptom_checker, medications, health
from app.security.config import (
    is_production,
    parse_cors_origins,
    request_size_limit_bytes,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("medimind")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("MediMind AI Backend ready.")
    yield
    logger.info("Shutting down MediMind AI Backend.")

def create_app() -> FastAPI:
    production = is_production()
    allowed_origins = parse_cors_origins()

    app = FastAPI(
        title="MediMind AI - Health Assistant API",
        description="Educational full-stack health assistant with deterministic red-flag safety, symptom triage, medication library, and bilingual support.",
        version="1.0.0",
        lifespan=lifespan,
        docs_url=None if production else "/docs",
        redoc_url=None if production else "/redoc",
        openapi_url=None if production else "/openapi.json",
    )

    # The app has no cookie-based login, so cross-origin credentials are not needed.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
        allow_headers=["Accept", "Accept-Language", "Content-Language", "Content-Type", "X-Admin-Token"],
    )

    @app.middleware("http")
    async def enforce_request_size_limit(request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > request_size_limit_bytes():
                    return JSONResponse(status_code=413, content={"detail": "Request payload too large."})
            except ValueError:
                return JSONResponse(status_code=400, content={"detail": "Invalid content-length header."})
        return await call_next(request)

    @app.middleware("http")
    async def apply_security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
        response.headers["Cache-Control"] = "no-store"
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
        return response

    @app.exception_handler(Exception)
    async def generic_exception_handler(_request: Request, exc: Exception):
        logger.exception("Unhandled backend error: %s", type(exc).__name__)
        return JSONResponse(status_code=500, content={"detail": "Internal server error."})

    # Register API Routers
    app.include_router(chat.router)
    app.include_router(symptom_checker.router)
    app.include_router(medications.router)
    app.include_router(health.router)

    @app.get("/")
    def root():
        return {
            "app": "MediMind AI",
            "tagline": "Your AI-powered health companion",
            "scope": "Educational & Student Project - Strictly Non-Diagnostic",
            "emergency_advice": "For life-threatening emergencies, call 112 in India, 911 in the US/Canada, or your local emergency number.",
            "documentation": None if production else "/docs"
        }

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=not is_production(),
    )
