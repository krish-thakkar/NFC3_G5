from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
import numpy as np
import cv2
import os
import shutil
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

model_path = 'soilcrop.h5'
model = load_model(model_path)

# Define labels and soil descriptions
labels = ["Alluvial soil", "Black Soil", "Clay soil", "Red soil"]
soil_descriptions = {
    "Alluvial soil": "Alluvial soil is fertile and supports a wide range of crops. It's suitable for growing rice, wheat, sugarcane, maize, cotton, and jute. This soil is found in river valleys and deltas, enriched by sediment deposition.",
    "Black Soil": "Black soil, also known as Regur soil, is rich in iron, lime, and magnesium. It is ideal for crops such as cotton, groundnut, sunflower, sorghum, and pulses. It retains moisture well and is prevalent in volcanic regions.",
    "Clay soil": "Clay soil has a fine texture and high nutrient content. It is best for crops like lettuce, spinach, cabbage, carrots, and beans. It retains water and nutrients but can be prone to waterlogging.",
    "Red soil": "Red soil is rich in iron oxides, giving it a reddish color. It is suitable for crops such as millets, pulses, oilseeds, potatoes, and certain fruits. It often requires additional fertilizers for optimal crop growth."
}

# Define paths
input_folder = 'soil_input'
output_folder = 'soil_output'
if not os.path.exists(input_folder):
    os.makedirs(input_folder)
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

def classify_soil(image_path):
    img = cv2.imread(image_path)
    img = cv2.resize(img, (150, 150))
    img_array = np.array(img)
    img_array = img_array.reshape(1, 150, 150, 3)
    img_array = img_array / 255.0 
    prediction = model.predict(img_array)
    class_index = np.argmax(prediction)
    soil_type = labels[class_index]
    description = soil_descriptions.get(soil_type, "No description available.")
    return soil_type, description

@app.route('/classify-soil', methods=['POST'])
def classify_soil_endpoint():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        # Generate a unique filename
        filename = str(uuid.uuid4()) + os.path.splitext(file.filename)[1]
        img_path = os.path.join(input_folder, filename)
        file.save(img_path)

        # Classify soil
        soil_type, description = classify_soil(img_path)

        # Move the image to the output folder
        output_img_path = os.path.join(output_folder, filename)
        shutil.move(img_path, output_img_path)

        # Prepare the response
        response = {
            'soil_type': soil_type,
            'description': description,
            'output_image_path': output_img_path
        }

        return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4001)