import axios from 'axios';

const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL'; // From deployment

export const getSheetData = async (sheetName: string) => {
  try {
    const response = await axios.get(`${API_URL}?sheet=${sheetName}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return [];
  }
};

export const addSheetData = async (sheetName: string, data: any) => {
  try {
    const response = await axios.post(API_URL, {
      ...data,
      sheet: sheetName
    });
    return response.data;
  } catch (error) {
    console.error('Error adding sheet data:', error);
    return null;
  }
};