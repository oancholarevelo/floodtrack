"use client";

import { useState, useEffect } from 'react';
import { Wind, CloudRain, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

interface WeatherData {
    condition: { text: string; icon: string; };
    temp_c: number;
    feelslike_c: number;
    wind_kph: number;
    precip_mm: number;
}

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
    <div className={`bg-white p-4 rounded-xl border border-gray-200 ${className}`}>
        {children}
    </div>
);

export default function HomeView() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
      if (!apiKey || apiKey === "YOUR_WEATHER_API_KEY_HERE") {
        setWeatherError("Weather API key is missing.");
        setLoadingWeather(false);
        return;
      }
      try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=Rodriguez, Rizal&aqi=no`);
        if (!response.ok) {
          throw new Error('Weather data could not be fetched.');
        }
        const data = await response.json();
        setWeather(data.current);
      } catch (error) {
        setWeatherError("Could not load weather data.");
        console.error(error);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, []);
  
  const currentTime = new Date().toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila'
  });

  return (
    <div className="p-4 space-y-4">
      {/* Weather Card */}
      <Card>
        <div className="flex justify-between items-start">
            <h2 className="text-sm font-semibold text-gray-500">CURRENT WEATHER</h2>
            <p className="text-xs text-gray-400">Updated: {currentTime}</p>
        </div>
        {loadingWeather ? (
          <div className="text-center text-gray-500 py-8">Loading weather...</div>
        ) : weather ? (
          <div>
            <div className="flex items-center space-x-4 mt-2">
                <Image src={`https:${weather.condition.icon}`} alt={weather.condition.text} width={80} height={80} unoptimized/>
                <div>
                    <p className="text-5xl font-bold text-gray-800">{weather.temp_c}°C</p>
                    <p className="text-gray-500 -mt-1">Feels like {weather.feelslike_c}°C</p>
                </div>
            </div>
             <p className="font-bold text-lg text-cyan-700 mt-2">{weather.condition.text}</p>
            
            <div className="flex justify-around items-center mt-4 pt-4 border-t border-gray-100">
                <div className="text-center text-gray-600">
                    <Wind size={20} className="mx-auto mb-1 text-gray-400"/>
                    <span className="text-sm font-medium">{weather.wind_kph} km/h</span>
                </div>
                 <div className="text-center text-gray-600">
                    <CloudRain size={20} className="mx-auto mb-1 text-gray-400"/>
                    <span className="text-sm font-medium">Precip: {weather.precip_mm} mm</span>
                </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-red-500 py-8 flex flex-col items-center justify-center">
            <AlertTriangle className="mb-2" />
            <p>{weatherError}</p>
            <p className="text-xs text-gray-400 mt-1">Please add the API key to .env.local</p>
          </div>
        )}
      </Card>

      {/* Live Weather Map */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Live Weather & Typhoon Map</h3>
        <div className="w-full h-96 rounded-lg overflow-hidden">
            <iframe
                width="100%"
                height="100%"
                src="https://embed.windy.com/embed2.html?lat=14.7169&lon=121.1244&detailLat=14.7169&detailLon=121.1244&width=650&height=450&zoom=10&level=surface&overlay=rain&product=ecmwf&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=kph&metricTemp=%C2%B°C&radarRange=-1"
                frameBorder="0"
            ></iframe>
        </div>
      </Card>
      
      {/* LGU Announcements */}
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-2">LGU Announcements (Rodriguez DRRMO)</h3>
        <div className="w-full h-[600px] flex justify-center">
            <iframe 
                src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FBangonBagongMontalban&tabs=timeline&height=600&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId" 
                width="100%" 
                height="100%" 
                style={{border:'none', overflow:'auto'}} 
                scrolling="yes" 
                frameBorder="0" 
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
            </iframe>
        </div>
      </Card>
    </div>
  );
}