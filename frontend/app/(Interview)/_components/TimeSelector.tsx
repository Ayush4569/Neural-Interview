'use client';

import React, {  useCallback, memo } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type {TimeState} from "@/types/globalTypes";


const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
export const TimeSelector = memo(({ 
    selectedTime, 
    onTimeChange 
}: { 
    selectedTime: TimeState; 
    onTimeChange: (time: TimeState) => void; 
}) => {
    const handleHourChange = useCallback((hour: string) => {
        onTimeChange({ ...selectedTime, hour });
    }, [selectedTime, onTimeChange]);

    const handleMinuteChange = useCallback((minute: string) => {
        onTimeChange({ ...selectedTime, minute });
    }, [selectedTime, onTimeChange]);

    return (
        <div className="border-t border-[color:var(--border)] p-3">
            <div className="flex items-center gap-2">
                <span className="text-sm text-[color:var(--text)]">Time:</span>
                <Select value={selectedTime.hour} onValueChange={handleHourChange}>
                    <SelectTrigger className="w-20 h-8 px-2 border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--text)]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-48 border-[color:var(--border)] bg-[color:var(--surface)]">
                        {HOURS.map(hour => (
                            <SelectItem key={hour} value={hour} className="text-[color:var(--text)]">
                                {hour}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span className="text-[color:var(--text)]">:</span>
                <Select value={selectedTime.minute} onValueChange={handleMinuteChange}>
                    <SelectTrigger className="w-20 h-8 px-2 border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--text)]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-48 border-[color:var(--border)] bg-[color:var(--surface)]">
                        {MINUTES.map(minute => (
                            <SelectItem key={minute} value={minute} className="text-[color:var(--text)]">
                                {minute}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
});

TimeSelector.displayName = 'TimeSelector';