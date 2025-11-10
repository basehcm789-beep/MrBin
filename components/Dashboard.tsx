import React, { useState, useEffect, useMemo } from 'react';
import { WorkLog } from '../types';
import { fetchDataFromGoogleSheet } from '../services/googleSheetService';
import { KPICard } from './KPICard';
import { AnalysisChart } from './AnalysisChart';
import { FileListTable } from './FileListTable';
import { AggregatedDataTable } from './AggregatedDataTable'; // New generic table
import { FlightIcon } from './icons/FlightIcon';
import { ClockIcon } from './icons/ClockIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { FileIcon } from './icons/FileIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { normalizeDate, getFormattedDate } from '../utils/dateUtils';

type AnalysisTab = 'day' | 'month' | 'aircraft' | 'airport';
type FilterMode = 'range' | 'year';

const Dashboard: React.FC = () => {
    const [allData, setAllData] = useState<WorkLog[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<AnalysisTab>('day');

    // State for 'day' & 'month' tab filters
    const [filterMode, setFilterMode] = useState<FilterMode>('range');
    const [startDate, setStartDate] = useState<string>(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 3);
        return getFormattedDate(date);
    });
    const [endDate, setEndDate] = useState<string>(() => getFormattedDate(new Date()));
    const availableYears = useMemo(() => {
        const years = new Set(allData.map(item => normalizeDate(item.Date).substring(0, 4)));
        return Array.from(years).sort().reverse();
    }, [allData]);
    const [selectedYear, setSelectedYear] = useState<string>('');
    useEffect(() => {
        if (availableYears.length > 0 && !selectedYear) {
            setSelectedYear(availableYears[0]);
        }
    }, [availableYears, selectedYear]);


    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchDataFromGoogleSheet();
                setAllData(data);
            } catch (err) {
                setError('Failed to fetch data from Google Sheet. Please check the connection and try again.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // --- Memoized calculations for 'day' & 'month' tabs ---
    const dateFilteredData = useMemo(() => {
        if (filterMode === 'year') {
            if (!selectedYear) return [];
            return allData.filter(item => normalizeDate(item.Date).startsWith(selectedYear));
        }
        return allData.filter(item => {
            const itemDate = normalizeDate(item.Date);
            return itemDate >= startDate && itemDate <= endDate;
        });
    }, [allData, startDate, endDate, filterMode, selectedYear]);

    const dateKpis = useMemo(() => {
        const totalFlights = dateFilteredData.reduce((sum, item) => sum + (item.Flights || 0), 0);
        const totalManHours = dateFilteredData.reduce((sum, item) => sum + (item.ManHours || 0), 0);
        const airportActivity = dateFilteredData.reduce((acc: { [key: string]: number }, item) => {
            acc[item.Airport] = (acc[item.Airport] || 0) + 1;
            return acc;
        }, {});
        // FIX: Explicitly type the arguments of the sort callback to ensure TypeScript
        // correctly infers the values being compared as numbers, resolving the error.
        const busiestAirport = Object.entries(airportActivity).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0]?.[0] || 'N/A';
        const uniqueFiles = new Set(dateFilteredData.map(item => item.FileName)).size;
        
        return { totalFlights, totalManHours, busiestAirport, uniqueFiles };
    }, [dateFilteredData]);

    const dayChartData = useMemo(() => {
        const dailyData: { [key: string]: { Flights: number; ManHours: number } } = {};
        
        dateFilteredData.forEach(item => {
            const day = normalizeDate(item.Date);
            if (!day) return;
            if (!dailyData[day]) {
                dailyData[day] = { Flights: 0, ManHours: 0 };
            }
            dailyData[day].Flights += item.Flights;
            dailyData[day].ManHours += item.ManHours;
        });

        return Object.entries(dailyData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([label, values]) => ({ label, ...values }));
    }, [dateFilteredData]);
    
    const monthChartData = useMemo(() => {
        const monthlyData: { [key: string]: { Flights: number; ManHours: number } } = {};
        
        dateFilteredData.forEach(item => {
            const month = normalizeDate(item.Date).substring(0, 7);
            if (!month) return;
            if (!monthlyData[month]) {
                monthlyData[month] = { Flights: 0, ManHours: 0 };
            }
            monthlyData[month].Flights += item.Flights;
            monthlyData[month].ManHours += item.ManHours;
        });
        
        if (filterMode === 'year' && selectedYear) {
             for (let i = 1; i <= 12; i++) {
                const monthKey = `${selectedYear}-${String(i).padStart(2, '0')}`;
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = { Flights: 0, ManHours: 0 };
                }
            }
        }

        return Object.entries(monthlyData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([label, values]) => ({ label, ...values }));
    }, [dateFilteredData, filterMode, selectedYear]);


    // --- Memoized calculations for 'aircraft' tab ---
    const aircraftAggregatedData = useMemo(() => {
        const aircraftMap = new Map<string, { Flights: number; ManHours: number; recordCount: number }>();
        allData.forEach(item => {
            const type = item.AircraftType || 'Unknown';
            if (!aircraftMap.has(type)) {
                aircraftMap.set(type, { Flights: 0, ManHours: 0, recordCount: 0 });
            }
            const current = aircraftMap.get(type)!;
            current.Flights += item.Flights;
            current.ManHours += item.ManHours;
            current.recordCount += 1;
        });
        return Array.from(aircraftMap.entries()).map(([label, values]) => ({ label, ...values })).sort((a, b) => b.Flights - a.Flights);
    }, [allData]);

    const aircraftKpis = useMemo(() => {
        const sortedByFlights = [...aircraftAggregatedData].sort((a,b) => b.Flights - a.Flights);
        const sortedByManHours = [...aircraftAggregatedData].sort((a,b) => b.ManHours - a.ManHours);
        return {
            totalTypes: aircraftAggregatedData.length,
            busiestByFlights: sortedByFlights[0]?.label || 'N/A',
            busiestByManHours: sortedByManHours[0]?.label || 'N/A',
            totalFlights: allData.reduce((sum, item) => sum + item.Flights, 0)
        };
    }, [aircraftAggregatedData, allData]);

    // --- Memoized calculations for 'airport' tab ---
     const airportAggregatedData = useMemo(() => {
        const airportMap = new Map<string, { Flights: number; ManHours: number; recordCount: number }>();
        allData.forEach(item => {
            const airport = item.Airport || 'Unknown';
            if (!airportMap.has(airport)) {
                airportMap.set(airport, { Flights: 0, ManHours: 0, recordCount: 0 });
            }
            const current = airportMap.get(airport)!;
            current.Flights += item.Flights;
            current.ManHours += item.ManHours;
            current.recordCount += 1;
        });
        return Array.from(airportMap.entries()).map(([label, values]) => ({ label, ...values })).sort((a, b) => b.Flights - a.Flights);
    }, [allData]);

    const airportKpis = useMemo(() => {
        const sortedByFlights = [...airportAggregatedData].sort((a,b) => b.Flights - a.Flights);
        const sortedByManHours = [...airportAggregatedData].sort((a,b) => b.ManHours - a.ManHours);
        return {
            totalAirports: airportAggregatedData.length,
            busiestByFlights: sortedByFlights[0]?.label || 'N/A',
            busiestByManHours: sortedByManHours[0]?.label || 'N/A',
            totalManHours: allData.reduce((sum, item) => sum + item.ManHours, 0)
        };
    }, [airportAggregatedData, allData]);

    const renderTimeBasedContent = (chartData: any[], chartTitle: string) => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard title="Total Flights" value={dateKpis.totalFlights.toLocaleString()} icon={FlightIcon} color="blue" />
                <KPICard title="Total Man Hours" value={dateKpis.totalManHours.toLocaleString()} icon={ClockIcon} color="green" />
                <KPICard title="Busiest Airport" value={dateKpis.busiestAirport} icon={TrendingUpIcon} color="purple" />
                <KPICard title="Files Processed" value={dateKpis.uniqueFiles.toLocaleString()} icon={FileIcon} color="orange" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{chartTitle}</h2>
                <AnalysisChart data={chartData} keys={['Flights', 'ManHours']} colors={{ Flights: '#3b82f6', ManHours: '#10b981' }} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <FileListTable data={dateFilteredData} />
            </div>
        </>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'aircraft':
                return <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <KPICard title="Total Aircraft Types" value={aircraftKpis.totalTypes.toLocaleString()} icon={PaperAirplaneIcon} color="blue" />
                        <KPICard title="Busiest (by Flights)" value={aircraftKpis.busiestByFlights} icon={FlightIcon} color="purple" />
                        <KPICard title="Most Used (by Hours)" value={aircraftKpis.busiestByManHours} icon={ClockIcon} color="green" />
                        <KPICard title="Total Flights" value={aircraftKpis.totalFlights.toLocaleString()} icon={FileIcon} color="orange" />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity by Aircraft Type</h2>
                        <AnalysisChart data={aircraftAggregatedData} keys={['Flights', 'ManHours']} colors={{ Flights: '#3b82f6', ManHours: '#10b981' }} />
                    </div>
                     <AggregatedDataTable
                        title="Aircraft Statistics"
                        description="Detailed breakdown of activity for each aircraft type."
                        headers={[
                            { key: 'label', label: 'Aircraft Type' },
                            { key: 'Flights', label: 'Total Flights', isNumeric: true },
                            { key: 'ManHours', label: 'Total Man Hours', isNumeric: true },
                            { key: 'recordCount', label: 'Record Count', isNumeric: true },
                        ]}
                        data={aircraftAggregatedData}
                    />
                </>;
            case 'airport':
                return <>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <KPICard title="Total Airports" value={airportKpis.totalAirports.toLocaleString()} icon={ChartBarIcon} color="blue" />
                        <KPICard title="Busiest (by Flights)" value={airportKpis.busiestByFlights} icon={TrendingUpIcon} color="purple" />
                        <KPICard title="Busiest (by Hours)" value={airportKpis.busiestByManHours} icon={ClockIcon} color="green" />
                        <KPICard title="Total Man Hours" value={airportKpis.totalManHours.toLocaleString()} icon={FileIcon} color="orange" />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity by Airport</h2>
                        <AnalysisChart data={airportAggregatedData} keys={['Flights', 'ManHours']} colors={{ Flights: '#3b82f6', ManHours: '#10b981' }} />
                    </div>
                     <AggregatedDataTable
                        title="Airport Statistics"
                        description="Detailed breakdown of activity for each airport."
                        headers={[
                            { key: 'label', label: 'Airport' },
                            { key: 'Flights', label: 'Total Flights', isNumeric: true },
                            { key: 'ManHours', label: 'Total Man Hours', isNumeric: true },
                            { key: 'recordCount', label: 'Record Count', isNumeric: true },
                        ]}
                        data={airportAggregatedData}
                    />
                </>;
            case 'month':
                return renderTimeBasedContent(monthChartData, "Monthly Activity");
            case 'day':
            default:
                return renderTimeBasedContent(dayChartData, "Daily Activity");
        }
    }

    if (isLoading) return <div className="flex-1 p-6 md:p-8 bg-gray-100 flex items-center justify-center"><p className="text-gray-600">Loading dashboard data...</p></div>;
    if (error) return <div className="flex-1 p-6 md:p-8 bg-gray-100 flex items-center justify-center"><div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span></div></div>;
    
    const tabs = [
        { id: 'day', label: 'Theo Ngày', icon: ChartBarIcon },
        { id: 'month', label: 'Theo Tháng', icon: CalendarIcon },
        { id: 'aircraft', label: 'Theo Máy Bay', icon: FlightIcon },
        { id: 'airport', label: 'Theo Sân Bay', icon: TrendingUpIcon }
    ];
    
    return (
        <div className="flex-1 p-6 md:p-8 bg-gray-100 overflow-y-auto">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Overview of aviation maintenance activities.</p>
            </header>
            
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as AnalysisTab)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center gap-2 transition-colors ${
                                activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            {(activeTab === 'day' || activeTab === 'month') && (
                <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                            <input type="radio" id="range" name="filterMode" value="range" checked={filterMode === 'range'} onChange={() => setFilterMode('range')} />
                            <label htmlFor="range" className="font-semibold text-gray-700">Theo khoảng thời gian</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="radio" id="year" name="filterMode" value="year" checked={filterMode === 'year'} onChange={() => setFilterMode('year')} />
                            <label htmlFor="year" className="font-semibold text-gray-700">Thống kê theo năm</label>
                        </div>
                    </div>
                        {filterMode === 'range' ? (
                        <div className="flex items-center gap-4 mt-4">
                            <label htmlFor="start-date" className="font-semibold text-gray-700">From:</label>
                            <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"/>
                            <label htmlFor="end-date" className="font-semibold text-gray-700">To:</label>
                            <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"/>
                        </div>
                        ) : (
                            <div className="flex items-center gap-4 mt-4">
                            <label htmlFor="year-select" className="font-semibold text-gray-700">Select Year:</label>
                            <select id="year-select" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                                {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                            </select>
                        </div>
                        )}
                </div>
            )}

            {renderContent()}
        </div>
    );
};

export default Dashboard;