"use client";

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SalesOptimizer = () => {
    console.log('Component rendering'); // Add this to check if component renders

    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
      productionCost: '',
      viableSalesPrice: '',
      maxSalesPrice: ''
    });
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
  
  
    const handleFileUpload = (event) => {
      console.log('File upload triggered');
      console.log('Event:', event);
      console.log('File:', event.target.files[0]);
      const file = event.target.files[0];
      setFile(file);
    };
  
    const handleInputChange = (e) => {
      console.log('Input change triggered');
      console.log('Name:', e.target.name);
      console.log('Value:', e.target.value);
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
    const handleSubmit = async (e) => {
      console.log('Submit triggered');
      e.preventDefault();
      console.log('Form Data:', formData);
      console.log('File:', file);
      
      if (!file) {
        console.log('No file selected');
        setError('Please upload a sales data file');
        return;
      }
  
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('productionCost', formData.productionCost);
      formDataToSend.append('viableSalesPrice', formData.viableSalesPrice);
      formDataToSend.append('maxSalesPrice', formData.maxSalesPrice);
  
      try {
        console.log('Sending request to server...');
        const response = await fetch('http://localhost:8000/api/optimize-sales', {
          method: 'POST',
          body: formDataToSend
        });
  
        console.log('Response received:', response);
        const data = await response.json();
        console.log('Parsed data:', data);
        setResults(data);
        setError(null);
      } catch (err) {
        console.error('Error in submission:', err);
        setError('Error processing request. Please try again.');
      }
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Sales Price Optimizer</CardTitle>
                    <CardDescription>
                        Upload historical sales data and input parameters to calculate optimal pricing
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">CSV or Excel file</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Production Cost per Unit
                                </label>
                                <input
                                    type="number"
                                    name="productionCost"
                                    value={formData.productionCost}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Most Viable Sales Price
                                </label>
                                <input
                                    type="number"
                                    name="viableSalesPrice"
                                    value={formData.viableSalesPrice}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Maximum Viable Sales Price
                                </label>
                                <input
                                    type="number"
                                    name="maxSalesPrice"
                                    value={formData.maxSalesPrice}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                        >
                            Calculate Optimal Price
                        </button>
                    </form>
                </CardContent>
            </Card>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {results && (
                <Card>
                    <CardHeader>
                        <CardTitle>Optimization Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-semibold">Optimal Sales Price</h3>
                                <p className="text-2xl">${results.optimalPrice.toFixed(2)}</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <h3 className="font-semibold">Expected Revenue</h3>
                                <p className="text-2xl">${results.totalRevenue.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <h3 className="font-semibold">Total Profit</h3>
                                <p className="text-2xl">${results.totalProfit.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <h3 className="font-semibold">Average Monthly Volume</h3>
                                <p className="text-2xl">{Math.round(results.averageVolume)} units</p>
                            </div>
                        </div>

                        <div className="w-full h-64">
                            <LineChart
                                width={800}
                                height={400}
                                data={results.monthlyData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#8884d8"
                                    name="Revenue"
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="profit"
                                    stroke="#82ca9d"
                                    name="Profit"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="volume"
                                    stroke="#ffc658"
                                    name="Volume"
                                />
                            </LineChart>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default SalesOptimizer;