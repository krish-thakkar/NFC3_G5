from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.preprocessing.image import img_to_array
import numpy as np
import os
import shutil
import uuid

# Initialize the Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# List of diseases
Diseases = [
    "American Bollworm", "Anthracnose", "Army worm", "Bacterial Blight", "Brownspot", "Common", 
    "Aphid", "Flag Smut", "Gray_Leaf_Spot", "Healthy Wheat", "Leaf Curl", "Leaf Smut", 
    "Mosaic", "RedRot", "RedRust", "Rice Blast", "Tungro", "Brown leaf rust", 
    "Wheat stem fly", "leaf bright", "mite", "scab", "Yellow rust", "Bacterial blight", 
    "bollrot", "stem armyworm", "pink ballworm", "red cotton", "thrips",
    "Powdery Mildew", "Downy Mildew", "Verticillium Wilt", "Fusarium Wilt", "Crown Rot", 
    "Gummy Stem Blight", "Root Knot Nematode", "Late Blight", "Clubroot", "Ergot", 
    "Septoria Leaf Spot", "Angular Leaf Spot", "Sclerotinia Stem Rot"
]

# Load the trained model
model = tf.keras.models.load_model('bimar_model.h5')

# Define paths
input_folder = 'input'
output_folder = 'output'
if not os.path.exists(input_folder):
    os.makedirs(input_folder)
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Function to preprocess the image
def preprocess_image(img_path, target_size=(150, 150)):
    img = image.load_img(img_path, target_size=target_size)
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    img_array /= 255.0  # Normalize
    return img_array

# Define a route to process the image and return predictions
@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        # Generate a unique filename
        filename = str(uuid.uuid4()) + os.path.splitext(file.filename)[1]
        img_path = os.path.join(input_folder, filename)
        file.save(img_path)

        # Preprocess and predict
        processed_image = preprocess_image(img_path)
        predictions = model.predict(processed_image)
        predicted_class_index = np.argmax(predictions, axis=1)[0]
        predicted_disease = Diseases[predicted_class_index]

        # Move the image to the output folder
        output_img_path = os.path.join(output_folder, filename)
        shutil.move(img_path, output_img_path)

        # Prepare the response
        response = {
            'predicted_disease': predicted_disease,
            'output_image_path': output_img_path
        }

        return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)