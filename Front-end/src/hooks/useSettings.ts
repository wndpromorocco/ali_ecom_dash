import { useState, useEffect } from 'react';
import { API_BASE, DOMAIN_BASE } from '@/config';

export const useSettings = () => {
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_BASE}/settings`);
                if (res.ok) {
                    const json = await res.json();
                    const settingsMap: Record<string, any> = {};
                    if (Array.isArray(json.data)) {
                        json.data.forEach((s: any) => {
                            settingsMap[s.key] = s.value;
                        });
                    }
                    setSettings(settingsMap);
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return { settings, isLoading };
};
