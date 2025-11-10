
import { GoogleGenAI, Type } from "@google/genai";
// FIX: Added WorkPack and WorkPackEvaluationResponse to imports.
import { ManpowerTask, ManpowerCalculationResponse, WorkPack, WorkPackEvaluationResponse } from "../types";

// Access the API key from environment variables.
// FIX: Use import.meta.env.VITE_API_KEY for client-side Vite applications.
// FIX: Per coding guidelines, the API key must be sourced from `process.env.API_KEY`, which also resolves the TypeScript error.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const manpowerCalculationSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: 'A summary of the work package in Vietnamese, including a list of key tasks, based on the user-provided example format. The list of major items must be in the original English.'
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
            c.  **Initial Personnel Count**: For each personnel type in the zone, calculate an initial number of people required. Assume one person works 8 hours per day. Formula: \`ceil(Total Man-Hours for that Type / 8)\`.
            d.  **Apply Ratio Rule**: The number of 'MEC' (general mechanics) must be approximately 1 to 2 times the total number of all other specialized personnel (B1, B2, ME*, EA, CAB) combined.
        
        5.  **CRITICAL CALIBRATION STEP**: After your initial calculation, you MUST adjust the final numbers to align with a real-world team structure. For a work package like the one provided, the expected **TOTAL** manpower across all zones is approximately: **4 B1, 1 B2, 2 ME34, 2 ME567, 2 ME128, 1 EA, 15 MEC**. Use this target distribution as a guide to perform a "reverse inference" and calibrate your per-zone results. The final summed-up numbers from all zones in your output should closely match this target. This step is crucial for providing a practical and realistic recommendation.

        6.  **Format the Output**: Return your complete, calibrated analysis in the specified JSON format, with a breakdown for each zone.
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

// FIX: Added missing evaluateWorkPack function and its corresponding schema.
const workPackEvaluationSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: {
            type: Type.INTEGER,
            description: 'An overall score from 0 to 10 evaluating the work pack. 0 is very poor, 10 is excellent.'
        },
        summary: {
            type: Type.STRING,
            description: 'A brief, one-sentence summary of the evaluation.'
        },
        positivePoints: {
            type: Type.ARRAY,
            description: 'A list of well-defined and clear aspects of the work pack.',
            items: { type: Type.STRING }
        },
        areasForImprovement: {
            type: Type.ARRAY,
            description: 'A list of aspects that are vague, unclear, or could be improved.',
            items: { type: Type.STRING }
        },
        suggestedModifications: {
            type: Type.ARRAY,
            description: 'A list of specific, actionable suggestions to improve the tasks or description.',
            items: { type: Type.STRING }
        },
        safetyConcerns: {
            type: Type.ARRAY,
            description: 'A list of any potential safety issues or missing safety precautions.',
            items: { type: Type.STRING }
        }
    },
    required: ['overallScore', 'summary', 'positivePoints', 'areasForImprovement', 'suggestedModifications', 'safetyConcerns']
};

export const evaluateWorkPack = async (workPack: WorkPack): Promise<WorkPackEvaluationResponse> => {
    const prompt = `
        You are an expert aviation maintenance supervisor. Your task is to evaluate a work pack for clarity, safety, and completeness.

        Here is the work pack data:
        \`\`\`json
        ${JSON.stringify(workPack, null, 2)}
        \`\`\`

        Follow these evaluation criteria:
        1.  **Clarity**: Are the title, description, and tasks clear and unambiguous?
        2.  **Completeness**: Does the work pack seem to include all necessary steps? Are there any obvious omissions? For example, a replacement task should include steps for removal, installation, and testing.
        3.  **Safety**: Are there any potential safety risks? Are standard safety precautions (like disconnecting power, depressurizing systems) mentioned or implied where necessary?
        4.  **Best Practices**: Does the work pack follow standard aviation maintenance practices?

        Based on your evaluation, provide the following:
        -   **overallScore**: A score from 0 (very poor) to 10 (excellent).
        -   **summary**: A brief, one-sentence summary of your findings.
        -   **positivePoints**: A list of things that are done well (e.g., "Clear description of task.").
        -   **areasForImprovement**: A list of things that are unclear or could be better defined (e.g., "Task 'Install new motor' lacks detail on torque specifications.").
        -   **suggestedModifications**: A list of specific, actionable changes (e.g., "Add a task: 'Perform operational test of APU after motor installation.'").
        -   **safetyConcerns**: A list of any identified safety risks (e.g., "No mention of disconnecting the battery before working on electrical components.").

        Return your complete analysis in the specified JSON format.
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
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error evaluating work pack with Gemini:', error);
        return {
            overallScore: 0,
            summary: "Sorry, I encountered a technical issue while evaluating the work pack. Please try again.",
            positivePoints: [],
            areasForImprovement: [],
            suggestedModifications: [],
            safetyConcerns: [],
        };
    }
};
