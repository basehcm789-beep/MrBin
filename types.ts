
export interface ZoneManpower {
  zone: string;
  manpower: {
    personnelType: string;
    count: number;
  }[];
}

export interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  isError?: boolean;
  zoneManpower?: ZoneManpower[];
}

/**
 * Represents a single task row from the manpower calculation Excel file.
 * Keys are flexible to handle variations in column naming.
 */
export interface ManpowerTask {
  'zone division'?: string | number;
  'MAC hour'?: number;
  'tiêu đề các task'?: string;
  'WO'?: string | number;
  'EOD'?: any;
  [key: string]: any; // Allows for other columns
}

/**
 * Represents the structured response from Gemini for manpower calculation.
 */
export interface ManpowerCalculationResponse {
  summary: string;
  zoneManpower: ZoneManpower[];
}

/**
 * Represents a single flight record.
 */
export interface Flight {
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
}

/**
 * Represents a single work log entry from the Google Sheet.
 */
export interface WorkLog {
  Date: string | number;
  AircraftType: string;
  Airport: string;
  WorkType: string;
  Flights: number;
  ManHours: number;
  FileName?: string;
}

/**
 * Represents the state of active filters in the flight search UI.
 */
export interface ActiveFilters {
  maxPrice: number;
  stops: number[];
  airlines: string[];
}

/**
 * Represents a single task within a WorkPack.
 */
export interface WorkPackTask {
  id: string;
  description: string;
  isCompleted: boolean;
}

/**
 * Represents a maintenance work pack.
 */
export interface WorkPack {
  id: string;
  title: string;
  description: string;
  aircraftType: string;
  createdBy: string;
  dateCreated: string;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  tasks: WorkPackTask[];
}

/**
 * Represents the structured response from Gemini for work pack evaluation.
 */
export interface WorkPackEvaluationResponse {
  summary: string;
  overallScore: number;
  positivePoints: string[];
  areasForImprovement: string[];
  suggestedModifications: string[];
  safetyConcerns: string[];
}
