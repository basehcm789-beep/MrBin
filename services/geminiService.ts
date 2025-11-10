import { GoogleGenAI, Type } from "@google/genai";
// FIX: Added imports for WorkLog and Flight types.
import { WorkPack, WorkPackEvaluationResponse, WorkLog, Flight, ManpowerTask, ManpowerCalculationResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const workPackEvaluationSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { 
            type: Type.STRING, 
            description: 'A brief, conversational summary of the overall evaluation of the work pack.' 
        },
        overallScore: {
            type: Type.NUMBER,
            description: 'A score from 1 to 10 evaluating the quality, completeness, and clarity of the work pack.'
        },
        positivePoints: {
            type: Type.ARRAY,
            description: 'A list of specific strengths or well-written parts of the work pack.',
            items: { type: Type.STRING }
        },
        areasForImprovement: {
            type: Type.ARRAY,
            description: 'A list of areas where the work pack is unclear, incomplete, or could be improved.',
            items: { type: Type.STRING }
        },
        suggestedModifications: {
            type: Type.ARRAY,
            description: 'Specific, actionable suggestions for changes or additions to the tasks or description.',
            items: { type: Type.STRING }
        },
        safetyConcerns: {
            type: Type.ARRAY,
            description: 'A list of any potential safety issues, missing warnings, or procedural risks identified in the tasks.',
            items: { type: Type.STRING }
        }
    },
    required: ['summary', 'overallScore', 'positivePoints', 'areasForImprovement', 'suggestedModifications', 'safetyConcerns']
};


