"""
PhoneMarket — User Schemas.

Handles registration, login, and response serialisation.
Phone numbers are validated with a regex for Pakistani format (0XXX-XXXXXXX)
but also accepts international E.164 (+XXXXXXXXXXX).
"""

import re
import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.user import UserRole


# ─── Validators ──────────────────────────────
_PHONE_RE = re.compile(
    r"^(\+\d{1,3}\d{7,14}|0\d{3}-?\d{7})$"
)


# ─── Registration ────────────────────────────
class UserCreate(BaseModel):
    """Schema for user registration."""

    name: str = Field(..., min_length=2, max_length=120)
    phone: str = Field(..., max_length=20, examples=["0300-1234567", "+923001234567"])
    password: str = Field(..., min_length=8, max_length=128)
    email: EmailStr | None = None
    role: UserRole = UserRole.BUYER

    # Seller-specific
    shop_name: str | None = Field(None, max_length=200)
    is_individual: bool = True

    # Address (required)
    address_street: str = Field(..., min_length=2, max_length=500)
    address_city: str = Field(..., min_length=2, max_length=100)

    # Location (captured from device GPS on registration)
    location_lat: float | None = Field(None, ge=-90, le=90)
    location_long: float | None = Field(None, ge=-180, le=180)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = v.strip()
        if not _PHONE_RE.match(cleaned):
            raise ValueError(
                "Phone must be Pakistani format (0XXX-XXXXXXX) "
                "or international E.164 (+XXXXXXXXXXX)"
            )
        return cleaned

    @field_validator("shop_name")
    @classmethod
    def validate_shop_for_seller(cls, v, info):
        """If the user is NOT individual, shop_name is required."""
        is_individual = info.data.get("is_individual", True)
        if not is_individual and not v:
            raise ValueError("shop_name is required when is_individual is False")
        return v


# ─── Login ───────────────────────────────────
class UserLogin(BaseModel):
    """Login via phone + password."""

    phone: str = Field(..., max_length=20)
    password: str = Field(..., min_length=1)


# ─── Token Response ─────────────────────────
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: uuid.UUID
    role: UserRole


# ─── Public User Output ─────────────────────
class UserOut(BaseModel):
    """Safe user representation (no password, no exact address)."""

    id: uuid.UUID
    name: str
    phone: str
    email: str | None = None
    role: UserRole
    shop_name: str | None = None
    is_individual: bool
    address_street: str = ""
    address_city: str = ""
    location_lat: float | None = None
    location_long: float | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Profile Update ─────────────────────────
class UserUpdate(BaseModel):
    """Schema for updating user profile. All fields optional."""

    name: str | None = Field(None, min_length=2, max_length=120)
    email: EmailStr | None = None
    address_street: str | None = Field(None, min_length=2, max_length=500)
    address_city: str | None = Field(None, min_length=2, max_length=100)
    shop_name: str | None = Field(None, max_length=200)
    is_individual: bool | None = None
    location_lat: float | None = Field(None, ge=-90, le=90)
    location_long: float | None = Field(None, ge=-180, le=180)

    # Password change (optional — only set if user wants to change password)
    current_password: str | None = Field(None, min_length=1)
    new_password: str | None = Field(None, min_length=8, max_length=128)
