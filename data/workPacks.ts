import { WorkPack } from '../types';

export const mockWorkPacks: WorkPack[] = [
  {
    id: 'WP-2024-001',
    title: 'A320 Main Landing Gear Inspection',
    description: 'Perform a detailed visual and functional inspection of the main landing gear assembly as per AMM 32-10-00.',
    aircraftType: 'Airbus A320',
    createdBy: 'John Doe',
    dateCreated: '2024-05-15T09:00:00Z',
    status: 'Pending Review',
    tasks: [
      { id: 't-001', description: 'Visually inspect gear structure for cracks, corrosion, or damage.', isCompleted: false },
      { id: 't-002', description: 'Check tire pressure and condition. Record values.', isCompleted: false },
      { id: 't-003', description: 'Inspect brake units for wear and leaks.', isCompleted: false },
      { id: 't-004', description: 'Lubricate all specified points on the gear mechanism.', isCompleted: false },
    ],
  },
  {
    id: 'WP-2024-002',
    title: 'B787 Engine #1 Oil Filter Replacement',
    description: 'Replace the engine #1 oil filter. Ensure all safety precautions are taken and the area is clean before starting.',
    aircraftType: 'Boeing 787',
    createdBy: 'Jane Smith',
    dateCreated: '2024-05-18T14:30:00Z',
    status: 'Approved',
    tasks: [
      { id: 't-001', description: 'Gain access to the engine #1 oil filter housing.', isCompleted: true },
      { id: 't-002', description: 'Drain residual oil and remove the old filter element.', isCompleted: true },
      { id: 't-003', description: 'Install new filter element and torque to specification.', isCompleted: true },
      { id: 't-004', description: 'Perform engine ground run to check for leaks.', isCompleted: true },
      { id: 't-005', description: 'Update aircraft maintenance records.', isCompleted: true },
    ],
  },
   {
    id: 'WP-2024-003',
    title: 'ATR 72 Cabin Lighting System Check',
    description: 'Conduct a full functional check of the cabin and emergency lighting systems.',
    aircraftType: 'ATR 72',
    createdBy: 'Peter Jones',
    dateCreated: '2024-05-20T11:00:00Z',
    status: 'Pending Review',
    tasks: [
      { id: 't-001', description: 'Test all overhead passenger reading lights.', isCompleted: false },
      { id: 't-002', description: 'Verify main cabin lighting settings (dim, bright) are functional.', isCompleted: false },
      { id: 't-003', description: 'Activate and check emergency lighting path illumination.', isCompleted: false },
    ],
  },
  {
    id: 'WP-2024-004',
    title: 'B737 APU Start Motor Change',
    description: 'Task to replace the Auxiliary Power Unit (APU) start motor.',
    aircraftType: 'Boeing 737',
    createdBy: 'John Doe',
    dateCreated: '2024-05-21T08:00:00Z',
    status: 'Rejected',
    tasks: [
      { id: 't-001', description: 'Disconnect APU battery.', isCompleted: false },
      { id: 't-002', description: 'Remove old start motor.', isCompleted: false },
      { id: 't-003', description: 'Install new motor.', isCompleted: false },
    ],
  },
];
