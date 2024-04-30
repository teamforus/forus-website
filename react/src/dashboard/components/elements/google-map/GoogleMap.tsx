import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { GoogleMap as GoogleMapComponent, InfoWindow, Marker } from '@react-google-maps/api';
import { AppConfigProp } from '../../../services/ConfigService';

export function GoogleMap({
    appConfigs,
    mapOptions = {},
    mapPointers = [],
    mapGestureHandling,
    mapGestureHandlingMobile,
    markerTemplate,
    openFirstPointer = false,
}: {
    appConfigs: AppConfigProp;
    mapOptions?: {
        centerType?: string;
        zoom?: number;
        fullscreenControlOptions?: { position?: google.maps.ControlPosition | null };
    };
    mapPointers: Array<{ lat: string; lon: string }>;
    mapGestureHandling?: 'cooperative' | 'greedy' | 'none' | 'auto';
    mapGestureHandlingMobile?: 'cooperative' | 'greedy' | 'none' | 'auto';
    markerTemplate?: (item: { lat: string; lon: string }) => React.ReactElement | Array<ReactElement>;
    openFirstPointer?: boolean;
}) {
    const [selectedMarker, setSelectedMarker] = React.useState(null);
    const [markers, setMarkers] = useState([]);
    const [zoomLevel] = useState(mapOptions?.zoom || 12);

    const avg = useCallback((values: Array<number>) => {
        return values.reduce((avg, value) => value + avg, 0) / values.length;
    }, []);

    const center = useMemo(() => {
        if (mapOptions.centerType == 'avg' && markers.length > 0) {
            return {
                lat: avg(markers.map((pointer) => parseFloat(pointer.lat))),
                lng: avg(markers.map((pointer) => parseFloat(pointer.lon))),
            };
        }

        return {
            lat: markers.length > 0 ? parseFloat(markers[0].lat) : appConfigs.map.lat,
            lng: markers.length > 0 ? parseFloat(markers[0].lon) : appConfigs.map.lon,
        };
    }, [appConfigs?.map?.lat, appConfigs?.map?.lon, avg, mapOptions.centerType, markers]);

    const mapStyles = [
        { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    ];

    const [gestureHandling] = useState(
        window.innerWidth >= 768 ? mapGestureHandling : mapGestureHandlingMobile || mapGestureHandling,
    );

    useEffect(() => {
        setMarkers(
            mapPointers
                .filter((pointer) => !isNaN(parseFloat(pointer.lon)) && !isNaN(parseFloat(pointer.lat)))
                .map((pointer) => ({
                    ...pointer,
                    lat: typeof pointer.lat === 'string' ? parseFloat(pointer.lat) : pointer.lat,
                    lng: typeof pointer.lon === 'string' ? parseFloat(pointer.lon) : pointer.lon,
                })),
        );
    }, [appConfigs?.map?.lat, appConfigs?.map?.lon, avg, mapPointers]);

    useEffect(() => {
        if (openFirstPointer) {
            setSelectedMarker(markers[0]);
        }
    }, [markers, openFirstPointer]);

    return (
        <div className={'map'}>
            <GoogleMapComponent
                mapContainerClassName={'map-canvas'}
                center={center}
                zoom={zoomLevel}
                options={{
                    styles: mapStyles,
                    center: center,
                    scrollwheel: true,
                    disableDefaultUI: false,
                    zoom: zoomLevel,
                    gestureHandling: gestureHandling || undefined,
                    scaleControl: true,
                    mapTypeControl: true,
                    fullscreenControl: true,
                    mapTypeControlOptions: { mapTypeIds: ['roadmap', 'map_style'] },
                    fullscreenControlOptions: { position: window.google.maps.ControlPosition.LEFT_BOTTOM },
                    ...mapOptions,
                }}>
                {markers.map((marker, index) => (
                    <Marker
                        key={index}
                        position={marker}
                        onClick={() => (markerTemplate ? setSelectedMarker(marker) : null)}
                    />
                ))}
                {markerTemplate && selectedMarker && (
                    <InfoWindow position={selectedMarker} onCloseClick={() => setSelectedMarker(null)}>
                        {markerTemplate(selectedMarker)}
                    </InfoWindow>
                )}
            </GoogleMapComponent>
        </div>
    );
}
