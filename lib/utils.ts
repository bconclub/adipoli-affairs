// Utility function to format product names to title case
// First letter of each word capitalized, rest lowercase
export function formatProductName(name: string): string {
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Time restriction interface
export interface TimeRestriction {
    start: string; // Format: "HH:mm" (24-hour format, e.g., "12:00", "17:00")
    end: string;   // Format: "HH:mm" (24-hour format, e.g., "12:00", "17:00")
}

// Get current time in New Zealand (Pacific/Auckland timezone)
export function getCurrentNZTime(): Date {
    const now = new Date();
    const nzTime = new Date(now.toLocaleString('en-US', { timeZone: 'Pacific/Auckland' }));
    // Create a Date object with NZ time components but in local timezone for easier comparison
    return new Date(now.toLocaleString('en-US', { timeZone: 'Pacific/Auckland', timeZoneName: 'short' }));
}

// Get current NZ time as formatted string
export function getCurrentNZTimeString(): string {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Pacific/Auckland',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
    return formatter.format(new Date());
}

// Parse time string "HH:mm" to minutes since midnight
function parseTimeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Check if current NZ time is within the time restriction
export function isItemAvailableNow(timeRestriction?: TimeRestriction): boolean {
    // If no restriction, item is always available
    if (!timeRestriction) {
        return true;
    }

    const now = new Date();
    const nzTimeString = now.toLocaleString('en-US', {
        timeZone: 'Pacific/Auckland',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    // Parse current NZ time
    const [currentHours, currentMinutes] = nzTimeString.split(':').map(Number);
    const currentMinutesSinceMidnight = currentHours * 60 + currentMinutes;

    // Parse restriction times
    const startMinutes = parseTimeToMinutes(timeRestriction.start);
    const endMinutes = parseTimeToMinutes(timeRestriction.end);

    // Check if current time is within the range
    if (startMinutes <= endMinutes) {
        // Normal case: start < end (e.g., 12:00 to 17:00)
        return currentMinutesSinceMidnight >= startMinutes && currentMinutesSinceMidnight < endMinutes;
    } else {
        // Edge case: start > end (e.g., 22:00 to 02:00, spans midnight)
        return currentMinutesSinceMidnight >= startMinutes || currentMinutesSinceMidnight < endMinutes;
    }
}

// Format time restriction for display
export function formatTimeRestriction(timeRestriction?: TimeRestriction): string {
    if (!timeRestriction) {
        return '';
    }

    const formatTime = (timeStr: string): string => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const hour12 = hours % 12 || 12;
        const ampm = hours >= 12 ? 'pm' : 'am';
        return `${hour12}:${minutes.toString().padStart(2, '0')}${ampm}`;
    };

    return `${formatTime(timeRestriction.start)}-${formatTime(timeRestriction.end)}`;
}













