import requests
import json

if __name__ == "__main__":
    # Server URL
    url = "http://localhost:8000"

    # Sample JSON data
    sample_data = {
        "name": "John Doe",
        "age": 30,
        "email": "john.doe@example.com"
    }

    try:
        # Send a POST request with the JSON data
        response = requests.post(url, json=sample_data)

        # Check the response status code
        if response.status_code == 200:
            # Successful response
            print("Response:")
            print(json.dumps(response.json(), indent=2))
        else:
            # Failed response
            print(f"Request failed with status code: {response.status_code}")
            print("Response:")
            print(response.text)

    except requests.exceptions.RequestException as e:
        # Handle connection or request-related errors
        print(f"Request failed: {e}")
