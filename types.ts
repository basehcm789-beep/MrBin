

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

// FIX: Added missing type definitions to resolve import errors.
/**
 * Represents a flight's data.
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
 * Represents a single row from the work log data.
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
 * Represents the state of active filters for flight search.
 */
export interface ActiveFilters {
  maxPrice: number;
  stops: number[];
  airlines: string[];
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
    tasks: {
        id: string;
        description: string;
        isCompleted: boolean;
    }[];
}

/**
 * Represents the structured response from Gemini for work pack evaluation.
 */
export interface WorkPackEvaluationResponse {
    overallScore: number;
    summary: string;
    positivePoints: string[];
    areasForImprovement: string[];
    suggestedModifications: string[];
    safetyConcerns: string[];
}