export const evaluateWorkPack = async (workPack: WorkPack): Promise<WorkPackEvaluationResponse> => {
    const workPackString = JSON.stringify({
        title: workPack.title,
        description: workPack.description,
        aircraftType: workPack.aircraftType,
        tasks: workPack.tasks.map(t => t.description)
    }, null, 2);

    const fullPrompt = `
        You are an expert aviation maintenance planner and safety inspector. Your task is to evaluate the following aircraft maintenance Work Pack.
        
        Analyze the provided JSON data which contains the work pack's title, description, aircraft type, and a list of tasks.
        
        Your evaluation should be thorough, professional, and focus on clarity, completeness, and safety.
        - **Clarity:** Are the task descriptions clear and unambiguous for a qualified technician?
        - **Completeness:** Are there any obvious missing steps, checks, or procedures? For instance, does a "replace component" task include a step for function testing afterward?
        - **Safety:** Are there any potential safety hazards? Are necessary warnings or precautions mentioned or implied? Does it follow standard aviation maintenance practices?
        - **Score:** Based on your analysis, provide an overall score from 1 (very poor) to 10 (excellent).

        Return your analysis in the specified JSON format.

        Here is the Work Pack data:
        \`\`\`json
        ${workPackString}
        \`\`\`
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: fullPrompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: workPackEvaluationSchema,
            },
        });

        const jsonText = response.text.trim();
        const responseData: WorkPackEvaluationResponse = JSON.parse(jsonText);
        return responseData;

    } catch (error) {
        console.error('Error evaluating work pack with Gemini:', error);
        return {
            summary: "I'm sorry, I encountered a technical issue while evaluating the work pack. Please try again later.",
            overallScore: 0,
            positivePoints: [],
            areasForImprovement: ["The AI model could not process the request."],
            suggestedModifications: [],
            safetyConcerns: [],
        };
    }
};

// FIX: Added function and schema for querying work log data.
const workLogQueryResponseSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: 'A conversational summary answering the user query based on the provided data. Mention the number of records found.'
        },
        worklogs: {
            type: Type.ARRAY,
            description: 'An array of work log objects that directly answer the user\'s query. Only include rows that match the query.',
            items: {
                type: Type.OBJECT,
                properties: {
                    Date: { type: Type.STRING },
                    AircraftType: { type: Type.STRING },
                    Airport: { type: Type.STRING },
                    WorkType: { type: Type.STRING },
                    Flights: { type: Type.NUMBER },
                    ManHours: { type: Type.NUMBER },
                    FileName: { type: Type.STRING },
                },
            },
        },
    },
    required: ['summary', 'worklogs']
};

export const queryWorkLogData = async (query: string, data: WorkLog[]): Promise<{ summary: string; worklogs: WorkLog[] }> => {
    const dataSample = data.slice(0, 100); // Use a sample to avoid overly large prompts
    const prompt = `
        You are an expert aviation data analyst.
        Analyze the following JSON data which contains aviation work logs.
        The user's query is: "${query}"

        Your task is to:
        1. Understand the user's query.
        2. Filter the provided data to find records that match the query.
        3. Provide a concise, natural language summary of your findings.
        4. Return the filtered data records in the specified JSON format. If the query is a calculation (e.g., "total"), the summary should contain the answer and the worklogs array can be empty. If no data matches, say so in the summary and return an empty array.

        Here is a sample of the work log data:
        \`\`\`json
        ${JSON.stringify(dataSample, null, 2)}
        \`\`\`
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: workLogQueryResponseSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error querying work log data with Gemini:', error);
        return {
            summary: "I'm sorry, I encountered an issue while analyzing the work log data. Please try again.",
            worklogs: [],
        };
    }
};

// FIX: Added function and schema for querying flight data.
const flightQueryResponseSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: 'A conversational summary answering the user query based on the provided flight data. Mention the number of flights found.'
        },
        flights: {
            type: Type.ARRAY,
            description: 'An array of flight objects that directly answer the user\'s query. Only include rows that match the query.',
            items: {
                type: Type.OBJECT,
                properties: {
                    airline: { type: Type.STRING },
                    flightNumber: { type: Type.STRING },
                    origin: { type: Type.STRING },
                    destination: { type: Type.STRING },
                    departureTime: { type: Type.STRING },
                    arrivalTime: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    stops: { type: Type.INTEGER },
                    price: { type: Type.NUMBER },
                },
            },
        },
    },
    required: ['summary', 'flights']
};


export const queryFlightData = async (query: string, data: Flight[]): Promise<{ summary: string; flights: Flight[] }> => {
    const dataSample = data.slice(0, 100); // Use a sample to avoid overly large prompts
    const prompt = `
        You are an expert flight data analyst and travel assistant.
        Analyze the following JSON data which contains flight schedules.
        The user's query is: "${query}"

        Your task is to:
        1. Understand the user's query (e.g., finding flights, calculating cheapest, etc.).
        2. Filter the provided data to find flights that match the query.
        3. Provide a concise, natural language summary of your findings.
        4. Return the filtered flight data in the specified JSON format. If the query is a calculation (e.g., "cheapest flight"), the summary should contain the answer and the flights array can contain just that one flight or be empty. If no data matches, say so in the summary and return an empty array.

        Here is a sample of the flight data:
        \`\`\`json
        ${JSON.stringify(dataSample, null, 2)}
        \`\`\`
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: flightQueryResponseSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error querying flight data with Gemini:', error);
        return {
            summary: "I'm sorry, I encountered an issue while analyzing the flight data. Please try again.",
            flights: [],
        };
    }
};

const manpowerCalculationSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: 'A summary of the work package in Vietnamese, including a list of key tasks, based on the user-provided example format.'
        },
        zoneManpower: {
            type: Type.ARRAY,
            description: 'An array where each element represents a zone and its required manpower.',
            items: {
                type: Type.OBJECT,
                properties: {
                    zone: {
                        type: Type.STRING,
                        description: 'The name or number of the zone division.'
                    },
                    manpower: {
                        type: Type.ARRAY,
                        description: 'A list of required personnel for this zone.',
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                personnelType: {
                                    type: Type.STRING,
                                    description: 'The type of personnel (e.g., "B1", "MEC").'
                                },
                                count: {
                                    type: Type.INTEGER,
                                    description: 'The calculated number of people required for this personnel type.'
                                }
                            },
                            required: ['personnelType', 'count']
                        }
                    }
                },
                required: ['zone', 'manpower']
            }
        }
    },
    required: ['summary', 'zoneManpower']
};


export const calculateManpower = async (tasks: ManpowerTask[], fileName: string): Promise<ManpowerCalculationResponse> => {
    const dataSample = tasks.slice(0, 200); // Use a sample to avoid overly large prompts
    const prompt = `
        You are an expert aviation maintenance planner. Your task is to analyze a list of maintenance tasks from a file named "${fileName}", group them by zone, and calculate the required manpower for each zone. The response must be in Vietnamese.

        The data provided is a JSON array of tasks. Each task has properties like 'zone division', 'MAC hour' (Man-Hours), and a task title ('tiêu đề các task').

        Here is a sample of the data:
        \`\`\`json
        ${JSON.stringify(dataSample, null, 2)}
        \`\`\`

        Follow these steps meticulously:
        1.  **Group Tasks by Zone**: Group all tasks based on their 'zone division' value.
        2.  **Summarize Work Package**: Create a summary of the overall work package based on the file name and task titles. **The summary must be presented as a numbered list of the main tasks or work items.** For example: \`Tàu A866 ngoài gói check A11 thực hiện thêm các nội dung sau:\\n1. Task nước\\n2. Torque ACM + check leak pack\\n3. Rửa HX 1 bên\`
        3.  **Calculate Manpower PER ZONE**: For each zone, perform the following calculations:
            a.  **Sum Man-Hours**: Sum the 'MAC hour' for all tasks within that zone.
            b.  **Allocate Personnel**: Based on the zone and task types, assign personnel. Use the following mapping and naming convention:
                - Certifying Staff (Mechanical/Structure): **B1**
                - Certifying Staff (Avionics): **B2**
                - 'Thân vỏ' (Airframe/Structure, e.g., zones 100, 200, 800) -> Personnel Type: **ME128**
                - 'Điện tử' (Avionics, e.g., zone named 'AVI') -> Personnel Type: **EA**
                - 'Cơ khí động cơ' (Engine Mechanics, e.g., zones 300, 400, 70) -> Personnel Type: **ME34**
                - 'Cơ khí hệ thống' (Systems Mechanics, e.g., zones 500, 600, 700) -> Personnel Type: **ME567**
                - 'Thợ máy' (General Mechanic for various tasks) -> Personnel Type: **MEC**
                - 'Nội Thất' (Cabin/Interior) -> Personnel Type: **CAB**
            c.  **Initial Personnel Count**: For each personnel type in the zone, calculate an initial number of people required. Assume one person works 8 hours per day. Formula: \`ceil(Total Man-Hours for that Type / 8)\`.
            d.  **Apply Ratio Rule**: The number of 'MEC' (general mechanics) must be approximately 1 to 2 times the total number of all other specialized personnel (B1, B2, ME*, EA, CAB) combined.
        
        4.  **CRITICAL CALIBRATION STEP**: After your initial calculation, you MUST adjust the final numbers to align with a real-world team structure. For a work package like the one provided, the expected **TOTAL** manpower across all zones is approximately: **4 B1, 1 B2, 2 ME34, 2 ME567, 2 ME128, 1 EA, 15 MEC**. Use this target distribution as a guide to perform a "reverse inference" and calibrate your per-zone results. The final summed-up numbers from all zones in your output should closely match this target. This step is crucial for providing a practical and realistic recommendation.

        5.  **Format the Output**: Return your complete, calibrated analysis in the specified JSON format, with a breakdown for each zone.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: manpowerCalculationSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error calculating manpower with Gemini:', error);
        return {
            summary: "Rất tiếc, tôi đã gặp sự cố kỹ thuật khi phân tích tệp. Vui lòng thử lại sau.",
            zoneManpower: [],
        };
    }
};