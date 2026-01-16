'use client';

import { useState, useEffect, useCallback } from 'react';

// Types
export interface ServiceFilters {
    status?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}

export interface Service {
    id: string;
    code: string;
    boatName: string;
    description: string;
    status: string;
    statusLabel: string;
    statusColor: string;
    location: string;
    locationLabel: string;
    locationColor: string;
    jobType: string;
    jobTypeLabel: string;
    jobTypeMultiplier: number;
    scheduledDate: string;
    scheduledTime?: string;
    completedAt?: string;
    responsible?: {
        id: string;
        name: string;
        title: string;
    };
    supportTeam: Array<{
        id: string;
        name: string;
        title: string;
        role: string;
    }>;
    parts: Array<{
        id: string;
        name: string;
        quantity: number;
        status: string;
    }>;
    contactPerson?: string;
    contactPhone?: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Personnel {
    id: string;
    name: string;
    title: string;
    titleLabel: string;
    titleLevel: number;
    phone?: string;
    email?: string;
    avatar?: string;
    active: boolean;
    serviceCount: number;
    evaluationCount: number;
    createdAt: string;
}

export interface ConfigData {
    statuses: Array<{ key: string; label: string; color: string; icon?: string }>;
    locations: Array<{ key: string; label: string; color: string; icon?: string }>;
    jobTypes: Array<{ key: string; label: string; multiplier: number }>;
    titles: Array<{ key: string; label: string; level: number }>;
    appearance: {
        appName: string;
        slogan: string;
        logoUrl?: string;
        primaryColor: string;
        secondaryColor: string;
        themeMode: string;
        fontFamily: string;
        baseFontSize: number;
        borderRadius: number;
        sidebarWidth: number;
    } | null;
    menu: Array<{ id: string; href: string; label: string; icon?: string; adminOnly: boolean }>;
}

// Hook: useServices
export function useServices(filters?: ServiceFilters) {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
            if (filters?.location && filters.location !== 'all') params.set('location', filters.location);
            if (filters?.startDate) params.set('startDate', filters.startDate);
            if (filters?.endDate) params.set('endDate', filters.endDate);
            if (filters?.search) params.set('search', filters.search);

            const url = `/api/services${params.toString() ? `?${params}` : ''}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch services');
            const data = await res.json();
            setServices(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [filters?.status, filters?.location, filters?.startDate, filters?.endDate, filters?.search]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    return { services, loading, error, refetch: fetchServices };
}

// Hook: useService (single)
export function useService(id: string | null) {
    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setService(null);
            return;
        }

        const fetchService = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/services/${id}`);
                if (!res.ok) throw new Error('Failed to fetch service');
                const data = await res.json();
                setService(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchService();
    }, [id]);

    return { service, loading, error };
}

// Hook: usePersonnel
export function usePersonnel(activeOnly = true) {
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPersonnel = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `/api/personnel${activeOnly ? '' : '?active=false'}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch personnel');
            const data = await res.json();
            setPersonnel(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [activeOnly]);

    useEffect(() => {
        fetchPersonnel();
    }, [fetchPersonnel]);

    return { personnel, loading, error, refetch: fetchPersonnel };
}

// Hook: useConfig
export function useConfig() {
    const [config, setConfig] = useState<ConfigData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/configs');
                if (!res.ok) throw new Error('Failed to fetch config');
                const data = await res.json();
                setConfig(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    return { config, loading, error };
}

// Service mutations
export async function createService(data: Partial<Service>) {
    const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create service');
    }
    return res.json();
}

export async function updateService(id: string, data: Partial<Service> & { statusNote?: string }) {
    const res = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update service');
    }
    return res.json();
}

export async function deleteService(id: string) {
    const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete service');
    }
    return res.json();
}

// Personnel mutations
export async function createPersonnel(data: Partial<Personnel>) {
    const res = await fetch('/api/personnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create personnel');
    }
    return res.json();
}
