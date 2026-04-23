// data/reminders.js
// Default service reminder schedule rows.
// months: 0=Jan … 11=Dec
// color: 'green' (routine) | 'warn' (full service) | 'red' (major)

const defaultReminders = [
  {
    init: 'Every 5,000–7,000 mi (or 6 months)',
    obj: 'Oil change, filter replacement, tire rotation, and brake inspection.',
    color: 'green',
    months: [1],
  },
  {
    init: 'Every 10,000–12,000 mi (or 1 year)',
    obj: 'Full service, including thorough inspection of belts, hoses, and cabin air filters.',
    color: 'warn',
    months: [1],
  },
  {
    init: 'Every 30,000–60,000 mi',
    obj: 'Brake fluid, transmission fluid, and coolant should be checked regularly.',
    color: 'red',
    months: [3],
  },
  {
    init: 'Every 90,000 mi',
    obj: 'Timing belt, water pump, and differential fluid.',
    color: 'red',
    months: [8],
  },
];
