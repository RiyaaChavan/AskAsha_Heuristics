import json
import requests


def get_events(query):
    base_url = "https://www.brighttalk.com/api/webcasts"

    params = {
        "start": 0,
        "size": 8,
        "rank": "-webcast_relevance",
        "bq": "(and type:'webcast' status:'recorded' 'Women In Tech')",
        "rankClosest": "",
        "paidSearch": "true",
        "returnFields": "",
        "q": query
    }

    response = requests.get(base_url, params=params)

    if response.status_code == 200:
        data = response.json()
        return data
    else:
        return json.dumps({
            "error": "Failed to fetch events",
            "status_code": response.status_code,
            "message": response.text
        })