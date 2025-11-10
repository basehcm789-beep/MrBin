import { WorkLog } from '../types';

// URL này kết nối đến Google Apps Script đã triển khai của người dùng,
// cho phép ứng dụng đọc và ghi vào Google Sheet được chỉ định.
const GOOGLE_APPS_SCRIPT_URL: string = 'https://script.google.com/macros/s/AKfycbyGs-x2iiS221Pa3nqgwSeY7MkEQ3E9CnOjS6C5FcvDZU1bqYiexYTCTdkok14-R7JB/exec';

/**
 * Fetches all work log data from the configured Google Sheet.
 * @returns A promise that resolves to an array of WorkLog objects.
 */
export const fetchDataFromGoogleSheet = async (): Promise<WorkLog[]> => {
    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'GET',
            mode: 'cors',
        });
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        const data = await response.json();
        // Ensure numeric types are correctly parsed
        return data.map((row: any) => ({
            ...row,
            Flights: Number(row.Flights) || 0,
            ManHours: Number(row.ManHours) || 0,
        }));
    } catch (error) {
        console.error('Failed to fetch data from Google Sheet:', error);
        throw error; // Re-throw to be handled by the calling component
    }
};


/**
 * Sends parsed Excel data to a backend endpoint for saving to Google Sheets.
 * @param data The array of work log objects.
 * @param fileName The name of the uploaded file.
 * @returns A status string: 'success', 'error', or 'skipped'.
 */
export const saveDataToGoogleSheet = async (data: WorkLog[], fileName: string): Promise<'success' | 'error' | 'skipped'> => {
    const dataWithFileName = data.map(record => ({...record, FileName: fileName}));

    try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(dataWithFileName),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred while saving.' }));
            throw new Error(errorData.message || `Server responded with status: ${response.status}`);
        }
        
        console.log('Successfully saved to Google Sheet via backend.');
        return 'success';
    } catch (error) {
        console.error('Failed to save data to Google Sheet:', error);
        return 'error';
    }
};