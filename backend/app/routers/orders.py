"""
PhoneMarket — Orders Router.

Endpoints:
  POST /orders/         — buyer initiates a purchase request
  GET  /orders/         — list orders for current user
  GET  /orders/{id}     — order detail
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.order import Order, OrderStatus
from app.models.phone_listing import ListingStatus, PhoneListing
from app.models.user import User, UserRole
from app.schemas.order import OrderCreate, OrderOut

router = APIRouter(prefix="/orders", tags=["Orders"])


# ─── Helper: Build OrderOut with safe seller info ──
def _build_order_out(order: Order, seller: User, listing: PhoneListing) -> OrderOut:
    """Construct an OrderOut — exposes seller CITY only, never street."""
    return OrderOut(
        id=order.id,
        buyer_id=order.buyer_id,
        seller_id=order.seller_id,
        listing_id=order.listing_id,
        status=order.status,
        agreed_price=float(order.agreed_price) if order.agreed_price else None,
        meeting_location=order.meeting_location,
        meeting_notes=order.meeting_notes,
        cancellation_reason=order.cancellation_reason,
        seller_city=seller.address_city,
        listing_brand=listing.brand,
        listing_model=listing.model,
        listing_price=float(listing.price),
        created_at=order.created_at,
        updated_at=order.updated_at,
    )


# ─────────────────────────────────────────────
# POST /orders/ — Request Purchase
# ─────────────────────────────────────────────
@router.post(
    "/",
    response_model=OrderOut,
    status_code=status.HTTP_201_CREATED,
    summary="Request purchase (Buyer only)",
)
async def create_order(
    payload: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Buyer clicks "Request Purchase" → creates an Order with status
    **CREATED** (pending admin review).

    Constraints:
      • Only buyers can create orders.
      • The listing must exist and be AVAILABLE.
      • Buyer cannot order their own listing.
      • Seller's exact address is NOT returned — only city/general area.
    """
    if current_user.role != UserRole.BUYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can create purchase requests",
        )

    # Fetch listing + seller in one query
    result = await db.execute(
        select(PhoneListing, User)
        .join(User, PhoneListing.seller_id == User.id)
        .where(PhoneListing.id == payload.listing_id)
    )
    row = result.first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )

    listing, seller = row

    if listing.status != ListingStatus.AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Listing is not available (current status: {listing.status.value})",
        )

    if listing.seller_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot purchase your own listing",
        )

    # Check for duplicate active order
    existing_order = await db.execute(
        select(Order).where(
            Order.buyer_id == current_user.id,
            Order.listing_id == payload.listing_id,
            Order.status.in_([OrderStatus.CREATED, OrderStatus.ADMIN_REVIEW, OrderStatus.MEETING_SCHEDULED]),
        )
    )
    if existing_order.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have an active order for this listing",
        )

    # Mark listing as pending
    listing.status = ListingStatus.PENDING

    order = Order(
        buyer_id=current_user.id,
        seller_id=seller.id,
        listing_id=listing.id,
        status=OrderStatus.CREATED,
        agreed_price=listing.price,
    )

    db.add(order)
    await db.flush()
    await db.refresh(order)

    return _build_order_out(order, seller, listing)


# ─────────────────────────────────────────────
# GET /orders/ — My Orders
# ─────────────────────────────────────────────
@router.get(
    "/",
    response_model=list[OrderOut],
    summary="List orders for current user",
)
async def list_orders(
    order_status: OrderStatus | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns orders where the current user is the buyer, seller, or admin.
    Admins see all orders; buyers/sellers see only their own.
    """
    query = (
        select(Order, User, PhoneListing)
        .join(User, Order.seller_id == User.id)
        .join(PhoneListing, Order.listing_id == PhoneListing.id)
    )

    if current_user.role == UserRole.ADMIN:
        pass  # Admin sees everything
    else:
        query = query.where(
            or_(
                Order.buyer_id == current_user.id,
                Order.seller_id == current_user.id,
            )
        )

    if order_status:
        query = query.where(Order.status == order_status)

    query = (
        query
        .order_by(Order.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    result = await db.execute(query)
    rows = result.all()

    return [_build_order_out(order, seller, listing) for order, seller, listing in rows]


# ─────────────────────────────────────────────
# GET /orders/{order_id} — Order Detail
# ─────────────────────────────────────────────
@router.get(
    "/{order_id}",
    response_model=OrderOut,
    summary="Get order details",
)
async def get_order_detail(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific order. Only accessible by involved parties or admin."""
    result = await db.execute(
        select(Order, User, PhoneListing)
        .join(User, Order.seller_id == User.id)
        .join(PhoneListing, Order.listing_id == PhoneListing.id)
        .where(Order.id == order_id)
    )
    row = result.first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    order, seller, listing = row

    # Authorization check
    if current_user.role != UserRole.ADMIN and current_user.id not in (
        order.buyer_id,
        order.seller_id,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this order",
        )

    return _build_order_out(order, seller, listing)
