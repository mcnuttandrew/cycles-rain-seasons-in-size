import {rrulestr} from 'rrule'
import moment from 'moment';

export function parseCalendarsJSON(cal) {
  return cal.VCALENDAR.map(parseCalendarJSON);
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

function parseCalendarJSON(cal) {
  const {VEVENT} = cal;
  const parsedEvents = VEVENT.reduce((acc, baseEvent) => {
    const EXDATEfield = Object.keys(baseEvent).find(key => key.startsWith('EXDATE'));
    if (EXDATEfield) {
      const isArray = !(typeof baseEvent[EXDATEfield] === 'string');
      return acc.concat((isArray ? baseEvent[EXDATEfield] : [baseEvent[EXDATEfield]]).map(d => ({
        baseEvent,
        start: moment(d),
        end: moment(d),
        summary: baseEvent.SUMMARY
      })));
    }

    // if (baseEvent.RRULE) {
    //   console.log(rrulestr(baseEvent.RRULE))
    // }
    const newEvents = [{
      baseEvent,
      start: moment(baseEvent.DTSTART || baseEvent['DTSTART;VALUE=DATE'], 'YYYYMMDD'),
      end: moment(baseEvent.DTEND || baseEvent['DTEND;VALUE=DATE'], 'YYYYMMDD'),
      summary: baseEvent.SUMMARY
    }];
    return acc.concat(newEvents);
  }, []);

  const earliestTime = parsedEvents.reduce((acc, row) => {
    return acc.start.diff(row.start) > 0 ? row : acc;
  }, {summary: 'XX', start: moment()});
  const latestTime = parsedEvents.reduce((acc, row) => {
    return acc.start.diff(row.start) < 0 ? row : acc;
  }, earliestTime);
  const earliestYear = earliestTime.start.year();
  const latestYear = latestTime.end.year();

  const daysOfEvents = parsedEvents.reduce((acc, row) => {
    const id = row.start.format('MMMM-DD-YYYY');
    if (!acc[id]) {
      acc[id] = [];
    }
    acc[id].push(row);
    return acc;
  }, {});

  const monthsOfWeek = [...new Array(latestYear - earliestYear + 1)].reduce((acc, row, idx) =>
    acc.concat(buildYear(daysOfEvents, earliestYear + idx)), []);
  return monthsOfWeek;
}

function buildYear(daysOfEvents, currentYear) {
  return MONTH_NAMES.reduce((mem, month, jdx) => {
    const firstOfMonth = moment(`${month} ${currentYear}`, 'MMMM YYYY');
    const startOfMonth = firstOfMonth.clone().add(-firstOfMonth.day(), 'day');

    const nextMonth = startOfMonth.clone().add(1, 'month');
    const startOfMonthWeek = startOfMonth.weeks();
    const nextMonthWeek = nextMonth.weeks();
    const diff = nextMonthWeek - startOfMonthWeek;
    // this calc might be wrong
    const numWeeksInMonth = diff === -47 ? 5 : (diff === -48 ? 4 : diff);
    // ughhhhhhhh this plus two is wrong, i hate time
    const weeks = [...new Array(numWeeksInMonth + 1)].map((_, kdx) => {
      const week = startOfMonth.clone().add(kdx, 'week');
      const id = `${week.year()}-${week.weeks()}`;
      const days = [...new Array(7)].map((__, dayOfWeek) => {
        const day = week.clone().add(dayOfWeek, 'day');
        return {
          day,
          events: daysOfEvents[day.format('MMMM-DD-YYYY')] || []
        };
      });
      return {
        id,
        week,
        days
      };
    });

    return mem.concat({month, year: currentYear, weeks});
  }, []);
}

export function classnames(classObject) {
  return Object.keys(classObject).filter(name => classObject[name]).join(' ');
}

export function geoCenter(points) {
  const sum = points.reduce((center, row) => {
    return {x: center.x + row.x, y: center.y + row.y};
  }, {x: 0, y: 0});
  const centerPoint = {x: sum.x / points.length, y: sum.y / points.length};
  return centerPoint;
  // this technique is cool but produces not that good results
  // return pointInPolygon(centerPoint, points) ? centerPoint : diagCenter(points);
}

// Make sure lines are splited correctly
// http://stackoverflow.com/questions/1155678/javascript-string-newline-character
const NEW_LINE = /\r\n|\n|\r/;
const COLON = ':';
// const COMMA = ",";
// const DQUOTE = "\'';
// const SEMICOLON = ";";
const SPACE = ' ';
