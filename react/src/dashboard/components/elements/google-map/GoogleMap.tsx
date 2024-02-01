import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useAppConfigs from '../../../hooks/useAppConfigs';
import { GoogleMap as GoogleMapComponent, LoadScript, Marker } from '@react-google-maps/api';
import useEnvData from '../../../hooks/useEnvData';

export function GoogleMap({
    mapPointers = [],
    mapGestureHandling,
}: {
    mapPointers: Array<{ lat: string; lon: string }>;
    mapGestureHandling?: string;
}) {
    const [markers, setMarkers] = useState([]);
    const zoomLevel = 12;
    const appConfigs = useAppConfigs();
    const envData = useEnvData();

    const avg = useCallback((values: Array<number>) => {
        return values.reduce((avg, value) => value + avg, 0) / values.length;
    }, []);

    const center = useMemo(() => {
        if (mapPointers.length > 0) {
            return {
                lat: avg(
                    mapPointers.map((pointer) => {
                        return typeof pointer.lat === 'string' ? parseFloat(pointer.lat) : pointer.lat;
                    }),
                ),
                lng: avg(
                    mapPointers.map((pointer) => {
                        return typeof pointer.lon === 'string' ? parseFloat(pointer.lon) : pointer.lon;
                    }),
                ),
            };
        }

        return {
            lat: appConfigs?.map?.lat,
            lng: appConfigs?.map?.lon,
        };
    }, [appConfigs?.map?.lat, appConfigs?.map?.lon, avg, mapPointers]);

    const mapStyles = [
        { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    ];

    useEffect(() => {
        setMarkers(
            mapPointers.map((pointer) => ({
                lat: typeof pointer.lat === 'string' ? parseFloat(pointer.lat) : pointer.lat,
                lng: typeof pointer.lon === 'string' ? parseFloat(pointer.lon) : pointer.lon,
            })),
        );
    }, [appConfigs?.map?.lat, appConfigs?.map?.lon, avg, mapPointers]);

    return (
        <div className={'map'}>
            <LoadScript googleMapsApiKey={envData.config.google_maps_api_key}>
                <GoogleMapComponent
                    mapContainerClassName={'map-canvas'}
                    center={{ lat: markers[0]?.lat || 0, lng: markers[0]?.lng || 0 }}
                    zoom={zoomLevel}
                    options={{
                        styles: mapStyles,
                        center: center,
                        scrollwheel: true,
                        disableDefaultUI: false,
                        zoom: zoomLevel,
                        gestureHandling: mapGestureHandling || undefined,
                    }}>
                    {markers.map((marker, index) => (
                        <Marker key={index} position={marker} />
                    ))}
                </GoogleMapComponent>
            </LoadScript>
        </div>
    );
}
