import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import 'tailwindcss/tailwind.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TradingApp = () => {
  const [stockData, setStockData] = useState([]);
  const [newStock, setNewStock] = useState("");
  const [error, setError] = useState("");

  const stockSymbols = stockData.map(stock => stock.symbol);

  useEffect(() => {
    const fetchStockData = async (symbol) => {
      try {
        const response = await axios.get(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=cr80oo9r01qotnb4b2p0cr80oo9r01qotnb4b2pg`
        );
        const { c: currentPrice } = response.data;

        setStockData(prevData =>
          prevData.map(stock =>
            stock.symbol === symbol
              ? {
                  ...stock,
                  data: [
                    ...stock.data,
                    { currentPrice, time: new Date().toLocaleTimeString() },
                  ],
                }
              : stock
          )
        );
      } catch (error) {
        console.error(`Error fetching data for ${symbol}`, error);
      }
    };

    stockSymbols.forEach(symbol => fetchStockData(symbol));

    const intervalId = setInterval(() => {
      stockSymbols.forEach(symbol => fetchStockData(symbol));
    }, 5000);

    return () => clearInterval(intervalId);
  }, [stockSymbols]);

  const addStock = () => {
    if (newStock && !stockSymbols.includes(newStock.toUpperCase())) {
      setStockData(prevData => [
        ...prevData,
        { symbol: newStock.toUpperCase(), data: [] }
      ]);
      setNewStock("");
      setError("");
    } else {
      setError("Invalid or duplicate stock symbol.");
    }
  };

  const removeStock = (symbol) => {
    setStockData(prevData => prevData.filter(stock => stock.symbol !== symbol));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Finance Trading App</h1>
      
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          value={newStock}
          onChange={(e) => setNewStock(e.target.value)}
          placeholder="Enter stock symbol"
          className="border p-2 rounded"
        />
        <button
          onClick={addStock}
          className="ml-2 bg-blue-500 text-white p-2 rounded"
        >
          Add Stock
        </button>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stockData.map((stock, index) => {
          const data = {
            labels: stock.data.map(dataPoint => dataPoint.time),
            datasets: [
              {
                label: `${stock.symbol} Price`,
                data: stock.data.map(dataPoint => dataPoint.currentPrice),
                fill: false,
                backgroundColor: "rgba(75,192,192,0.6)",
                borderColor: "rgba(75,192,192,1)",
              },
            ],
          };

          return (
            <div key={index} className="bg-white p-4 rounded shadow-lg h-64 relative">
              <button
                onClick={() => removeStock(stock.symbol)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
              >
                Remove
              </button>
              <h2 className="text-center text-lg font-semibold mb-2">{stock.symbol}</h2>
              <div className="w-full h-full">
                <Line data={data} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TradingApp;
