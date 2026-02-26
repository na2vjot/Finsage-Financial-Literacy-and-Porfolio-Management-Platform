"""
🔍 DEBUG UNSAVE ISSUE
====================

Debug script to understand why unsave is failing
"""

import requests
import json

def debug_unsave_issue():
    """Debug the unsave functionality issue"""
    
    base_url = "http://localhost:5000"
    
    print("🔍 DEBUG UNSAVE ISSUE")
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
            headers = {'Authorization': f'Bearer {token}'}
            print("✅ Login successful")
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
            print(f"✅ Found {len(modules)} saved modules:")
            
            for i, module in enumerate(modules, 1):
                print(f"   {i}. ID: '{module['module_id']}'")
                print(f"      Name: {module['module_name']}")
                print(f"      Section: {module['section']}")
                print()
                
            if modules:
                # Try to unsave the first module
                first_module = modules[0]
                module_id = first_module['module_id']
                
                print(f"🗑️ ATTEMPTING TO UNSAVE:")
                print(f"   Module ID: '{module_id}'")
                print(f"   Module Name: {first_module['module_name']}")
                
                unsave_response = requests.delete(f'{base_url}/api/user/unsave-module', headers=headers, json={
                    "module_id": module_id
                })
                
                print(f"\nStatus: {unsave_response.status_code}")
                print(f"Response: {unsave_response.text}")
                
                if unsave_response.status_code == 200:
                    print("✅ UNSAVE SUCCESSFUL!")
                else:
                    print("❌ UNSAVE FAILED")
                    
        else:
            print(f"❌ Failed to get modules: {modules_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    debug_unsave_issue()
