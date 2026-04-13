// Simple device fingerprinting for credit tracking without auth
// Uses localStorage + user agent + screen dimensions

const STORAGE_KEY = 'pp_device_id';

export function getDeviceFingerprint(): string {
  // Check for existing ID in localStorage
  let deviceId = localStorage.getItem(STORAGE_KEY);

  if (!deviceId) {
    // Generate new fingerprint from device characteristics
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      Math.random().toString(36).slice(2), // Add entropy
    ];

    const fingerprint = components.join('|');
    deviceId = hashFingerprint(fingerprint);
    localStorage.setItem(STORAGE_KEY, deviceId);
  }

  return deviceId;
}

function hashFingerprint(str: string): string {
  // Simple hash function for fingerprint
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

export function clearDeviceFingerprint(): void {
  localStorage.removeItem(STORAGE_KEY);
}
