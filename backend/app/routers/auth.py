from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.schemas.schemas import UserCreate, UserOut, TokenOut
from app.config import get_settings
import hashlib, uuid, jwt
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, settings.secret_key, algorithms=[settings.algorithm])
        user_id = payload.get("sub")
        if not user_id:
            return None
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
    except Exception:
        return None


@router.get("/me", response_model=UserOut | None)
async def get_me(user: User = Depends(get_current_user)):
    return user


def _hash_password(password: str) -> str:
    salt = uuid.uuid4().hex
    return f"{salt}${hashlib.sha256((salt + password).encode()).hexdigest()}"


def _verify_password(password: str, hashed: str) -> bool:
    salt, h = hashed.split("$", 1)
    return h == hashlib.sha256((salt + password).encode()).hexdigest()


@router.post("/register", response_model=UserOut)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    import traceback
    try:
        existing = await db.execute(select(User).where(User.email == payload.email))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already registered")

        user = User(
            email=payload.email,
            name=payload.name,
            telegram_chat_id=payload.telegram_chat_id,
            password_hash=_hash_password(payload.password) if payload.password else None,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
    except HTTPException:
        raise
    except Exception as e:
        print(f"Register error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login", response_model=TokenOut)
async def login(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not _verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = jwt.encode(
        {
            "sub": str(user.id),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes),
        },
        settings.secret_key,
        algorithm=settings.algorithm,
    )
    return TokenOut(access_token=token)
