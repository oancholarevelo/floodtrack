"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // This code runs when the component mounts on the client side
    if (typeof window !== 'undefined') {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by your browser.");
        // Fallback: redirect to a default location
        router.push('/montalban');
        return;
      }

      const handleSuccess = async (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

        if (!apiKey) {
          console.error("Geoapify API key not found. Falling back to default.");
          router.push('/montalban');
          return;
        }

        try {
          // Use the Geoapify API to get the city/municipality name
          const response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`);
          const data = await response.json();
          
          if (data.features.length > 0) {
            // Extract the location name (municipality is often more specific for this area)
            const properties = data.features[0].properties;
            const locationName = (properties.municipality || properties.city || '').toLowerCase().replace(/\s+/g, '');

            if (locationName) {
              console.log(`Detected location: ${locationName}`);
              // In a real app, you might want to check if this is a supported location
              // before redirecting. For now, we'll just redirect.
              router.push(`/${locationName}`);
            } else {
              console.error("Could not determine location name from coordinates.");
              router.push('/montalban'); // Fallback
            }
          } else {
             router.push('/montalban'); // Fallback if no features found
          }

        } catch (error) {
          console.error("Error during reverse geocoding:", error);
          router.push('/montalban'); // Fallback on API error
        }
      };

      const handleError = (error: GeolocationPositionError) => {
        console.error(`Geolocation error: ${error.message}`);
        // If user denies permission, redirect to a default location
        alert("Location access was denied. Redirecting to a default location.");
        router.push('/montalban');
      };

      // Request user's location
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    }
  }, [router]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', padding: '2rem' }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1.5s linear infinite' }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      <p style={{ marginTop: '1rem', color: '#555' }}>Detecting your location...</p>
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}