import React, { useState } from 'react';

interface ChartData {
    label: string;
    [key: string]: string | number;
}

interface AnalysisChartProps {
    data: ChartData[];
    keys: string[];
    colors: { [key: string]: string };
}

export const AnalysisChart: React.FC<AnalysisChartProps> = ({ data, keys, colors }) => {
    const [activeData, setActiveData] = useState<ChartData | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const containerWidth = 800;
    const containerHeight = 400;
    const margin = { top: 20, right: 20, bottom: 80, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    if (!data || data.length === 0) {
        return <div className="text-center text-gray-500 p-8">No data to display for the selected period.</div>;
    }

    const yMaxPrimary = Math.max(...data.map(d => Number(d[keys[0]] || 0)));
    const yMaxSecondary = Math.max(...data.map(d => Number(d[keys[1]] || 0)));

    const yPrimaryScale = (value: number) => height - (value / yMaxPrimary) * height;
    const ySecondaryScale = (value: number) => height - (value / yMaxSecondary) * height;

    const numBars = data.length;
    const barGroupWidth = width / numBars;
    const barPadding = 0.2;
    const barWidth = barGroupWidth * (1 - barPadding) / keys.length;
    
    // Y-axis ticks
    const yPrimaryTicks = Array.from({ length: 6 }, (_, i) => Math.ceil((yMaxPrimary / 5) * i));
    const ySecondaryTicks = Array.from({ length: 6 }, (_, i) => Math.ceil((yMaxSecondary / 5) * i));

    const handleMouseEnter = (event: React.MouseEvent, dataPoint: ChartData) => {
        setActiveData(dataPoint);
        setTooltipPosition({ x: event.clientX, y: event.clientY });
    };

    const handleMouseLeave = () => {
        setActiveData(null);
    };

    return (
        <div className="relative">
             <div className="flex justify-center items-center gap-6 mb-4">
                {keys.map(key => (
                    <div key={key} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: colors[key] }}></div>
                        <span className="text-sm text-gray-600">{key}</span>
                    </div>
                ))}
            </div>
            <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${containerWidth} ${containerHeight}`} className={`min-w-[${containerWidth}px]`}>
                    <g transform={`translate(${margin.left},${margin.top})`}>
                        {/* Y-axis Primary (Flights) */}
                        <g className="text-gray-500">
                            {yPrimaryTicks.map(tick => (
                                <g key={`y1-tick-${tick}`} transform={`translate(0, ${yPrimaryScale(tick)})`}>
                                    <line x2={width} stroke="currentColor" strokeDasharray="2,2" className="text-gray-200" />
                                    <text x="-10" dy="0.32em" textAnchor="end" className="text-xs fill-current">{tick}</text>
                                </g>
                            ))}
                             <text transform={`rotate(-90)`} y="-50" x={-height/2} dy="1em" textAnchor="middle" className="text-sm font-semibold fill-current">{keys[0]}</text>
                        </g>

                         {/* Y-axis Secondary (ManHours) */}
                        <g className="text-gray-500">
                            {ySecondaryTicks.map(tick => (
                                <g key={`y2-tick-${tick}`} transform={`translate(0, ${ySecondaryScale(tick)})`}>
                                    <text x={width + 10} dy="0.32em" textAnchor="start" className="text-xs fill-current">{tick}</text>
                                </g>
                            ))}
                             <text transform={`rotate(-90)`} y={width + 45} x={-height/2} dy="1em" textAnchor="middle" className="text-sm font-semibold fill-current">{keys[1]}</text>
                        </g>

                        {/* Bars and X-axis Labels */}
                        {data.map((d, i) => (
                            <g 
                                key={d.label} 
                                transform={`translate(${i * barGroupWidth}, 0)`}
                                onMouseEnter={(e) => handleMouseEnter(e, d)}
                                onMouseLeave={handleMouseLeave}
                                className="cursor-pointer transition-opacity duration-200"
                                style={{ opacity: activeData && activeData.label !== d.label ? 0.6 : 1 }}
                            >
                                {/* Invisible hover area */}
                                <rect x="0" y="0" width={barGroupWidth} height={height} fill="transparent" />
                                
                                {/* Bar for primary key */}
                                <rect
                                    x={barGroupWidth * barPadding / 2}
                                    y={yPrimaryScale(Number(d[keys[0]]))}
                                    width={barWidth}
                                    height={height - yPrimaryScale(Number(d[keys[0]]))}
                                    fill={colors[keys[0]]}
                                />

                                {/* Bar for secondary key */}
                                <rect
                                    x={(barGroupWidth * barPadding / 2) + barWidth}
                                    y={ySecondaryScale(Number(d[keys[1]]))}
                                    width={barWidth}
                                    height={height - ySecondaryScale(Number(d[keys[1]]))}
                                    fill={colors[keys[1]]}
                                />

                                <text
                                    x={barGroupWidth / 2}
                                    y={height + 15}
                                    textAnchor="middle"
                                    transform={`rotate(45, ${barGroupWidth / 2}, ${height + 15})`}
                                    className="text-xs text-gray-600 fill-current"
                                >
                                    {d.label}
                                </text>
                            </g>
                        ))}
                        
                        <line x1="0" y1={height} x2={width} y2={height} stroke="currentColor" className="text-gray-300" />
                    </g>
                </svg>
            </div>
            
            {activeData && (
                <div 
                    className="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-sm transition-opacity duration-200"
                    style={{
                        position: 'fixed',
                        left: tooltipPosition.x,
                        top: tooltipPosition.y,
                        transform: 'translate(15px, -100%)', // Offset to appear above and to the right of the cursor
                        pointerEvents: 'none', // Prevent tooltip from capturing mouse events
                        zIndex: 50,
                    }}
                >
                    <p className="font-bold mb-1 border-b border-gray-600 pb-1">{activeData.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                         <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[keys[0]] }}></div>
                         <span>{keys[0]}: <strong>{Number(activeData[keys[0]]).toLocaleString()}</strong></span>
                    </div>
                     <div className="flex items-center gap-2 mt-1">
                         <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[keys[1]] }}></div>
                         <span>{keys[1]}: <strong>{Number(activeData[keys[1]]).toLocaleString()}</strong></span>
                    </div>
                </div>
            )}
        </div>
    );
};