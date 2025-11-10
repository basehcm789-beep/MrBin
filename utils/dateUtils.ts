/**
 * Normalizes a date string or number (from Excel) into 'YYYY-MM-DD' format.
 * This is crucial for reliable date comparisons and filtering.
 * @param dateInput The date value from the data source.
 * @returns A string in 'YYYY-MM-DD' format, or an empty string if invalid.
 */
export const normalizeDate = (dateInput: string | number | Date): string => {
    if (!dateInput) return '';

    let date: Date;

    // Handle Excel's numeric date format
    if (typeof dateInput === 'number') {
        // Excel's epoch starts on 1899-12-30. JS epoch is 1970-01-01.
        // The calculation converts Excel's serial number to JS milliseconds.
        date = new Date(Math.round((dateInput - 25569) * 86400 * 1000));
    } else {
        date = new Date(dateInput);
    }
    
    if (isNaN(date.getTime())) {
        return ''; // Invalid date
    }
    
    // Adjust for timezone offset to prevent day-before errors
    const tzOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() - tzOffset);

    return adjustedDate.toISOString().split('T')[0];
};

/**
 * Formats a Date object into 'YYYY-MM-DD' for input elements.
 * @param date The Date object to format.
 * @returns A string in 'YYYY-MM-DD' format.
 */
export const getFormattedDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
