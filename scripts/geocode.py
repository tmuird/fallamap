import json
import requests

# Your Mapbox access token
MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoidG11aXJkIiwiYSI6ImNsdTA1OTNnazA2c2kyaXFzZmw1Zjk5NXYifQ.dZpsVkLriajtpVNL9ROskg'

# Function to geocode a location name
def geocode_location(name):
    # Define the bounding box around Valencia, Spain
    bbox_valencia = [-0.4310, 39.4427, -0.3120, 39.5357]  # Example bbox, adjust as needed
    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{requests.utils.quote(name)}.json"
    params = {
        'access_token': MAPBOX_ACCESS_TOKEN,
        'limit': 1,
        'country': 'ES',
        'bbox': ','.join(map(str, bbox_valencia))
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        if data['features']:
            coordinates = data['features'][0]['geometry']['coordinates']
            return coordinates
    return None


# Load the fallas data
with open('fallas.json', 'r', encoding='utf-8') as file:
    fallas_data = json.load(file)

# Geocode each falla and update its data with coordinates
for falla in fallas_data:
    coordinates = geocode_location(falla['name'])
    if coordinates:
        # Mapbox API returns coordinates in [longitude, latitude] order
        falla['coordinates'] = {'lng': coordinates[0], 'lat': coordinates[1]}

# Save the updated data back to JSON
with open('fallas_with_coords.json', 'w', encoding='utf-8') as file:
    json.dump(fallas_data, file, ensure_ascii=False, indent=4)

print("Geocoding complete, data saved to fallas_with_coords.json")
