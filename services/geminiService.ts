

import { GoogleGenAI, Type } from "@google/genai";
// FIX: Added missing type imports for WorkPack and WorkPackEvaluationResponse.
import { ManpowerTask, ManpowerCalculationResponse, WorkPack, WorkPackEvaluationResponse } from "../types";

// FIX: Use process.env.API_KEY as per the coding guidelines to resolve the TS error and align with best practices.
// This assumes the API key is available in the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const manpowerCalculationSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: 'A summary of the work package in Vietnamese, including a numbered list of key tasks and the calculated total project duration in days. The list of major items must be in the original English.'
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

// FIX: Added schema for WorkPackEvaluationResponse to support the new evaluation function.
const workPackEvaluationSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: {
            type: Type.INTEGER,
            description: "An overall score from 0 to 10 evaluating the quality, clarity, and safety of the work pack. 10 is excellent."
        },
        summary: {
            type: Type.STRING,
            description: "A concise, one-sentence summary of the evaluation."
        },
        positivePoints: {
            type: Type.ARRAY,
            description: "A list of specific positive aspects of the work pack.",
            items: { type: Type.STRING }
        },
        areasForImprovement: {
            type: Type.ARRAY,
            description: "A list of areas where the work pack could be improved for clarity or efficiency.",
            items: { type: Type.STRING }
        },
        suggestedModifications: {
            type: Type.ARRAY,
            description: "A list of concrete, actionable modifications to improve the work pack.",
            items: { type: Type.STRING }
        },
        safetyConcerns: {
            type: Type.ARRAY,
            description: "A list of any potential safety concerns or ambiguities identified in the tasks.",
            items: { type: Type.STRING }
        },
    },
    required: ['overallScore', 'summary', 'positivePoints', 'areasForImprovement', 'suggestedModifications', 'safetyConcerns']
};


export const calculateManpower = async (tasks: ManpowerTask[], fileName: string): Promise<ManpowerCalculationResponse> => {
    const dataSample = tasks.slice(0, 200); // Use a sample to avoid overly large prompts
    const prompt = `
        You are an expert aviation maintenance planner. Your task is to analyze a list of maintenance tasks from a file named "${fileName}", group them by zone, calculate the required manpower for each zone, and estimate the project duration. The response must be in Vietnamese.

        The data provided is a JSON array of tasks. Each task has properties like 'zone division', 'MAC hour' (Man-Hours), and a task title ('tiêu đề các task').

        Here is a sample of the data:
        \`\`\`json
        ${JSON.stringify(dataSample, null, 2)}
        \`\`\`

        Follow these steps meticulously:
        1.  **Identify Major Work Items**: Create a summary of the most important tasks. This list should include any task whose title (cột E) contains keywords like 'EO', 'EOD', 'T/S', 'trouble shoot', 'paint', or 'replace', OR any task with a large 'MAC hour' value (cột H). **CRITICAL: The descriptions for these major items must be kept in their original English and not translated.**
        2.  **Format Summary**: The summary must be presented as a numbered list of the main tasks identified above. For example: \`Tàu A866 ngoài gói check A11 thực hiện thêm các nội dung sau:\\n1. Perform troubleshoot on hydraulic system\\n2. Replace landing gear actuator\\n3. Paint underside of wings\`
        3.  **Group Tasks by Zone**: After summarizing, group all tasks based on their 'zone division' value.
        4.  **Calculate Manpower PER ZONE**: For each zone, perform the following calculations:
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
            c.  **Apply Ratio Rule**: The number of 'MEC' (general mechanics) must be approximately 1 to 2 times the total number of all other specialized personnel (B1, B2, ME*, EA, CAB) combined.
        
        5.  **CRITICAL CALIBRATION STEP**: After your initial calculation, you MUST adjust the final numbers to align with a real-world team structure. For a work package like the one provided, the expected **TOTAL** manpower across all zones is approximately: **4 B1, 1 B2, 2 ME34, 2 ME567, 2 ME128, 1 EA, 15 MEC**. Use this target distribution as a guide to perform a "reverse inference" and calibrate your per-zone results. The final summed-up numbers from all zones in your output should closely match this target. This step is crucial for providing a practical and realistic recommendation.
        
        6.  **Calculate Project Duration**:
            a.  The standard team size is fixed at 27 people (4 B1, 1 B2, 2 ME34, 2 ME567, 2 ME128, 1 EA, 15 MEC).
            b.  The daily capacity of this team is 27 people * 8 hours/day = 216 man-hours per day.
            c.  Sum the total 'MAC hour' from ALL tasks in the input file.
            d.  Calculate the number of days required: \`ceil(Total MAC hours / 216)\`.
            e.  Include this calculated number of days in the summary text. For example: "...Dự kiến hoàn thành trong X ngày."

        7.  **Format the Output**: Return your complete, calibrated analysis in the specified JSON format, with a breakdown for each zone and the duration included in the summary.
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
        if (!jsonText) {
             throw new Error("Received an empty response from the API.");
        }
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error calculating manpower with Gemini:', error);
        return {
            summary: "Rất tiếc, tôi đã gặp sự cố kỹ thuật khi phân tích tệp. Vui lòng thử lại sau.",
            zoneManpower: [],
        };
    }
};

// FIX: Added missing evaluateWorkPack function to resolve export error.
export const evaluateWorkPack = async (workPack: WorkPack): Promise<WorkPackEvaluationResponse> => {
    const prompt = `
        You are an expert aircraft maintenance supervisor and safety officer. Your task is to evaluate a given maintenance "Work Pack".
        Analyze the provided JSON object which contains the work pack's title, description, and a list of tasks.
        
        Work Pack Data:
        \`\`\`json
        ${JSON.stringify(workPack, null, 2)}
        \`\`\`

        Perform a thorough evaluation based on the following criteria:
        1.  **Clarity and Specificity**: Are the title, description, and task descriptions clear, unambiguous, and specific? Do they reference standard maintenance manuals (e.g., AMM)?
        2.  **Completeness**: Does the work pack seem complete? Are there any obvious missing steps (e.g., safety precautions, pre/post-work checks, documentation updates)?
        3.  **Logical Flow**: Are the tasks in a logical order?
        4.  **Safety**: Are there any potential safety hazards or risks implied or overlooked in the tasks? For example, failing to mention disconnecting power, depressurizing systems, or using personal protective equipment (PPE).
        5.  **Best Practices**: Does the work pack adhere to aviation maintenance best practices?

        Based on your analysis, provide a structured JSON response with the following components:
        - \`overallScore\`: A numerical score from 0 (very poor) to 10 (excellent).
        - \`summary\`: A single sentence summarizing your findings.
        - \`positivePoints\`: A list of what is done well.
        - \`areasForImprovement\`: A list of general areas that could be better (e.g., "Task descriptions lack specific measurements").
        - \`suggestedModifications\`: A list of concrete changes to improve the work pack (e.g., "Add a task: 'Disconnect aircraft battery before starting work as per AMM 24-00-00.'").
        - \`safetyConcerns\`: A list of explicit safety concerns. If there are none, return an empty array.

        Return ONLY the JSON object conforming to the specified schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: workPackEvaluationSchema,
            },
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
             throw new Error("Received an empty response from the API.");
        }
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error evaluating work pack with Gemini:', error);
        return {
            overallScore: 0,
            summary: "An error occurred during AI evaluation. Please try again.",
            positivePoints: [],
            areasForImprovement: [],
            suggestedModifications: [],
            safetyConcerns: ["The AI model failed to process the request."],
        };
    }
};
