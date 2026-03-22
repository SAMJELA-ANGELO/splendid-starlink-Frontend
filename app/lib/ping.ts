import { useEffect, useState } from 'react';
import api from './api';

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  service: string;
  version: string;
  environment: string;
  lastChecked: string;
  responseTime: number;
}

interface PingServiceOptions {
  interval?: number; // in milliseconds, default 60000 (1 minute)
  enabled?: boolean; // default true
  onStatusChange?: (status: HealthStatus) => void;
  onError?: (error: Error) => void;
}

export class PingService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private options: Required<PingServiceOptions>;

  constructor(options: PingServiceOptions = {}) {
    this.options = {
      interval: options.interval || 60000,
      enabled: options.enabled !== false,
      onStatusChange: options.onStatusChange || (() => {}),
      onError: options.onError || (() => {}),
    };
  }

  async ping(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      const response = await api.get('/health', { timeout: 5000 });
      const endTime = Date.now();
      
      const healthStatus: HealthStatus = {
        ...response.data,
        lastChecked: new Date().toISOString(),
        responseTime: endTime - startTime,
      };

      this.options.onStatusChange(healthStatus);
      return healthStatus;
    } catch (error) {
      const endTime = Date.now();
      
      const errorStatus: HealthStatus = {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: 0,
        service: 'starlink-hotspot-api',
        version: '1.0.0',
        environment: 'development',
        lastChecked: new Date().toISOString(),
        responseTime: endTime - startTime,
      };

      this.options.onStatusChange(errorStatus);
      this.options.onError(error as Error);
      return errorStatus;
    }
  }

  start() {
    if (this.isRunning || !this.options.enabled) {
      return;
    }

    this.isRunning = true;
    
    // Initial ping
    this.ping();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.options.interval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  getStatus() {
    return this.isRunning;
  }

  updateOptions(newOptions: Partial<PingServiceOptions>) {
    this.options = { ...this.options, ...newOptions };
    
    // Restart if interval changed
    if (this.isRunning && newOptions.interval) {
      this.stop();
      this.start();
    }
  }
}

// React hook for using the ping service
export function usePingService(options: PingServiceOptions = {}) {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastError, setLastError] = useState<Error | null>(null);

  useEffect(() => {
    const pingService = new PingService({
      ...options,
      onStatusChange: (status) => {
        setHealthStatus(status);
        setIsOnline(status.status === 'ok');
        setLastError(null);
      },
      onError: (error) => {
        setLastError(error);
        setIsOnline(false);
      },
    });

    pingService.start();

    return () => {
      pingService.stop();
    };
  }, [options.interval, options.enabled]);

  const ping = async () => {
    const pingService = new PingService(options);
    return await pingService.ping();
  };

  return {
    healthStatus,
    isOnline,
    lastError,
    ping,
  };
}

// Global ping service instance for app-wide monitoring
let globalPingService: PingService | null = null;

export const getGlobalPingService = () => {
  if (!globalPingService) {
    globalPingService = new PingService({
      interval: 60000, // 1 minute
      enabled: true,
    });
  }
  return globalPingService;
};

export const startGlobalPingService = () => {
  const service = getGlobalPingService();
  service.start();
};

export const stopGlobalPingService = () => {
  const service = getGlobalPingService();
  service.stop();
};
