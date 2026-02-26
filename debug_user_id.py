"""
🔍 DEBUG USER ID ISSUE
======================

Check if user_id is the problem in unsave functionality
"""

import requests
import json

def debug_user_id_issue():
    """Debug user_id in unsave functionality"""
    
    base_url = "http://localhost:5000"
    
    print("🔍 DEBUG USER ID ISSUE")
    print("=" * 30)
    
    # Login
    login_data = {
        "email": "admin@finsage.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f'{base_url}/api/auth/login', json=login_data)
        if response.status_code == 200 and response.json().get('success'):
            token = response.json()['token']
            user_data = response.json()['user']
            headers = {'Authorization': f'Bearer {token}'}
            
            print("✅ Login successful")
            print(f"   User ID from login: {user_data['_id']}")
            print(f"   User email: {user_data['email']}")
            
        else:
            print("❌ Login failed")
            return
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    # Get saved modules
    print("\n📋 GETTING SAVED MODULES...")
    try:
        modules_response = requests.get(f'{base_url}/api/user/saved-modules-list', headers=headers)
        if modules_response.status_code == 200:
            modules = modules_response.json()['modules']
            
            if modules:
                first_module = modules[0]
                print(f"First module:")
                print(f"   Module ID: '{first_module['module_id']}'")
                print(f"   Module Name: {first_module['module_name']}")
                print(f"   _id: {first_module.get('_id', 'No _id field')}")
                
                # Try to get user statistics to see user_id
                stats_response = requests.get(f'{base_url}/api/user/statistics', headers=headers)
                if stats_response.status_code == 200:
                    stats = stats_response.json()['statistics']
                    print(f"\n📊 User Statistics:")
                    print(f"   User ID in stats: {stats.get('user_id', 'No user_id in stats')}")
                    
                # Try unsave with explicit user_id from login
                print(f"\n🗑️ TESTING UNSAVE WITH DEBUG INFO:")
                print(f"   Using user_id: {user_data['_id']}")
                print(f"   Using module_id: '{first_module['module_id']}'")
                
                unsave_response = requests.delete(f'{base_url}/api/user/unsave-module', headers=headers, json={
                    "module_id": first_module['module_id']
                })
                
                print(f"\nStatus: {unsave_response.status_code}")
                print(f"Response: {unsave_response.text}")
                
        else:
            print(f"❌ Failed to get modules: {modules_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    debug_user_id_issue()
