"""
PhoneMarket — Authentication Router.

Endpoints:
  POST /auth/register — create a new user account
  POST /auth/login    — authenticate and receive a JWT
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ─────────────────────────────────────────────
# POST /auth/register
# ─────────────────────────────────────────────
@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new user account.

    • Validates phone uniqueness.
    • Hashes password before storage.
    • Captures location (lat/long) from the client device.
    """
    # Check duplicate phone
    existing = await db.execute(
        select(User).where(User.phone == payload.phone)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this phone number already exists",
        )

    # Check duplicate email (if provided)
    if payload.email:
        existing_email = await db.execute(
            select(User).where(User.email == payload.email)
        )
        if existing_email.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists",
            )

    user = User(
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        role=payload.role,
        shop_name=payload.shop_name,
        is_individual=payload.is_individual,
        address_street=payload.address_street,
        address_city=payload.address_city,
        location_lat=payload.location_lat,
        location_long=payload.location_long,
    )

    # Store hashed password
    user.hashed_password = hash_password(payload.password)

    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


# ─────────────────────────────────────────────
# POST /auth/login
# ─────────────────────────────────────────────
@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and receive a JWT token",
)
async def login(
    payload: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate with phone + password.
    Returns a JWT access token on success.
    """
    result = await db.execute(
        select(User).where(User.phone == payload.phone)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password",
        )

    access_token = create_access_token(data={
        "sub": str(user.id),
        "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
        "name": user.name,
    })

    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        role=user.role,
    )
