#!/usr/bin/env python3
"""
Test script to verify HerKey API connectivity and functionality
"""

import requests
import json
from agent import get_herkey_token
from tools.api_client import HerkeyAPIClient

def test_herkey_session():
    """Test getting a session token from HerKey API"""
    print("Testing HerKey session generation...")
    try:
        response = requests.get('https://api-prod.herkey.com/api/v1/herkey/generate-session', timeout=10)
        print(f"Session API Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Session response: {data}")
            if 'body' in data and 'session_id' in data['body']:
                token = data['body']['session_id']
                print(f"Successfully got session token: {token[:20]}...")
                return token
            else:
                print("Invalid session response format")
                return None
        else:
            print(f"Session API failed: {response.text}")
            return None
    except Exception as e:
        print(f"Session API error: {str(e)}")
        return None

def test_herkey_jobs_api(token):
    """Test HerKey jobs API with minimal parameters"""
    if not token:
        print("❌ No token available for jobs API test")
        return
    
    print("\nTesting HerKey jobs API...")
    
    # Test with very basic parameters
    basic_params = {
        'page_no': 1,
        'page_size': 5,
        'keyword': 'software',
        'is_global_query': 'false'
    }
    
    headers = {
        'Authorization': f'Token {token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    try:
        url = 'https://api-prod.herkey.com/api/v1/herkey/jobs/es_candidate_jobs'
        print(f"Making request to: {url}")
        print(f"With params: {basic_params}")
        print(f"With headers: {dict(headers)}")
        
        response = requests.get(url, params=basic_params, headers=headers, timeout=15)
        print(f"Jobs API Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Jobs API successful!")
            print(f"Response keys: {list(data.keys())}")
            
            if 'body' in data:
                jobs = data['body']
                if isinstance(jobs, list):
                    print(f"Found {len(jobs)} jobs")
                    if len(jobs) > 0:
                        print(f"First job sample: {jobs[0].get('title', 'No title')} at {jobs[0].get('company_name', 'No company')}")
                else:
                    print(f"Body format: {type(jobs)}")
            else:
                print("No 'body' in response")
        else:
            print(f"❌ Jobs API failed: {response.status_code}")
            print(f"Response: {response.text[:500]}")
            
    except Exception as e:
        print(f"❌ Jobs API error: {str(e)}")

def test_herkey_client():
    """Test the HerkeyAPIClient class"""
    print("\nTesting HerkeyAPIClient class...")
    
    client = HerkeyAPIClient()
    
    # Test with minimal parameters
    test_params = {
        'keyword': 'data',
        'page_size': 3
    }
    
    try:
        result = client.search_jobs(test_params)
        print(f"Client result keys: {list(result.keys())}")
        
        if result.get('response_code') == 10100 or result.get('body'):
            jobs = result.get('body', [])
            print(f"✅ Client successful! Found {len(jobs)} jobs")
            if len(jobs) > 0:
                print(f"Sample job: {jobs[0].get('title', 'No title')}")
        else:
            print(f"❌ Client failed: {result.get('message', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Client error: {str(e)}")

if __name__ == "__main__":
    print("🔍 Testing HerKey API connectivity...\n")
    
    # Test 1: Session generation
    token = test_herkey_session()
    
    # Test 2: Jobs API with raw requests
    test_herkey_jobs_api(token)
    
    # Test 3: HerkeyAPIClient class
    test_herkey_client()
    
    print("\n✅ Testing complete!") 