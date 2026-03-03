import requests
import sys
from datetime import datetime
import json

class RoshkaStudioAPITester:
    def __init__(self, base_url="https://luxury-web-studio.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_base}/{endpoint}" if endpoint else f"{self.api_base}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            
            print(f"   URL: {url}")
            print(f"   Method: {method}")
            if data:
                print(f"   Data: {json.dumps(data, indent=2)}")

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    response_json = response.json()
                    print(f"   Response: {json.dumps(response_json, indent=2)}")
                    return True, response_json
                except:
                    print(f"   Response: {response.text}")
                    return True, response.text
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text}")
                return False, {}

        except requests.exceptions.RequestException as e:
            print(f"❌ FAILED - Request Error: {str(e)}")
            return False, {}
        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            return False, {}

    def test_root_api(self):
        """Test the root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_services_endpoint(self):
        """Test the services endpoint"""
        return self.run_test("Services Endpoint", "GET", "services", 200)

    def test_create_inquiry(self):
        """Test creating a new inquiry"""
        inquiry_data = {
            "name": "Test User",
            "email": "test@example.com",
            "service_type": "Business Website",
            "project_description": "I need a new website for my business",
            "budget": "$3,000 - $5,000",
            "timeline": "1 month"
        }
        return self.run_test("Create Inquiry", "POST", "inquiries", 201, inquiry_data)

    def test_create_inquiry_minimal(self):
        """Test creating inquiry with only required fields"""
        inquiry_data = {
            "name": "Minimal Test",
            "email": "minimal@example.com",
            "service_type": "Landing Page",
            "project_description": "Simple landing page needed"
        }
        return self.run_test("Create Inquiry (Minimal)", "POST", "inquiries", 201, inquiry_data)

    def test_create_inquiry_invalid_email(self):
        """Test creating inquiry with invalid email"""
        inquiry_data = {
            "name": "Invalid Email Test",
            "email": "invalid-email",
            "service_type": "E-commerce",
            "project_description": "Test with invalid email"
        }
        return self.run_test("Create Inquiry (Invalid Email)", "POST", "inquiries", 422, inquiry_data)

    def test_get_inquiries(self):
        """Test getting all inquiries"""
        return self.run_test("Get All Inquiries", "GET", "inquiries", 200)

def main():
    print("🚀 Starting ROSHKA STUDIO API Tests")
    print("=" * 50)
    
    tester = RoshkaStudioAPITester()
    
    # Test sequence
    tests = [
        tester.test_root_api,
        tester.test_services_endpoint,
        tester.test_create_inquiry,
        tester.test_create_inquiry_minimal,
        tester.test_create_inquiry_invalid_email,
        tester.test_get_inquiries
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            tester.tests_run += 1
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%" if tester.tests_run > 0 else "0%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 ALL TESTS PASSED!")
        return 0
    else:
        print("⚠️  SOME TESTS FAILED")
        return 1

if __name__ == "__main__":
    sys.exit(main())