"""
PhoneMarket — Seed Data Script.

Populates the database with 3 test users, 5 phone listings (each with 2 AI-
generated images), an order, and chat messages by hitting the local API at
http://localhost:8000.

Usage:
    pip install requests
    python seed_data.py
"""

import requests
import random

BASE_URL = "http://localhost:8000/api/v1"
STATIC_URL = "http://localhost:8000/static/seed_images"


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
        "address_street": "123 Admin Tower, I.I. Chundrigar Road",
        "address_city": "Karachi",
        "location_lat": 24.8607,
        "location_long": 67.0011,
    }
    admin_token = register_and_login(admin)
    print(f"  ✅  Admin   → {admin['phone']} / {admin['password']}")

    # ── 2. Seller ─────────────────────────────
    seller = {
        "name": "Ali Mobile Zone",
        "phone": "0311-1234567",
        "password": "password123",
        "role": "seller",
        "address_street": "Shop #42, Mobile Market, Saddar",
        "address_city": "Karachi",
        "shop_name": "Ali Mobile Zone",
        "is_individual": False,
        "location_lat": 24.8607,
        "location_long": 67.0011,
    }
    seller_token = register_and_login(seller)
    print(f"  ✅  Seller  → {seller['phone']} / {seller['password']}")

    # ── 3. Buyer ──────────────────────────────
    buyer = {
        "name": "Ahmed Khan",
        "phone": "0333-5555555",
        "password": "password123",
        "role": "buyer",
        "address_street": "House 12, Block 5, Clifton",
        "address_city": "Karachi",
        "location_lat": 24.8700,
        "location_long": 67.0300,
    }
    buyer_token = register_and_login(buyer)
    print(f"  ✅  Buyer   → {buyer['phone']} / {buyer['password']}")

    # ── 4. Listings (5 phones, 2 images each) ─
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
            "defects_description": "Minor scratch on the back glass, barely visible.",
            "accessories_included": ["Charger", "Original Box"],
            "thumbnail_image": f"{STATIC_URL}/iphone15pro_front.png",
            "additional_images": [
                f"{STATIC_URL}/iphone15pro_front.png",
                f"{STATIC_URL}/iphone15pro_back.png",
            ],
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
            "defects_description": "No defects. Phone is in mint condition.",
            "accessories_included": ["S Pen", "Charger", "Case", "Original Box"],
            "thumbnail_image": f"{STATIC_URL}/galaxy_s24_ultra_front.png",
            "additional_images": [
                f"{STATIC_URL}/galaxy_s24_ultra_front.png",
                f"{STATIC_URL}/galaxy_s24_ultra_back.png",
            ],
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
            "defects_description": "Screen has factory screen protector only.",
            "accessories_included": ["Charger"],
            "thumbnail_image": f"{STATIC_URL}/pixel8pro_front.png",
            "additional_images": [
                f"{STATIC_URL}/pixel8pro_front.png",
                f"{STATIC_URL}/pixel8pro_back.png",
            ],
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
            "defects_description": "Small dent on the corner, fully functional.",
            "accessories_included": ["Charger"],
            "thumbnail_image": f"{STATIC_URL}/iphone14_front.png",
            "additional_images": [
                f"{STATIC_URL}/iphone14_front.png",
                f"{STATIC_URL}/iphone14_back.png",
            ],
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
            "thumbnail_image": f"{STATIC_URL}/xiaomi14ultra_front.png",
            "additional_images": [
                f"{STATIC_URL}/xiaomi14ultra_front.png",
                f"{STATIC_URL}/xiaomi14ultra_back.png",
            ],
        },
    ]

    listing_ids = []
    for listing in listings_data:
        lat, lng = rand_coord()
        listing["location_lat"] = lat
        listing["location_long"] = lng

        r = requests.post(
            f"{BASE_URL}/listings/",
            json=listing,
            headers={"Authorization": f"Bearer {seller_token}"},
        )
        r.raise_for_status()
        listing_ids.append(r.json()["id"])

    print(f"  ✅  Listings → {len(listings_data)} created (each with 2 images)")

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
            await buyer_ws.recv()

            async with websockets.connect(f"{ws_url}?token={seller_token}") as seller_ws:
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
                    "content": "Great! I can meet tomorrow at Saddar. Is 3 PM okay?",
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
    print(f"   Seller login: {seller['phone']} / {seller['password']}")
    print(f"\n   Frontend:     http://localhost:3000")
    print(f"   Backend:      http://localhost:8000/docs")


if __name__ == "__main__":
    try:
        seed()
    except Exception as e:
        print(f"\n❌  Error: {e}")
        print("💡  Make sure the backend is running at http://localhost:8000")
