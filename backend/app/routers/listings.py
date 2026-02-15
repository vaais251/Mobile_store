"""
PhoneMarket — Listings Router (The Search Engine).

Endpoints:
  POST /listings/        — seller creates a new phone listing
  GET  /listings/        — advanced filtered search with geo-proximity
  GET  /listings/{id}    — detailed listing view
"""

import math
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import Float, case, cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.phone_listing import ListingStatus, PhoneListing, PhoneType
from app.models.user import User, UserRole
from app.schemas.listing import (
    PhoneFilter,
    PhoneListingCreate,
    PhoneListingDetail,
    PhoneListingListResponse,
    PhoneListingOut,
)

router = APIRouter(prefix="/listings", tags=["Listings"])

# ─── Constants ───────────────────────────────
_EARTH_RADIUS_KM = 6371.0


# ─── Haversine SQL Expression ────────────────
def _haversine_expr(lat1, lon1, lat2_col, lon2_col):
    """
    Build a SQLAlchemy expression for the Haversine distance (km)
    between a fixed point (lat1, lon1) and column values.
    """
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = func.radians(cast(lat2_col, Float))
    lon2_rad = func.radians(cast(lon2_col, Float))

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = (
        func.pow(func.sin(dlat / 2), 2)
        + math.cos(lat1_rad)
        * func.cos(lat2_rad)
        * func.pow(func.sin(dlon / 2), 2)
    )
    c = 2 * func.atan2(func.sqrt(a), func.sqrt(1 - a))
    return _EARTH_RADIUS_KM * c


