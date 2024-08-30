import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios';
import DOMPurify from 'dompurify';

const Insights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDataAndInsights = async () => {
      try {
        const response = await axios.get('http://localhost:5000/latest-data');
        const data = response.data;

        const genAI = new GoogleGenerativeAI("AIzaSyDunfDQjPX1kXB9Swdrt9jPcDEkm-6haKc");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
          As an agricultural expert, analyze the following crop and environmental data:
          
          - Inorganic content: ${data.inorganic}
          - Organic content: ${data.organic}
          - Soil types:
            * Clayey: ${data.clayey}%
            * Clay skeletal: ${data.clayskeletal}%
            * Loamy: ${data.loamy}%
            * Sandy: ${data.sandy}%
          - Soil depth:
            * 0-25cm: ${data.soildepth0_25}%
            * 25-50cm: ${data.soildepth25_50}%
            * 50-75cm: ${data.soildepth50_75}%
            * 75-100cm: ${data.soildepth75_100}%
            * 100-150cm: ${data.soildepth100_150}%
            * 150-200cm: ${data.soildepth150_200}%
          - Land degradation:
            * Salt affected: ${data.salt}%
            * Water erosion: ${data.water_errosion}%
            * Water logging: ${data.water_log}%
            * Wind erosion: ${data.wind_errosion}%
          - Crop seasons:
            * Rabi: ${data.rabi}%
            * Kharif: ${data.kharif}%
            * Fallow: ${data.fallow}%
          - NSA: ${data.nsa}%
          - Fire risk: ${data.fire_risk}
          - Forest cover: ${data.forest_fraction}%
          - NDVI: ${data.ndvi}
          - FNDVI: ${data.fndvi}
          - Vegetation fraction: ${data.vegetation_fraction}%
          - Water body fraction: ${data.water_body_fraction}%
          - Surface runoff: ${data.surface_runoff}
          - Surface soil moisture: ${data.surface_soil_moisture}
          - Evapotranspiration: ${data.evapotranspiration}

          Based on this data, provide:
          1. A brief analysis of the current conditions
          2. Three key insights about the land and its potential for agriculture
          3. Two specific crop recommendations suitable for these conditions
          4. Three actionable tips for improving soil health and crop yield
          5. An estimate of potential crop yield (high/medium/low) with a brief explanation

          Format the response using the following HTML structure:
          <div class="space-y-6">
            <section>
              <h3 class="text-2xl font-bold text-green-700 mb-2">Current Conditions Analysis</h3>
              <p>Your analysis here</p>
            </section>
            
            <section>
              <h3 class="text-2xl font-bold text-green-700 mb-2">Key Insights</h3>
              <ul class="list-disc list-inside space-y-2">
                <li>Insight 1</li>
                <li>Insight 2</li>
                <li>Insight 3</li>
              </ul>
            </section>
            
            <section>
              <h3 class="text-2xl font-bold text-green-700 mb-2">Crop Recommendations</h3>
              <ul class="list-disc list-inside space-y-2">
                <li>Crop 1</li>
                <li>Crop 2</li>
              </ul>
            </section>
            
            <section>
              <h3 class="text-2xl font-bold text-green-700 mb-2">Actionable Tips</h3>
              <ul class="list-disc list-inside space-y-2">
                <li>Tip 1</li>
                <li>Tip 2</li>
                <li>Tip 3</li>
              </ul>
            </section>
            
            <section>
              <h3 class="text-2xl font-bold text-green-700 mb-2">Yield Estimate</h3>
              <p><strong>Level:</strong> Your estimate here</p>
              <p><strong>Explanation:</strong> Your explanation here</p>
            </section>
          </div>
        `;

        const result = await model.generateContent(prompt);
        setInsights(result.response.text());
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDataAndInsights();
  }, []);

  if (loading) return <p className="text-center text-xl">Loading insights...</p>;
  if (error) return <p className="text-center text-xl text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Agricultural Insights</h2>
      <div 
        className="bg-white text-xl border-2 border-green-500 rounded-lg p-8 shadow-lg"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(insights) }}
      />
    </div>
  );
};

export default Insights;