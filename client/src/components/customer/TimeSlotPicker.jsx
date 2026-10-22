import React, { useEffect } from 'react';
import { format, isBefore, addDays } from 'date-fns';

const TimeSlotPicker = ({ selectedDate, setSelectedDate, availableSlots = [], selectedSlot, onSelectSlot }) => {
  
  // 1. Set Parlour Closing Time (e.g., 20 = 8:00 PM in 24-hour format)
  const PARLOUR_CLOSING_HOUR = 20; 

  const parseSelectedDate = (dateVal) => {
    if (!dateVal) return new Date();
    if (typeof dateVal === 'string' && dateVal.includes('-')) {
      const [y, m, d] = dateVal.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date(dateVal);
  };

  // 2. Auto Next-Day Logic: If it's past closing time today, switch to tomorrow
  useEffect(() => {
    const now = new Date();
    const selected = parseSelectedDate(selectedDate);

    // If booking for today AND current time is past closing hour
    if (selected.toDateString() === now.toDateString() && now.getHours() >= PARLOUR_CLOSING_HOUR) {
      // Auto-switch selected date to tomorrow
      const tomorrow = addDays(now, 1);
      setSelectedDate(format(tomorrow, 'yyyy-MM-dd'));
    }
  }, [selectedDate, setSelectedDate]);

  // 3. Dynamic Past Slots Check Logic
  const isSlotPast = (slotTimeStr) => {
    if (!slotTimeStr) return false;
    const now = new Date();
    const selected = parseSelectedDate(selectedDate);

    // If it's a future date, no slots are "past"
    if (selected.toDateString() !== now.toDateString()) {
      return false;
    }

    // If it's today, parse the slot time (e.g., "12:00 PM") into a Date object
    const [time, modifier] = slotTimeStr.split(' ');
    if (!time) return false;
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    
    const slotDateTime = new Date(selected);
    slotDateTime.setHours(parseInt(hours, 10), parseInt(minutes || 0, 10), 0, 0);

    // Return true if the slot time is earlier than the current time
    return isBefore(slotDateTime, now);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        2. CHOOSE AVAILABLE TIME SLOT
      </label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {availableSlots.map((slot) => {
          const slotTime = slot.time || slot.slot;
          const slotId = slot.id || slot.slot || slotTime;
          const isBooked = slot.isBooked !== undefined ? slot.isBooked : !slot.isAvailable;
          const isSelected = selectedSlot?.id === slotId || 
                            selectedSlot?.time === slotTime || 
                            selectedSlot === slotTime || 
                            selectedSlot === slotId;

          const isPast = isSlotPast(slotTime);
          
          // Hide the slot entirely if it is in the past
          if (isPast) return null;

          return (
            <button
              key={slotId}
              type="button"
              disabled={isBooked}
              onClick={() => onSelectSlot(slot)}
              className={`
                p-3 rounded-xl border text-center transition-all
                ${isBooked 
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                  : isSelected
                    ? 'bg-primary border-primary text-white shadow-md' 
                    : 'bg-white border-gray-200 text-gray-700 hover:border-primary'
                }
              `}
            >
              <div className="font-bold">{slotTime}</div>
              <div className="text-xs mt-1">
                {isBooked ? 'BOOKED' : 'AVAILABLE'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Fallback message if all slots for today are gone */}
      {availableSlots.length > 0 && availableSlots.every((slot) => isSlotPast(slot.time || slot.slot)) && (
        <p className="text-red-500 text-sm mt-3 font-medium">
          No slots available for today. Please select tomorrow or a future date.
        </p>
      )}
    </div>
  );
};

export default TimeSlotPicker;
