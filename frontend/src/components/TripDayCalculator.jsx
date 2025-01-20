// src/components/TripDayCalculator.jsx
import { useEffect } from 'react';

/**
 * Calculates the total trip days according to:
 * 1. Same Day Trip: If the start and end are the same calendar date -> 0
 * 2. Start Day:
 *    - After 12 PM -> 0.5
 *    - Before 12 PM -> 1
 * 3. End Day:
 *    - Before 12 PM -> 0.5
 *    - After 12 PM -> 1
 * 4. Full days in between -> 1 day each
 */
export const calculateTripDays = (startStr, endStr) => {
  if (!startStr || !endStr) return 0;

  // Convert string to Date
  const start = new Date(startStr);
  const end = new Date(endStr);

  // If end is before start, return 0 or handle error
  if (end < start) return 0;

  // Same calendar day check
  const startYear = start.getFullYear();
  const startMonth = start.getMonth();
  const startDay = start.getDate();

  const endYear = end.getFullYear();
  const endMonth = end.getMonth();
  const endDay = end.getDate();

  // 1) Same calendar day -> 0
  if (startYear === endYear && startMonth === endMonth && startDay === endDay) {
    return 0;
  }

  // 2) Partial day logic
  // Start day partial
  const startHours = start.getHours();
  let startDayCount = startHours >= 12 ? 0.5 : 1.0;

  // End day partial
  const endHours = end.getHours();
  let endDayCount = endHours < 12 ? 0.5 : 1.0;

  // 3) Full days in between
  const startDateOnly = new Date(startYear, startMonth, startDay);
  const endDateOnly = new Date(endYear, endMonth, endDay);
  // Time diff in ms
  const diffInMs = endDateOnly - startDateOnly;
  // Convert ms to number of days
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  // If diffInDays = 1, that means the next calendar day, so no "full day" in between
  // Full days in between is basically diffInDays - 1 (cannot go below 0)
  let fullDaysBetween = diffInDays - 1;
  if (fullDaysBetween < 0) fullDaysBetween = 0;

  const totalDays = startDayCount + endDayCount + fullDaysBetween;
  return totalDays;
};

/**
 * A reusable component that calculates the trip days
 * whenever startDateTime or endDateTime changes and
 * calls onDaysCalculated(days).
 */
const TripDayCalculator = ({
  startDateTime,
  endDateTime,
  onDaysCalculated,
}) => {
  useEffect(() => {
    if (!startDateTime || !endDateTime) {
      onDaysCalculated(0);
      return;
    }

    const days = calculateTripDays(startDateTime, endDateTime);
    onDaysCalculated(days);
  }, [startDateTime, endDateTime, onDaysCalculated]);

  return null; // No UI needed. It's purely for logic.
};

export default TripDayCalculator;
