const dayjs = require('dayjs');

const day1 = dayjs('2024-08-10'); // Replace with your first date
const day2 = dayjs('2024-08-20'); // Replace with your second date

if (dayjs('2024-08-30').isAfter('2024-08-20')) {
  console.log('day1 is after day2');
} else {
  console.log('day1 is not after day2');
}