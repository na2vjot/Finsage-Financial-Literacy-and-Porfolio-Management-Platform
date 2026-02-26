"""
Debug script to test module saving with actual syllabus data
"""

import requests
import json

def debug_module_saving():
    """Debug the module saving issue"""
    
    base_url = "http://localhost:5000"
    
    print("🐛 DEBUGGING MODULE SAVING ISSUE")
    print("=" * 40)
    
    # Step 1: Login
    print("\n1. Login...")
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
    
    # Step 2: Test different module data formats
    print("\n2. Testing different module data formats...")
    
    test_cases = [
        {
            "name": "Complete module data",
            "data": {
                "module_id": "test-module-123",
                "module_name": "Test Module",
                "section": "Test Section",
                "description": "Test description",
                "difficulty": "beginner",
                "estimated_time": 30,
                "topics": ["test"]
            }
        },
        {
            "name": "Minimal module data",
            "data": {
                "module_id": "minimal-module",
                "module_name": "Minimal Module"
            }
        },
        {
            "name": "Missing module_id",
            "data": {
                "module_name": "No ID Module",
                "section": "Test"
            }
        },
        {
            "name": "Empty module_id",
            "data": {
                "module_id": "",
                "module_name": "Empty ID Module"
            }
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n   Test {i}: {test_case['name']}")
        print(f"   Data: {json.dumps(test_case['data'], indent=6)}")
        
        try:
            response = requests.post(f'{base_url}/api/user/save-module', headers=headers, json=test_case['data'])
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 201:
                print(f"   ✅ Success: {response.json().get('message')}")
            elif response.status_code == 400:
                print(f"   ❌ Bad Request: {response.json().get('message')}")
            else:
                print(f"   ⚠️  Other: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    # Step 3: Check actual syllabus data structure
    print("\n3. Checking syllabus data structure...")
    
    try:
        syllabus_response = requests.get(f'{base_url}/api/syllabus')
        if syllabus_response.status_code == 200:
            syllabus = syllabus_response.json()
            
            # Check first section and module structure
            first_section_key = list(syllabus.keys())[0]
            first_section = syllabus[first_section_key]
            
            print(f"   First section: {first_section_key}")
            print(f"   Section structure keys: {list(first_section.keys())}")
            
            if 'modules' in first_section and first_section['modules']:
                first_module = first_section['modules'][0]
                print(f"   First module keys: {list(first_module.keys())}")
                print(f"   Module data: {json.dumps(first_module, indent=6)}")
                
                # Test saving this actual module
                if 'file' in first_module:
                    test_data = {
                        "module_id": first_module['file'],
                        "module_name": first_module.get('title', 'Unknown'),
                        "section": first_section_key,
                        "description": first_module.get('description', ''),
                        "difficulty": first_module.get('difficulty', 'beginner'),
                        "estimated_time": first_module.get('duration', 30),
                        "topics": first_module.get('topics', [])
                    }
                    
                    print(f"\n   Testing with actual module data:")
                    print(f"   Data: {json.dumps(test_data, indent=6)}")
                    
                    save_response = requests.post(f'{base_url}/api/user/save-module', headers=headers, json=test_data)
                    print(f"   Status: {save_response.status_code}")
                    print(f"   Response: {save_response.text}")
            
        else:
            print(f"   ❌ Failed to get syllabus: {syllabus_response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Syllabus error: {e}")
    
    print("\n" + "=" * 40)
    print("🔍 Debug complete!")

if __name__ == "__main__":
    debug_module_saving()
