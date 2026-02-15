"""
PhoneMarket — Seed Data Script.

Populates the database with test users, listings, an order, and chat messages
by hitting the local API at http://localhost:8000.

Usage:
    pip install requests
    python seed_data.py
"""

import requests
import random
import time

BASE_URL = "http://localhost:8000/api/v1"

# ─── Karachi-area random coordinates ─────────
def rand_coord():
    return (
        round(24.85 + random.uniform(-0.05, 0.05), 4),
        round(67.00 + random.uniform(-0.05, 0.05), 4),
    )


def register_and_login(user_data: dict) -> str:
    """Register a user and return their access token."""
    requests.post(f"{BASE_URL}/auth/register", json=user_data)
    r = requests.post(
        f"{BASE_URL}/auth/login",
        json={"phone": user_data["phone"], "password": user_data["password"]},
    )
    r.raise_for_status()
    return r.json()["access_token"]


def seed():
    print("🚀  PhoneMarket — Seeding Database\n")

    # ── 1. Admin ──────────────────────────────
    admin = {
        "name": "Super Admin",
        "phone": "0300-0000000",
        "password": "admin123",
        "role": "admin",
    }
    admin_token = register_and_login(admin)
    print(f"  ✅  Admin   → {admin['phone']} / {admin['password']}")

    # ── 2. Sellers ────────────────────────────
    sellers = [
        {
            "name": "MobileShop 1",
            "phone": "0311-1234567",
            "password": "password123",
            "role": "seller",
            "address_city": "Karachi",
            "location_lat": 24.8607,
            "location_long": 67.0011,
        },
        {
            "name": "John Doe",
            "phone": "0322-7654321",
            "password": "password123",
            "role": "seller",
            "address_city": "Lahore",
            "location_lat": 31.5204,
            "location_long": 74.3587,
        },
    ]

    seller_tokens = []
    for s in sellers:
        seller_tokens.append(register_and_login(s))
    print(f"  ✅  Sellers  → {len(sellers)} created")

    # ── 3. Buyer ──────────────────────────────
    buyer = {
        "name": "Test Buyer",
        "phone": "0333-5555555",
        "password": "password123",
        "role": "buyer",
        "address_city": "Karachi",
        "location_lat": 24.8700,
        "location_long": 67.0300,
    }
    buyer_token = register_and_login(buyer)
    print(f"  ✅  Buyer   → {buyer['phone']} / {buyer['password']}")

    # ── 4. Listings ───────────────────────────
    listings_data = [
        {
            "brand": "Apple",
            "model": "iPhone 15 Pro",
            "price": 350000,
            "phone_type": "used",
            "ram_gb": 8,
            "storage_gb": 256,
            "battery_capacity_mah": 4441,
            "camera_resolution_mp": 48,
            "battery_health_percent": 98,
            "condition_rating": 9,
            "pta_approved": True,
            "is_locally_used": True,
        },
        {
            "brand": "Samsung",
            "model": "Galaxy S24 Ultra",
            "price": 280000,
            "phone_type": "used",
            "ram_gb": 12,
            "storage_gb": 512,
            "battery_capacity_mah": 5000,
            "camera_resolution_mp": 200,
            "battery_health_percent": 100,
            "condition_rating": 10,
            "pta_approved": True,
            "is_locally_used": True,
        },
        {
            "brand": "Google",
            "model": "Pixel 8 Pro",
            "price": 180000,
            "phone_type": "used",
            "ram_gb": 12,
            "storage_gb": 128,
            "battery_capacity_mah": 5050,
            "camera_resolution_mp": 50,
            "battery_health_percent": 95,
            "condition_rating": 8,
            "pta_approved": False,
            "is_locally_used": False,
        },
        {
            "brand": "Apple",
            "model": "iPhone 14",
            "price": 190000,
            "phone_type": "used",
            "ram_gb": 6,
            "storage_gb": 128,
            "battery_capacity_mah": 3279,
            "camera_resolution_mp": 12,
            "battery_health_percent": 90,
            "condition_rating": 7,
            "pta_approved": True,
            "is_locally_used": False,
        },
        {
            "brand": "Xiaomi",
            "model": "14 Ultra",
            "price": 150000,
            "phone_type": "new",
            "ram_gb": 16,
            "storage_gb": 512,
            "battery_capacity_mah": 5300,
            "camera_resolution_mp": 50,
            "processor_name": "Snapdragon 8 Gen 3",
            "warranty_period": "12 months",
        },
    ]

    listing_ids = []
    for i, listing in enumerate(listings_data):
        lat, lng = rand_coord()
        listing["location_lat"] = lat
        listing["location_long"] = lng

        token = seller_tokens[i % len(seller_tokens)]
        r = requests.post(
            f"{BASE_URL}/listings/",
            json=listing,
            headers={"Authorization": f"Bearer {token}"},
        )
        r.raise_for_status()
        listing_ids.append(r.json()["id"])

    print(f"  ✅  Listings → {len(listings_data)} created")

    # ── 5. Order ──────────────────────────────
    r = requests.post(
        f"{BASE_URL}/orders/",
        json={"listing_id": listing_ids[0]},
        headers={"Authorization": f"Bearer {buyer_token}"},
    )
    r.raise_for_status()
    order_id = r.json()["id"]
    print(f"  ✅  Order   → {order_id}")

    # ── 6. Chat Messages (via WebSocket) ──────
    import asyncio
    import json

    async def send_chat_messages():
        try:
            import websockets
        except ImportError:
            print("  ⚠️  Skipping chat seeding (install 'websockets' to enable)")
            return

        ws_url = f"ws://localhost:8000/ws/chat/{order_id}"

        async with websockets.connect(f"{ws_url}?token={buyer_token}") as buyer_ws:
            # Read join message
            await buyer_ws.recv()

            async with websockets.connect(f"{ws_url}?token={seller_tokens[0]}") as seller_ws:
                # Read join messages
                await seller_ws.recv()
                await buyer_ws.recv()

                # Buyer sends first message
                await buyer_ws.send(json.dumps({
                    "content": "Hi, is this iPhone 15 Pro still available?",
                    "recipient_type": "group",
                    "message_type": "text",
                }))
                await seller_ws.recv()
                await buyer_ws.recv()

                # Seller replies
                await seller_ws.send(json.dumps({
                    "content": "Yes, it's available! Battery health is 98%. When can you meet?",
                    "recipient_type": "group",
                    "message_type": "text",
                }))
                await buyer_ws.recv()
                await seller_ws.recv()

                # Buyer responds
                await buyer_ws.send(json.dumps({
                    "content": "Great! I can meet tomorrow at Liberty Market. Is 3 PM okay?",
                    "recipient_type": "group",
                    "message_type": "text",
                }))
                await seller_ws.recv()
                await buyer_ws.recv()

        print("  ✅  Chat    → 3 messages seeded")

    asyncio.run(send_chat_messages())

    # ── Done ──────────────────────────────────
    print("\n🎉  Seeding complete!")
    print(f"\n   Admin login:  {admin['phone']} / {admin['password']}")
    print(f"   Buyer login:  {buyer['phone']} / {buyer['password']}")
    print(f"   Seller login: {sellers[0]['phone']} / {sellers[0]['password']}")
    print(f"\n   Frontend:     http://localhost:3000")
    print(f"   Backend:      http://localhost:8000/docs")


if __name__ == "__main__":
    try:
        seed()
    except Exception as e:
        print(f"\n❌  Error: {e}")
        print("💡  Make sure the backend is running at http://localhost:8000")
