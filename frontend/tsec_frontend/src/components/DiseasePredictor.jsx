import React, { useState } from 'react';
import axios from 'axios';

const DiseasePredictor = () => {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!file) {
      setError('Please select an image file');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('http://localhost:4000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPrediction(response.data);
    } catch (err) {
      setError('An error occurred while processing the image');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md md-10">
      <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">Crop Disease Predictor</h1>
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col">
        <div className="mb-6 flex flex-col">
          <label htmlFor="image" className="text-green-700 font-semibold mb-2">Select Image:</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleFileChange}
            className="border border-green-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-3 rounded-lg self-start hover:bg-green-700 transition duration-300 ease-in-out disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Predict Disease'}
        </button>
      </form>

      {error && <p className="text-red-600 font-medium">{error}</p>}

      {prediction && (
        <div className="mt-6 p-4 bg-green-100 rounded-lg">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Prediction Result:</h2>
          <p className="text-green-700"><strong>Predicted Disease:</strong> {prediction.predicted_disease}</p>
          <p className="text-green-700"><strong>Output Image Path:</strong> {prediction.output_image_path}</p>
        </div>
      )}
    </div>
  );
};

export default DiseasePredictor;
