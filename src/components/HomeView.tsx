"use client";

import { useState, useEffect } from 'react';
import { Wind, Droplets, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

// A more robust WeatherData interface
interface WeatherData {
    condition: { text: string; icon: string; code: number };
    temp_c: number;
    feelslike_c: number;
    wind_kph: number;
    precip_mm: number;
    humidity: number;
}

// Reusable, styled Card component
const Card: React.FC<{children: React.ReactNode, className?: string, title: string}> = ({ children, className, title }) => (
    <div className={`bg-white p-4 rounded-xl border border-slate-100 shadow-sm ${className}`}>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">{title}</h3>
        {children}
    </div>
);

const WeatherInfoChip: React.FC<{icon: React.ReactNode, label: string, value: string | number}> = ({ icon, label, value }) => (
    <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg">
        <div className="text-cyan-600">{icon}</div>
        <div>
            <div className="text-xs text-slate-500">{label}</div>
            <div className="text-sm font-bold text-slate-700">{value}</div>
        </div>
    </div>
);


export default function HomeView() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
      if (!apiKey || apiKey === "YOUR_API_KEY") {
        setWeatherError("Weather API key not configured.");
        setLoadingWeather(false);
        return;
      }
      try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=Rodriguez, Rizal&aqi=no`);
        if (!response.ok) {
          throw new Error('Failed to fetch weather data.');
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

  const renderWeatherContent = () => {
    if (loadingWeather) {
      return <div className="text-center text-slate-500 py-10">Fetching latest weather data...</div>;
    }
    if (weatherError || !weather) {
      return (
          <div className="text-center text-red-500 py-8 flex flex-col items-center justify-center bg-red-50 rounded-lg">
            <AlertTriangle className="mb-2" />
            <p className="font-semibold">{weatherError || "Weather data unavailable."}</p>
            <p className="text-xs text-slate-400 mt-1">Please ensure the API key is set correctly.</p>
          </div>
        );
    }
    return (
        <div>
            <div className="grid grid-cols-2 items-center">
                {/* Left Side: Icon and Temp */}
                <div className="flex items-center space-x-2">
                    <Image src={`https:${weather.condition.icon}`} alt={weather.condition.text} width={64} height={64} unoptimized/>
                    <p className="text-5xl font-bold text-slate-800">{Math.round(weather.temp_c)}°</p>
                </div>

                {/* Right Side: Condition and Feels Like */}
                <div className="text-right">
                    <p className="font-bold text-lg text-cyan-700 leading-tight">{weather.condition.text}</p>
                    <p className="text-slate-500 text-sm">Feels like {Math.round(weather.feelslike_c)}°C</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                <WeatherInfoChip icon={<Wind size={20} />} label="Wind" value={`${weather.wind_kph} km/h`} />
                <WeatherInfoChip icon={<Droplets size={20} />} label="Precipitation" value={`${weather.precip_mm} mm`} />
            </div>
        </div>
    );
  }

  return (
    // FIX: Reverted to original state so the parent <main> can handle scrolling.
    <div className="p-4 space-y-4">
      {/* Weather Card */}
      <Card title={`Weather Update (${currentTime})`}>
        {renderWeatherContent()}
      </Card>

      {/* Live Weather Map */}
      <Card title="Live Weather & Typhoon Map">
        <div className="w-full h-96 rounded-lg overflow-hidden border border-slate-200">
            <iframe
                width="100%"
                height="100%"
                src="https://embed.windy.com/embed2.html?lat=14.7169&lon=121.1244&detailLat=14.7169&detailLon=121.1244&width=650&height=450&zoom=10&level=surface&overlay=rain&product=ecmwf&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=kph&metricTemp=%C2%B0C&radarRange=-1"
                frameBorder="0"
            ></iframe>
        </div>
      </Card>
      
      {/* LGU Announcements */}
      <Card title="LGU Announcements">
        <div className="w-full h-[600px] bg-slate-100 rounded-lg">
            <iframe 
                src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FBangonBagongMontalban&tabs=timeline&height=600&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                className="w-full h-full rounded-lg"
                style={{border:'none', overflow:'hidden'}} 
                scrolling="no" 
                frameBorder="0" 
                allow="encrypted-media">
            </iframe>
        </div>
      </Card>
    </div>
  );
}