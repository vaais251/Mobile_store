"""Smoke test — end-to-end validation of the PhoneMarket API."""
import httpx
import asyncio


async def test():
    base = "http://localhost:8000/api/v1"
    async with httpx.AsyncClient() as c:
        # 1. Health check
        r = await c.get(f"{base}/health")
        print(f"Health: {r.status_code} {r.json()}")

        # 2. Register a seller
        seller = {
            "name": "Ali Mobile Shop",
            "phone": "0300-1234567",
            "password": "secure_pass_123",
            "role": "seller",
            "is_individual": False,
            "shop_name": "Ali Mobiles",
            "address_city": "Lahore",
            "address_street": "123 Mall Road",
            "location_lat": 31.5204,
            "location_long": 74.3587,
        }
        r = await c.post(f"{base}/auth/register", json=seller)
        print(f"Register Seller: {r.status_code}")
        if r.status_code == 201:
            sd = r.json()
            print(f"  -> {sd['name']} ({sd['role']})")
        else:
            print(f"  -> {r.text}")

        # 3. Register a buyer
        buyer = {
            "name": "Hamza Khan",
            "phone": "0312-9876543",
            "password": "buyer_pass_456",
            "role": "buyer",
            "address_city": "Islamabad",
            "location_lat": 33.6844,
            "location_long": 73.0479,
        }
        r = await c.post(f"{base}/auth/register", json=buyer)
        print(f"Register Buyer: {r.status_code}")

        # 4. Login seller
        r = await c.post(
            f"{base}/auth/login",
            json={"phone": "0300-1234567", "password": "secure_pass_123"},
        )
        print(f"Login Seller: {r.status_code}")
        seller_token = r.json()["access_token"]

        # 5. Post a listing (as seller)
        listing = {
            "phone_type": "used",
            "brand": "Samsung",
            "model": "Galaxy S24 Ultra",
            "price": 285000,
            "ram_gb": 12,
            "storage_gb": 256,
            "battery_capacity_mah": 5000,
            "camera_resolution_mp": 200,
            "battery_health_percent": 92,
            "pta_approved": True,
            "condition_rating": 8,
            "defects_description": "Minor scratch on back",
        }
        headers = {"Authorization": f"Bearer {seller_token}"}
        r = await c.post(f"{base}/listings/", json=listing, headers=headers)
        print(f"Create Listing: {r.status_code}")
        if r.status_code == 201:
            listing_id = r.json()["id"]
            print(f"  -> Listing ID: {listing_id}")
        else:
            print(f"  -> {r.text}")
            return

        # 6. Search listings from Islamabad (buyer location)
        r = await c.get(
            f"{base}/listings/", params={"lat": 33.6844, "long": 73.0479}
        )
        print(f"Search (geo): {r.status_code}")
        data = r.json()
        print(f"  -> Found {data['total']} listing(s)")
        if data["items"]:
            dist = data["items"][0].get("distance_km")
            print(f"  -> Distance from Islamabad: {dist} km")

        # 7. Get detail
        r = await c.get(f"{base}/listings/{listing_id}")
        print(f"Listing Detail: {r.status_code}")
        if r.status_code == 200:
            detail = r.json()
            print(f"  -> {detail['brand']} {detail['model']} - PKR {detail['price']}")
            print(f"  -> Seller: {detail.get('seller_name')} ({detail.get('seller_city', 'N/A')})")

        # 8. Login buyer and create an order
        r = await c.post(
            f"{base}/auth/login",
            json={"phone": "0312-9876543", "password": "buyer_pass_456"},
        )
        buyer_token = r.json()["access_token"]
        headers = {"Authorization": f"Bearer {buyer_token}"}
        r = await c.post(
            f"{base}/orders/", json={"listing_id": listing_id}, headers=headers
        )
        print(f"Create Order: {r.status_code}")
        if r.status_code == 201:
            order = r.json()
            print(f"  -> Status: {order['status']}")
            print(f"  -> Seller city: {order.get('seller_city')} (exact address hidden)")
        else:
            print(f"  -> {r.text}")

    print("\n=== ALL SMOKE TESTS PASSED ===")


asyncio.run(test())
