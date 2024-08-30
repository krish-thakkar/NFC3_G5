const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection URI (replace with your actual MongoDB URI)
const mongoURI = "mongodb+srv://Krish:Krish%40123@cluster0.btmwa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define the updated schema for the data
const dataSchema = new mongoose.Schema({
  inorganic: Number,
  organic: Number,
  clayey: Number,
  clayskeletal: Number,
  loamy: Number,
  sandy: Number,
  soildepth0_25: Number,
  soildepth25_50: Number,
  soildepth50_75: Number,
  soildepth75_100: Number,
  soildepth100_150: Number,
  soildepth150_200: Number,
  salt: Number,
  water_errosion: Number,
  water_log: Number,
  wind_errosion: Number,
  rabi: Number,
  nsa: Number,
  kharif: Number,
  fallow: Number,
  fire_risk: Number,
  forest_fraction: Number,
  ndvi: Number,
  fndvi: Number,
  vegetation_fraction: Number,
  water_body_fraction: Number,
  surface_runoff: Number,
  surface_soil_moisture: Number,
  evapotranspiration: Number
});

// Create a model based on the schema
const DataModel = mongoose.model('Data', dataSchema);

// Endpoint to receive and store data
app.post('/json', async (req, res) => {
  try {
    const dataArray = req.body;
    
    // Ensure the incoming data is an array
    if (!Array.isArray(dataArray)) {
      return res.status(400).json({ message: 'Invalid data format. Expected an array.' });
    }

    // Save each data point in the array
    const savedData = await Promise.all(dataArray.map(async (dataPoint) => {
      const newData = new DataModel(dataPoint);
      return await newData.save();
    }));

    res.status(201).json({
      message: 'Data stored successfully!',
      savedData: savedData
    });
  } catch (error) {
    console.error('Error storing data:', error);
    res.status(500).json({ message: 'Error storing data.', error: error.message });
  }
});

// New endpoint to retrieve all data
app.get('/data', async (req, res) => {
  try {
    const allData = await DataModel.find();
    res.status(200).json(allData);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ message: 'Error retrieving data.', error: error.message });
  }
});

app.get('/latest-data', async (req, res) => {
  try {
    const latestData = await DataModel.findOne().sort({ createdAt: -1 });
    if (!latestData) {
      return res.status(404).json({ message: 'No data found.' });
    }
    res.status(200).json(latestData);
  } catch (error) {
    console.error('Error retrieving latest data:', error);
    res.status(500).json({ message: 'Error retrieving latest data.', error: error.message });
  }
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});