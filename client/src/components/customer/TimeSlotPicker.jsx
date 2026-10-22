import React, { useEffect } from 'react';
import { isBefore, isToday, addDays, format } from 'date-fns';
import { Clock, Calendar, Check, AlertCircle } from 'lucide-react';

const PARLOUR_CLOSING_HOUR = 20; // 8:00 PM

const parseSelectedDate = (dateVal) => {
  if (!dateVal) return new Date();
  if (dateVal instanceof Date) return dateVal;
  if (typeof dateVal === 'string' && dateVal.includes('-')) {
    const [y, m, d] = dateVal.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(dateVal);
};

const TimeSlotPicker = ({
  selectedDate,
  setSelectedDate,
  availableSlots = [],
  selectedSlot,
  onSelectSlot
}) => {
  // Auto Next-Day Logic: If today is selected AND current time is past closing hour
  useEffect(() => {
    if (!setSelectedDate) return;
    const now = new Date();
    const selected = parseSelectedDate(selectedDate);

    if (isToday(selected) && now.getHours() >= PARLOUR_CLOSING_HOUR) {
      const tomorrow = addDays(now, 1);
      setSelectedDate(format(tomorrow, 'yyyy-MM-dd'));
    }
  }, [selectedDate, setSelectedDate]);

  const checkSlotStatus = (slotTimeStr, isBooked) => {
    if (!slotTimeStr) return { isPast: false, isBooked: false };
    const now = new Date();
    const selected = parseSelectedDate(selectedDate);

    // If future date, slots are never "past"
    if (!isToday(selected)) {
      return { isPast: false, isBooked: Boolean(isBooked) };
    }

    // If today, calculate if slot time is before current time
    const [time, modifier] = slotTimeStr.trim().split(' ');
    if (!time) return { isPast: false, isBooked: Boolean(isBooked) };

    let [hours, minutes] = time.split(':').map(Number);
    if (hours === 12) hours = 0;
    if (modifier === 'PM') hours += 12;

    const slotDateTime = new Date(selected);
    slotDateTime.setHours(hours, minutes || 0, 0, 0);

    return {
      isPast: isBefore(slotDateTime, now),
      isBooked: Boolean(isBooked)
    };
  };

  const selectedDateObj = parseSelectedDate(selectedDate);
  const isDateToday = isToday(selectedDateObj);

  // Check if every slot is expired for today
  const allSlotsExpiredToday =
    isDateToday &&
    availableSlots.length > 0 &&
    availableSlots.every((slot) => {
      const timeStr = slot.time || slot.slot;
      return checkSlotStatus(timeStr, slot.isBooked).isPast;
    });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-rose-500" />
          Choose Available Time Slot
        </label>
        <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
          <Check className="w-3.5 h-3.5" /> Real-time Conflict Guard Active
        </span>
      </div>

      {availableSlots.length === 0 ? (
        <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-100 text-center text-xs text-slate-500">
          No time slots found for this service.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableSlots.map((slot) => {
            const slotTime = slot.time || slot.slot;
            const slotId = slot.id || slot.slot || slotTime;
            const bookedProp = slot.isBooked !== undefined ? slot.isBooked : !slot.isAvailable;

            const { isPast, isBooked } = checkSlotStatus(slotTime, bookedProp);

            const isSelected =
              selectedSlot?.id === slotId ||
              selectedSlot?.time === slotTime ||
              selectedSlot === slotTime ||
              selectedSlot === slotId;

            // Determine button styling based on status
            let buttonClass =
              'p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 relative overflow-hidden ';

            if (isPast) {
              // Visible but shaded out (disabled)
              buttonClass +=
                'bg-slate-100/90 border-slate-200 text-slate-400 cursor-not-allowed opacity-50 line-through select-none';
            } else if (isBooked) {
              buttonClass +=
                'bg-rose-50/70 border-rose-200 text-rose-400 cursor-not-allowed opacity-75 select-none';
            } else if (isSelected) {
              buttonClass +=
                'bg-gradient-to-r from-rose-500 to-rose-600 border-rose-500 text-white shadow-md shadow-rose-200 scale-102 ring-2 ring-rose-400';
            } else {
              buttonClass +=
                'bg-white border-rose-200 text-slate-700 hover:border-rose-400 hover:bg-rose-50/40 hover:shadow-sm cursor-pointer';
            }

            return (
              <button
                key={slotId}
                type="button"
                disabled={isPast || isBooked}
                onClick={() => onSelectSlot(slot)}
                className={buttonClass}
              >
                <div className="font-bold text-sm tracking-tight">{slotTime}</div>
                <div
                  className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isPast
                      ? 'bg-slate-200 text-slate-500'
                      : isBooked
                      ? 'bg-rose-100 text-rose-600'
                      : isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {isPast ? 'EXPIRED' : isBooked ? 'BOOKED' : isSelected ? 'SELECTED' : 'AVAILABLE'}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* End of Day Fallback Notification */}
      {allSlotsExpiredToday && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>All appointments for today have concluded. Tomorrow’s schedule is open for bookings.</span>
          </div>
          {setSelectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'))}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors whitespace-nowrap self-end sm:self-auto"
            >
              Book for Tomorrow →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;
