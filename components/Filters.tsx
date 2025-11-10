
import React, { useState, useEffect } from 'react';
// FIX: Import ActiveFilters from the central types file instead of ChatView.
import { ActiveFilters } from '../types';

interface FilterProps {
    options: {
        priceRange: { min: number; max: number };
        availableAirlines: string[];
        availableStops: number[];
    };
    activeFilters: ActiveFilters;
    onFilterChange: (newFilters: ActiveFilters) => void;
}

const stopLabels: { [key: number]: string } = {
    0: 'Non-stop',
    1: '1 Stop',
    2: '2+ Stops'
};

const Filters: React.FC<FilterProps> = ({ options, activeFilters, onFilterChange }) => {
    const { priceRange, availableAirlines, availableStops } = options;
    const [maxPrice, setMaxPrice] = useState(activeFilters.maxPrice);
    const [selectedStops, setSelectedStops] = useState<number[]>(activeFilters.stops);
    const [selectedAirlines, setSelectedAirlines] = useState<string[]>(activeFilters.airlines);

    useEffect(() => {
        const handler = setTimeout(() => {
            onFilterChange({
                maxPrice,
                stops: selectedStops,
                airlines: selectedAirlines,
            });
        }, 200); // Debounce slider input

        return () => clearTimeout(handler);
    }, [maxPrice]);
    
    useEffect(() => {
        onFilterChange({ maxPrice, stops: selectedStops, airlines: selectedAirlines });
    }, [selectedStops, selectedAirlines]);

    const handleStopChange = (stop: number) => {
        setSelectedStops(prev => 
            prev.includes(stop) ? prev.filter(s => s !== stop) : [...prev, stop]
        );
    };

    const handleAirlineChange = (airline: string) => {
        setSelectedAirlines(prev =>
            prev.includes(airline) ? prev.filter(a => a !== airline) : [...prev, airline]
        );
    };
    
    const handleClear = () => {
        setMaxPrice(priceRange.max);
        setSelectedStops([]);
        setSelectedAirlines([]);
    }

    const availableStopOptions = [0, 1, 2].filter(stopValue => {
        if (stopValue < 2) return availableStops.includes(stopValue);
        return availableStops.some(s => s >= 2); // Show "2+ stops" if any flight has 2 or more stops
    });

    return (
        <div className="border-b border-gray-200 p-4">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Filter */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Max Price: <span className="font-bold text-blue-600">${maxPrice.toLocaleString()}</span></label>
                    <input
                        type="range"
                        min={priceRange.min}
                        max={priceRange.max}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Stops Filter */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Stops</label>
                    <div className="flex flex-wrap gap-2">
                       {availableStopOptions.map(stop => (
                            <button key={stop} onClick={() => handleStopChange(stop)} className={`px-3 py-1 text-sm font-medium rounded-full border transition-colors ${selectedStops.includes(stop) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                                {stopLabels[stop]}
                            </button>
                       ))}
                    </div>
                </div>

                {/* Airlines Filter */}
                <div className="space-y-2">
                     <label className="block text-sm font-semibold text-gray-700">Airlines</label>
                     <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                        {availableAirlines.map(airline => (
                            <button key={airline} onClick={() => handleAirlineChange(airline)} className={`px-3 py-1 text-sm font-medium rounded-full border transition-colors ${selectedAirlines.includes(airline) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                                {airline}
                            </button>
                        ))}
                     </div>
                </div>
            </div>
             <div className="max-w-4xl mx-auto mt-4 text-right">
                <button onClick={handleClear} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Clear Filters</button>
            </div>
        </div>
    );
};

export default Filters;