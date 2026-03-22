'use client';

import { useState, useEffect } from 'react';
import { usePingService } from '../../lib/ping';

interface ConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
}

export default function ConnectionStatus({ className = '', showDetails = false }: ConnectionStatusProps) {
  const { healthStatus, isOnline, lastError } = usePingService({
    interval: 60000, // 1 minute
    enabled: true,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show status indicator when there are issues
    if (!isOnline || lastError) {
      setIsVisible(true);
    } else {
      // Hide after 5 seconds if everything is ok
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, lastError]);

  if (!isVisible && !showDetails) {
    return null;
  }

  const getStatusColor = () => {
    if (isOnline === null) return 'bg-gray-500';
    if (isOnline) return 'bg-green-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (isOnline === null) return 'Checking...';
    if (isOnline) return 'Connected';
    return 'Disconnected';
  };

  const formatResponseTime = (ms: number) => {
    return `${ms}ms`;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className={`p-3 rounded-lg shadow-lg text-white ${getStatusColor()} ${
        isOnline ? 'bg-opacity-80' : 'bg-opacity-90'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white' : 'bg-red-200'} animate-pulse`} />
          <span className="text-sm font-medium">{getStatusText()}</span>
          
          {showDetails && healthStatus && (
            <div className="text-xs opacity-90">
              <span>• {formatResponseTime(healthStatus.responseTime)}</span>
              {healthStatus.uptime > 0 && <span>• {formatUptime(healthStatus.uptime)}</span>}
            </div>
          )}
        </div>

        {lastError && (
          <div className="mt-2 text-xs bg-red-600 bg-opacity-50 p-2 rounded">
            <div className="font-medium">Connection Error</div>
            <div className="opacity-90">
              {lastError.message || 'Unable to reach server'}
            </div>
          </div>
        )}

        {showDetails && healthStatus && (
          <div className="mt-2 text-xs space-y-1">
            <div>Service: {healthStatus.service}</div>
            <div>Environment: {healthStatus.environment}</div>
            <div>Version: {healthStatus.version}</div>
            <div>Last Check: {new Date(healthStatus.lastChecked).toLocaleTimeString()}</div>
          </div>
        )}
      </div>
    </div>
  );
}
