"""
Chat Verification Script — Tests Real-Time WebSocket and REST history.
"""
import asyncio
import json
import uuid
import httpx
import websockets


async def test_chat():
    base_url = "http://localhost:8000/api/v1"
    ws_url = "ws://localhost:8000/ws/chat"
    
    async with httpx.AsyncClient() as client:
        # 1. Create unique test users
        # Phone: 03XX-XXXXXXX
        import random
        suffix_s = "".join(str(random.randint(0, 9)) for _ in range(7))
        suffix_b = "".join(str(random.randint(0, 9)) for _ in range(7))
        
        # Seller
        seller_payload = {
            "name": f"Seller {suffix_s}",
            "phone": f"0300-{suffix_s}",
            "password": "password123",
            "role": "seller",
            "is_individual": True,
            "address_city": "Karachi",
            "location_lat": 24.8607,
            "location_long": 67.0011
        }
        await client.post(f"{base_url}/auth/register", json=seller_payload)
        r = await client.post(f"{base_url}/auth/login", json={"phone": seller_payload["phone"], "password": "password123"})
        seller_token = r.json()["access_token"]
        
        # Buyer
        buyer_payload = {
            "name": f"Buyer {suffix_b}",
            "phone": f"0311-{suffix_b}",
            "password": "password123",
            "role": "buyer",
            "address_city": "Karachi",
            "location_lat": 24.8607,
            "location_long": 67.0011
        }
        await client.post(f"{base_url}/auth/register", json=buyer_payload)
        r = await client.post(f"{base_url}/auth/login", json={"phone": buyer_payload["phone"], "password": "password123"})
        buyer_token = r.json()["access_token"]
        
        # 2. Create a Listing
        listing_payload = {
            "phone_type": "used",
            "brand": "Apple",
            "model": "iPhone 15",
            "price": 150000,
            "ram_gb": 6,
            "storage_gb": 128,
            "battery_capacity_mah": 3349,
            "camera_resolution_mp": 48,
            "battery_health_percent": 100,
            "pta_approved": True,
            "condition_rating": 10,
            "location_lat": 24.8607,
            "location_long": 67.0011
        }
        r = await client.post(f"{base_url}/listings/", json=listing_payload, headers={"Authorization": f"Bearer {seller_token}"})
        listing_id = r.json()["id"]
        
        # 3. Create an Order
        r = await client.post(f"{base_url}/orders/", json={"listing_id": listing_id}, headers={"Authorization": f"Bearer {buyer_token}"})
        order_id = r.json()["id"]
        print(f"Order created: {order_id}")

        # 4. Test WebSocket connections
        # Buyer connects
        async with websockets.connect(f"{ws_url}/{order_id}?token={buyer_token}") as buyer_ws:
            # Receive join message
            buyer_join = await buyer_ws.recv()
            print(f"Buyer received: {buyer_join}")
            
            # Seller connects
            async with websockets.connect(f"{ws_url}/{order_id}?token={seller_token}") as seller_ws:
                # Seller receives join message (from self)
                seller_join = await seller_ws.recv()
                print(f"Seller received: {seller_join}")
                
                # Buyer receives seller join message
                buyer_recv_seller_join = await buyer_ws.recv()
                print(f"Buyer received join: {buyer_recv_seller_join}")
                
                # 5. Send message from Buyer (Group)
                msg_payload = {
                    "content": "Hello Seller!",
                    "recipient_type": "group",
                    "message_type": "text"
                }
                await buyer_ws.send(json.dumps(msg_payload))
                
                # Seller should receive it
                seller_recv_msg = await seller_ws.recv()
                print(f"Seller received message: {seller_recv_msg}")
                
                # Buyer should also receive their own broadcast
                buyer_recv_own_msg = await buyer_ws.recv()
                print(f"Buyer received own message: {buyer_recv_own_msg}")

                # 6. Test filtered broadcast (Simulating an Admin is harder without an actual admin account, 
                # but we can check if messages are saved to DB and hidden from non-recipients)
                # For now, let's just test that the chat history works.

        # 7. Verify REST History
        r = await client.get(f"{base_url}/chat/{order_id}/history", headers={"Authorization": f"Bearer {buyer_token}"})
        history = r.json()
        print(f"Chat History (Buyer): {len(history['messages'])} messages")
        assert len(history['messages']) >= 1
        assert history['messages'][-1]['content'] == "Hello Seller!"

    print("\n=== CHAT VERIFICATION PASSED ===")

if __name__ == "__main__":
    asyncio.run(test_chat())
