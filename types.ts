
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

// FIX: Added missing type definitions.
export interface Flight {
  airline: string;
  flightNumber: string;
  origin: string;
  departureTime: string;
  destination: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
}

export interface WorkLog {
  Date: string;
  AircraftType: string;
  Airport: string;
  WorkType: string;
  Flights: number;
  ManHours: number;
  FileName?: string;
}

export interface ActiveFilters {
  maxPrice: number;
  stops: number[];
  airlines: string[];
}

export interface WorkPackTask {
    id: string;
    description: string;
    isCompleted: boolean;
}

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

export interface WorkPackEvaluationResponse {
    overallScore: number;
    summary: string;
    positivePoints: string[];
    areasForImprovement: string[];
    suggestedModifications: string[];
    safetyConcerns: string[];
}
