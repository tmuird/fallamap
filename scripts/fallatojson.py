import json

# Assuming your text data is stored in 'fallas.txt'
input_filename = 'fallas.txt'
output_filename = 'fallas.json'

# Placeholder for the fallas data
fallas_data = []

# Open and read the input file
with open(input_filename, 'r', encoding='utf-8') as file:
    for line in file.readlines():
        # Split line by comma to get the individual components
        parts = line.strip().split(', ')
        if len(parts) == 3:
            number, name, time = parts
            # For now, we add placeholders for lat and lng
            fallas_data.append({
                'number': number,
                'name': name,
                'time': time,
                'coordinates': {'lat': 0.0, 'lng': 0.0}  # Placeholder for coordinates
            })

# Convert the data to JSON
fallas_json = json.dumps(fallas_data, ensure_ascii=False, indent=2)

# Save the JSON data to a file
with open(output_filename, 'w', encoding='utf-8') as json_file:
    json_file.write(fallas_json)

print(f"Data saved to {output_filename}")
