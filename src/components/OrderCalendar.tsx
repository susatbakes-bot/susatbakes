'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isBefore,
  startOfDay,
  addDays,
} from '@/lib/dateUtils';
import { ChevronLeft, ChevronRight, Clock, AlertTriangle, CheckCircle2, Sun, Sunset, Moon } from 'lucide-react';
import { isWithin24Hours } from '@/lib/booking';


type DayStatus = 'available' | 'booked' | 'cutoff' | 'past';

type DayCapacityInfo = {
  status: DayStatus;
  count: number;
  remaining: number;
  cutoffLabel: string;
  isAvailable: boolean;
};

type OrderCalendarProps = {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
};

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning Slot', time: '9:00 AM – 12:00 PM', icon: Sun },
  { id: 'afternoon', label: 'Afternoon Slot', time: '12:00 PM – 5:00 PM', icon: Sunset },
  { id: 'evening', label: 'Evening Slot', time: '5:00 PM – 8:00 PM', icon: Moon },
];

export default function OrderCalendar({
  selectedDate,
  onSelectDate,
  selectedSlot,
  onSelectSlot,
}: OrderCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [dayInfoMap, setDayInfoMap] = useState<Record<string, DayCapacityInfo>>({});
  const [loadingDates, setLoadingDates] = useState<Set<string>>(new Set());

  const fetchCapacityForDate = useCallback(async (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    if (dayInfoMap[key] || loadingDates.has(key)) return;

    setLoadingDates((prev) => new Set(prev).add(key));
    try {
      const res = await fetch(`/api/orders?date=${key}`);
      if (res.ok) {
        const data = await res.json();
        setDayInfoMap((prev) => ({
          ...prev,
          [key]: {
            status: data.isCutoffPassed
              ? 'cutoff'
              : data.remaining === 0
              ? 'booked'
              : 'available',
            count: data.count || 0,
            remaining: data.remaining !== undefined ? data.remaining : 15,
            cutoffLabel: data.cutoffLabel || '',
            isAvailable: data.isAvailable,
          },
        }));
      }
    } catch (e) {
      console.error('Failed to fetch capacity for', key, e);
    } finally {
      setLoadingDates((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }, [dayInfoMap, loadingDates]);

  useEffect(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start, end });
    const today = startOfDay(new Date());

    daysInMonth.forEach((day) => {
      if (!isBefore(day, today)) {
        fetchCapacityForDate(day);
      }
    });
  }, [currentMonth, fetchCapacityForDate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startOffset = getDay(monthStart);
  const today = startOfDay(new Date());

  const isDateDisabled = (date: Date) => {
    if (isBefore(date, today)) return true;
    const key = format(date, 'yyyy-MM-dd');
    // Block dates less than 24 hours from now
    if (isWithin24Hours(key)) return true;
    const info = dayInfoMap[key];
    if (info) {
      if (info.status === 'booked' || info.status === 'cutoff') return true;
    }
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    onSelectDate(date);
    if (!selectedSlot) {
      onSelectSlot('afternoon');
    }
  };

  const selectedKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const currentSelectedInfo = selectedKey ? dayInfoMap[selectedKey] : null;

  return (
    <div className="bg-white rounded-3xl border border-pink-200/80 p-6 sm:p-8 shadow-sm space-y-6">
      
      <div className="flex items-center justify-between border-b border-pink-100 pb-4">
        <div>
          <h3 className="font-playfair text-xl font-bold text-[#4A2C2A]">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <p className="text-[11px] text-[#7A4C4A]">
            Pick an open bake day (Max 15 orders/day)
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#FFF5F9] p-1 rounded-2xl border border-pink-200">
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-2 rounded-xl hover:bg-white text-[#4A2C2A] transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-2 rounded-xl hover:bg-white text-[#4A2C2A] transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-[11px] font-bold uppercase tracking-wider text-[#7A4C4A] py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`pad-${i}`} className="h-10 sm:h-12" />
        ))}

        {days.map((date) => {
          const key = format(date, 'yyyy-MM-dd');
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          const isTodayDate = isSameDay(date, today);
          const isPast = isBefore(date, today);
          const info = dayInfoMap[key];
          const isFull = info && info.status === 'booked';
          const isCutoff = info && info.status === 'cutoff';
          const disabled = isPast || isFull || isCutoff || isWithin24Hours(key);

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => handleDateClick(date)}
              title={
                isPast
                  ? 'Past date'
                  : isFull
                  ? 'Sold out (15/15 capacity reached)'
                  : isCutoff
                  ? 'Order cutoff passed (closed 8 PM day before)'
                  : info
                  ? `${info.remaining} slots remaining • ${info.cutoffLabel}`
                  : 'Check date'
              }
              className={`h-11 sm:h-13 rounded-2xl flex flex-col items-center justify-center p-1 transition-all relative ${
                isSelected
                  ? 'bg-[#E6007E] text-white font-bold shadow-md scale-105 z-10'
                  : disabled
                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                  : isTodayDate
                  ? 'bg-pink-100 border border-[#E6007E] text-[#4A2C2A] hover:bg-pink-200'
                  : 'bg-[#FFF5F9] border border-pink-200/60 text-[#4A2C2A] hover:border-[#E6007E] hover:bg-white'
              }`}
            >
              <span className="text-xs sm:text-sm font-semibold">{format(date, 'd')}</span>
              {!disabled && info && (
                <span
                  className={`text-[9px] font-bold leading-none mt-0.5 ${
                    isSelected ? 'text-pink-100' : info.remaining <= 3 ? 'text-red-500' : 'text-emerald-600'
                  }`}
                >
                  {info.remaining} left
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-pink-100 text-[11px] text-[#7A4C4A]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#E6007E]" />
          <span>Selected Date</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[#FFF5F9] border border-pink-300" />
          <span>Available Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-gray-100 text-gray-400 line-through" />
          <span>Full / Cutoff Closed</span>
        </div>
      </div>

      {selectedDate && (
        <div className="bg-[#FFF5F9] border border-pink-200 p-4 sm:p-5 rounded-2xl space-y-4 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pink-200/70 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E6007E] block">
                Selected Bake Date:
              </span>
              <h4 className="font-playfair text-lg font-bold text-[#4A2C2A]">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h4>
            </div>

            {currentSelectedInfo && (
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{currentSelectedInfo.remaining} / 15 slots open</span>
                </span>
              </div>
            )}
          </div>

          {currentSelectedInfo && currentSelectedInfo.cutoffLabel && (
            <div className="flex items-center gap-2 text-xs text-[#7A4C4A] bg-white p-3 rounded-xl border border-pink-200">
              <Clock className="w-4 h-4 text-[#E6007E] shrink-0" />
              <span>
                <strong>Cutoff Notice:</strong> {currentSelectedInfo.cutoffLabel}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#4A2C2A] block">
              Choose Preferred Delivery / Pickup Slot:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {TIME_SLOTS.map((slot) => {
                const IconComponent = slot.icon;
                const active = selectedSlot === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onSelectSlot(slot.id)}
                    className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-1 ${
                      active
                        ? 'bg-white border-[#E6007E] shadow-md scale-102'
                        : 'bg-white/80 border-pink-200 hover:border-[#E6007E]/60'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 ${active ? 'text-[#E6007E]' : 'text-[#4A2C2A]'}`} />
                    <span className="text-xs font-bold text-[#4A2C2A]">{slot.label}</span>
                    <span className="text-[10px] text-[#7A4C4A]">{slot.time}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
