"""
PhoneMarket — Phone Listing Schemas.

Handles creation (New vs Used validation), filtering with geo-proximity,
and response serialisation.
"""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, model_validator

from app.models.phone_listing import ListingStatus, PhoneType


# ─── Creation ────────────────────────────────
class PhoneListingCreate(BaseModel):
    """
    Create a phone listing.

    Validation rules:
      • phone_type == "used"  → battery_health_percent, pta_approved,
                                 condition_rating are REQUIRED.
      • phone_type == "new"   → processor_name, warranty_period are REQUIRED.
    """

    phone_type: PhoneType

    # Shared specs (always required)
    brand: str = Field(..., min_length=1, max_length=50)
    model: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., gt=0)
    ram_gb: int = Field(..., gt=0)
    storage_gb: int = Field(..., gt=0)
    battery_capacity_mah: int = Field(..., gt=0)
    camera_resolution_mp: int = Field(..., gt=0)
    thumbnail_image: str | None = None
    additional_images: list[str] | None = None

    # Used-specific (conditionally required)
    battery_health_percent: int | None = Field(None, ge=0, le=100)
    pta_approved: bool | None = None
    condition_rating: int | None = Field(None, ge=1, le=10)
    defects_description: str | None = None
    accessories_included: list[str] | None = None

    # New-specific (conditionally required)
    processor_name: str | None = Field(None, max_length=100)
    warranty_period: str | None = Field(None, max_length=50)

    # Location override (optional — defaults to seller's location)
    location_lat: float | None = Field(None, ge=-90, le=90)
    location_long: float | None = Field(None, ge=-180, le=180)

    @model_validator(mode="after")
    def validate_type_specific_fields(self):
        """Enforce required fields based on phone_type."""
        if self.phone_type == PhoneType.USED:
            missing = []
            if self.battery_health_percent is None:
                missing.append("battery_health_percent")
            if self.pta_approved is None:
                missing.append("pta_approved")
            if self.condition_rating is None:
                missing.append("condition_rating")
            if missing:
                raise ValueError(
                    f"Used phones require: {', '.join(missing)}"
                )
        elif self.phone_type == PhoneType.NEW:
            missing = []
            if not self.processor_name:
                missing.append("processor_name")
            if not self.warranty_period:
                missing.append("warranty_period")
            if missing:
                raise ValueError(
                    f"New phones require: {', '.join(missing)}"
                )
        return self


# ─── Filter / Search ────────────────────────
class PhoneFilter(BaseModel):
    """
    Query-parameter schema for advanced listing search.

    When lat/long are provided, results are sorted by proximity
    using the Haversine formula. When radius_km is also set,
    only listings within that radius are returned.
    """

    brand: str | None = None
    phone_type: PhoneType | None = None
    status: ListingStatus | None = Field(None)

    price_min: float | None = Field(None, ge=0)
    price_max: float | None = Field(None, ge=0)

    ram_gb: list[int] | None = Field(None, description="Filter by multiple RAM options, e.g. [4, 6, 8]")
    storage_gb: int | None = Field(None, gt=0)

    pta_approved: bool | None = None

    # Geo proximity
    lat: float | None = Field(None, ge=-90, le=90)
    long: float | None = Field(None, ge=-180, le=180)
    radius_km: float | None = Field(None, gt=0, description="Max distance in km")

    # Pagination
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)


# ─── Response: List Item ────────────────────
class PhoneListingOut(BaseModel):
    """Compact listing card for search results."""

    id: uuid.UUID
    seller_id: uuid.UUID
    status: ListingStatus
    phone_type: PhoneType

    brand: str
    model: str
    price: float
    ram_gb: int
    storage_gb: int
    thumbnail_image: str | None = None

    # Location (resolved: listing override or seller fallback)
    location_lat: float | None = None
    location_long: float | None = None
    location_city: str | None = None

    # Distance (populated when geo-search is active)
    distance_km: float | None = None

    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Response: Detail View ───────────────────
class PhoneListingDetail(PhoneListingOut):
    """Full listing detail — all specs included."""

    battery_capacity_mah: int
    camera_resolution_mp: int
    additional_images: Any | None = None

    # Used-specific
    battery_health_percent: int | None = None
    pta_approved: bool | None = None
    condition_rating: int | None = None
    defects_description: str | None = None
    accessories_included: Any | None = None

    # New-specific
    processor_name: str | None = None
    warranty_period: str | None = None

    # Seller info (safe — no exact address)
    seller_name: str | None = None
    seller_shop_name: str | None = None
    seller_is_individual: bool | None = None

    updated_at: datetime


# ─── Paginated Response Wrapper ──────────────
class PhoneListingListResponse(BaseModel):
    """Paginated listing response."""

    items: list[PhoneListingOut]
    total: int
    page: int
    page_size: int
    total_pages: int
