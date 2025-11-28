import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface AgentLocation {
  id: string;
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  isActive: boolean;
  lastUpdated: Date;
}

interface LocationContextType {
  isTracking: boolean;
  currentLocation: Location | null;
  agentLocations: AgentLocation[];
  toggleTracking: () => Promise<void>;
  updateLocation: (location: Location) => Promise<void>;
  refreshAgentLocations: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

const LOCATION_UPDATE_INTERVAL = 30000; // 30 seconds
const LOCATION_STORAGE_KEY = 'penny-count-tracking-enabled';

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [agentLocations, setAgentLocations] = useState<AgentLocation[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load tracking preference from localStorage
  useEffect(() => {
    if (user?.role === 'agent') {
      const savedTracking = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (savedTracking === 'true') {
        startTracking();
      }
    }
  }, [user?.id]);

  // Load agent locations for owners
  useEffect(() => {
    if (user?.role === 'owner' || user?.role === 'co-owner') {
      refreshAgentLocations();
      const interval = setInterval(refreshAgentLocations, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [user?.role]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const location: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        setCurrentLocation(location);
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );

    // Set up periodic updates to server
    updateIntervalRef.current = setInterval(() => {
      if (currentLocation) {
        updateLocation(currentLocation);
      }
    }, LOCATION_UPDATE_INTERVAL);

    setIsTracking(true);
    localStorage.setItem(LOCATION_STORAGE_KEY, 'true');
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }

    // Update status to inactive in database
    if (user) {
      supabase
        .from('agent_locations')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .then(() => console.log('Tracking disabled'));
    }

    setIsTracking(false);
    localStorage.setItem(LOCATION_STORAGE_KEY, 'false');
  };

  const toggleTracking = async () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const updateLocation = async (location: Location) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('agent_locations')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('agent_locations')
          .update({
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            is_active: true,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('agent_locations')
          .insert({
            user_id: user.id,
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            is_active: true
          });
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const refreshAgentLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_locations')
        .select(`
          id,
          user_id,
          latitude,
          longitude,
          accuracy,
          is_active,
          last_updated,
          users!inner(name)
        `)
        .eq('is_active', true)
        .order('last_updated', { ascending: false });

      if (error) throw error;

      const locations: AgentLocation[] = (data || []).map((loc: any) => ({
        id: loc.id,
        userId: loc.user_id,
        userName: loc.users.name,
        latitude: parseFloat(loc.latitude),
        longitude: parseFloat(loc.longitude),
        accuracy: parseFloat(loc.accuracy),
        isActive: loc.is_active,
        lastUpdated: new Date(loc.last_updated)
      }));

      setAgentLocations(locations);
    } catch (error) {
      console.error('Error fetching agent locations:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  return (
    <LocationContext.Provider
      value={{
        isTracking,
        currentLocation,
        agentLocations,
        toggleTracking,
        updateLocation,
        refreshAgentLocations
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
