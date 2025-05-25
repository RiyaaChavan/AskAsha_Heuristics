#!/usr/bin/env python

from agent import classify_query, run_agent
import json

# Test the basic functionality
print("Testing classify_query...")
query_result = classify_query("How do I prepare for a data science job interview?")
print(f"Query classification: {query_result}")

# Test the run_agent function
print("\nTesting run_agent...")
response = run_agent("How do I prepare for a data science job interview?")
print(json.dumps(response, indent=2))
