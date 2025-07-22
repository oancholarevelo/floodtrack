"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (!navigator.geolocation) {
                console.error("Geolocation is not supported by your browser.");
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
                    const response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`);
                    const data = await response.json();

                    if (data.features.length > 0) {
                        const properties = data.features[0].properties;
                        const locationName = (properties.municipality || properties.city || 'location').toLowerCase();
                        
                        // Pass coordinates as query parameters
                        router.push(`/${encodeURIComponent(locationName)}?lat=${latitude}&lng=${longitude}`);
                    } else {
                        router.push('/montalban');
                    }

                } catch (error) {
                    console.error("Error during reverse geocoding:", error);
                    router.push('/montalban');
                }
            };

            const handleError = (error: GeolocationPositionError) => {
                console.error(`Geolocation error: ${error.message}`);
                alert("Location access was denied. Redirecting to a default location.");
                router.push('/montalban');
            };

            navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
        }
    }, [router]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', padding: '2rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1.5s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
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