# ─────────────────────────────────────────────
# POST /listings/
# ─────────────────────────────────────────────
@router.post(
    "/",
    response_model=PhoneListingOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new phone listing (Seller only)",
)
async def create_listing(
    payload: PhoneListingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Only authenticated Sellers can post listings.
    Location defaults to the seller's location unless overridden.
    """
    if current_user.role != UserRole.SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can create listings",
        )

    listing = PhoneListing(
        seller_id=current_user.id,
        phone_type=payload.phone_type,
        brand=payload.brand,
        model=payload.model,
        price=payload.price,
        ram_gb=payload.ram_gb,
        storage_gb=payload.storage_gb,
        battery_capacity_mah=payload.battery_capacity_mah,
        camera_resolution_mp=payload.camera_resolution_mp,
        thumbnail_image=payload.thumbnail_image,
        additional_images=(
            {"urls": payload.additional_images}
            if payload.additional_images
            else None
        ),
        # Used-specific
        battery_health_percent=payload.battery_health_percent,
        pta_approved=payload.pta_approved,
        is_locally_used=payload.is_locally_used,
        condition_rating=payload.condition_rating,
        defects_description=payload.defects_description,
        accessories_included=(
            {"items": payload.accessories_included}
            if payload.accessories_included
            else None
        ),
        # New-specific
        processor_name=payload.processor_name,
        warranty_period=payload.warranty_period,
        # Location: override or inherit from seller
        location_lat=payload.location_lat or current_user.location_lat,
        location_long=payload.location_long or current_user.location_long,
    )

    db.add(listing)
    await db.flush()
    await db.refresh(listing)

    return PhoneListingOut(
        id=listing.id,
        seller_id=listing.seller_id,
        status=listing.status,
        phone_type=listing.phone_type,
        brand=listing.brand,
        model=listing.model,
        price=float(listing.price),
        ram_gb=listing.ram_gb,
        storage_gb=listing.storage_gb,
        thumbnail_image=listing.thumbnail_image,
        location_lat=listing.location_lat,
        location_long=listing.location_long,
        location_city=current_user.address_city,
        pta_approved=listing.pta_approved,
        is_locally_used=listing.is_locally_used,
        created_at=listing.created_at,
    )


# ─────────────────────────────────────────────
# GET /listings/ — Advanced Filtered Search
# ─────────────────────────────────────────────
@router.get(
    "/",
    response_model=PhoneListingListResponse,
    summary="Search listings with advanced filters & geo-proximity",
)
async def search_listings(
    # Filters as query params
    brand: str | None = None,
    phone_type: PhoneType | None = None,
    listing_status: ListingStatus | None = Query(None, alias="status"),
    price_min: float | None = Query(None, ge=0),
    price_max: float | None = Query(None, ge=0),
    ram_gb: list[int] | None = Query(None, description="e.g. ram_gb=4&ram_gb=8"),
    storage_gb: int | None = Query(None, gt=0),
    pta_approved: bool | None = None,
    is_locally_used: bool | None = None,
    # Geo
    lat: float | None = Query(None, ge=-90, le=90),
    long: float | None = Query(None, ge=-180, le=180),
    radius_km: float | None = Query(None, gt=0),
    # Pagination
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Advanced listing search engine.

    **Geo-proximity**: When `lat` and `long` are provided, results are
    sorted by nearest distance. The distance uses the effective location
    (listing override → seller fallback). If `radius_km` is also set,
    only listings within that radius are returned.

    **Filters**: Brand, price range, RAM (multi-select), storage, PTA status.
    """
    # ── Effective location columns (COALESCE listing → seller) ──
    eff_lat = func.coalesce(PhoneListing.location_lat, User.location_lat)
    eff_long = func.coalesce(PhoneListing.location_long, User.location_long)

    # ── Base query ──
    query = select(PhoneListing, User.address_city).join(
        User, PhoneListing.seller_id == User.id
    )

    # ── Apply filters ──
    if brand:
        query = query.where(func.lower(PhoneListing.brand) == brand.lower())
    if phone_type:
        query = query.where(PhoneListing.phone_type == phone_type)
    if listing_status:
        query = query.where(PhoneListing.status == listing_status)
    else:
        # Default: only show available listings
        query = query.where(PhoneListing.status == ListingStatus.AVAILABLE)
    if price_min is not None:
        query = query.where(PhoneListing.price >= price_min)
    if price_max is not None:
        query = query.where(PhoneListing.price <= price_max)
    if ram_gb:
        query = query.where(PhoneListing.ram_gb.in_(ram_gb))
    if storage_gb:
        query = query.where(PhoneListing.storage_gb == storage_gb)
    if pta_approved is not None:
        query = query.where(PhoneListing.pta_approved == pta_approved)
    if is_locally_used is not None:
        query = query.where(PhoneListing.is_locally_used == is_locally_used)

    # ── Geo distance ──
    distance_col = None
    if lat is not None and long is not None:
        distance_col = _haversine_expr(lat, long, eff_lat, eff_long).label(
            "distance_km"
        )
        query = query.add_columns(distance_col)

        if radius_km is not None:
            query = query.where(distance_col <= radius_km)

        query = query.order_by(distance_col.asc())
    else:
        query = query.order_by(PhoneListing.created_at.desc())

    # ── Count total before pagination ──
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # ── Paginate ──
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    rows = result.all()

    # ── Serialise ──
    items: list[PhoneListingOut] = []
    for row in rows:
        if distance_col is not None:
            listing, city, dist = row
        else:
            listing, city = row
            dist = None

        items.append(
            PhoneListingOut(
                id=listing.id,
                seller_id=listing.seller_id,
                status=listing.status,
                phone_type=listing.phone_type,
                brand=listing.brand,
                model=listing.model,
                price=float(listing.price),
                ram_gb=listing.ram_gb,
                storage_gb=listing.storage_gb,
                thumbnail_image=listing.thumbnail_image,
                location_lat=listing.location_lat,
                location_long=listing.location_long,
                location_city=city,
                distance_km=round(dist, 2) if dist is not None else None,
                pta_approved=listing.pta_approved,
                is_locally_used=listing.is_locally_used,
                created_at=listing.created_at,
            )
        )

    total_pages = math.ceil(total / page_size) if total > 0 else 0

    return PhoneListingListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


# ─────────────────────────────────────────────
# GET /listings/{listing_id} — Detail View
# ─────────────────────────────────────────────
@router.get(
    "/{listing_id}",
    response_model=PhoneListingDetail,
    summary="Get full listing details",
)
async def get_listing_detail(
    listing_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Returns the full listing with all tech specs and safe seller info
    (name, shop name, city — but NOT the exact street address).
    """
    result = await db.execute(
        select(PhoneListing, User)
        .join(User, PhoneListing.seller_id == User.id)
        .where(PhoneListing.id == listing_id)
    )
    row = result.first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )

    listing, seller = row

    return PhoneListingDetail(
        id=listing.id,
        seller_id=listing.seller_id,
        status=listing.status,
        phone_type=listing.phone_type,
        brand=listing.brand,
        model=listing.model,
        price=float(listing.price),
        ram_gb=listing.ram_gb,
        storage_gb=listing.storage_gb,
        thumbnail_image=listing.thumbnail_image,
        location_lat=listing.location_lat or seller.location_lat,
        location_long=listing.location_long or seller.location_long,
        location_city=seller.address_city,
        created_at=listing.created_at,
        updated_at=listing.updated_at,
        # Full specs
        battery_capacity_mah=listing.battery_capacity_mah,
        camera_resolution_mp=listing.camera_resolution_mp,
        additional_images=listing.additional_images,
        # Used-specific
        battery_health_percent=listing.battery_health_percent,
        pta_approved=listing.pta_approved,
        is_locally_used=listing.is_locally_used,
        condition_rating=listing.condition_rating,
        defects_description=listing.defects_description,
        accessories_included=listing.accessories_included,
        # New-specific
        processor_name=listing.processor_name,
        warranty_period=listing.warranty_period,
        # Seller info (safe)
        seller_name=seller.name,
        seller_shop_name=seller.shop_name,
        seller_is_individual=seller.is_individual,
    )
