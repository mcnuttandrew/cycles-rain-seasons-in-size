import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import Immutable from 'immutable';
import moment from 'moment';
import {tableCartogram, tableCartogramAdaptive} from 'table-cartogram';

import {parseCalendarsJSON} from '../utils';

const DEFAULT_STATE = Immutable.fromJS({
  calendars: [],
  currentMonth: moment().startOf('month'),
  currentMonthLayout: [[]],
  displayMode: 'psuedocartogram',
  loaded: false,
  tcoCache: {},
  selectedDay: null
});

const convertMonthToData = month => {
  console.log(month)
  return month.weeks.map(week => {
    return week.days.map(day => {
      return {...day, value: 1 + day.events.length};
    });
  });
};

const displayModesConfigs = {
  grid: {
    accessor: d => d.value,
    layout: 'gridLayout',
    iterations: 0,
    layoutAlg: tableCartogram
  },
  psuedocartogram: {
    accessor: d => d.value,
    layout: 'psuedoCartogramLayout',
    iterations: 0,
    layoutAlg: tableCartogram
  },
  'table-cartogram': {
    accessor: d => d.value,
    layout: 'psuedoCartogramLayoutZigZag',
    targetAccuracy: 0.001,
    // maxNumberOfSteps: 2000,
    optimizationParams: {

    },
    layoutAlg: tableCartogramAdaptive
  }
};

const prepareRendering = state => {
  // figure out what specific month we will be looking at
  const displayMode = state.get('displayMode');
  const [targetMonth, targetYear] = state.get('currentMonth').format('MMMM-YYYY').split('-');
  const relevantMonth = state.get('calendars').toJS()
    .find(({month, year}) => `${year}` === targetYear && month === targetMonth);
  // check to see if we have already computed it
  const cacheCheck = state.getIn(['tcoCache', `${targetMonth}-${targetYear}`]);
  if (displayMode === 'table-cartogram' && cacheCheck) {
    return state.set('currentMonthLayout', cacheCheck);
  }
  // if we haven't seen it, or its not a table cartogram then compute
  const data = convertMonthToData(relevantMonth);
  const displayConfig = displayModesConfigs[displayMode];
  const layout = displayConfig.layoutAlg({...displayModesConfigs[displayMode], data});
  let updatedState = state;
  if (displayMode === 'table-cartogram') {
    updatedState = updatedState.setIn(['tcoCache', `${targetMonth}-${targetYear}`], layout.gons);
  }
  return updatedState
    .set('currentMonthLayout', layout.gons || layout).set('loaded', true);
};

const recieveCalendar = (state, payload) => {
  // HACK: shouldn't just grab the first calendar
  const parsedCalendars = parseCalendarsJSON(payload)[0];
  return prepareRendering(state.set('calendars', Immutable.fromJS(parsedCalendars)));
};

const advanceMonth = (state, payload) =>
  prepareRendering(state.set('currentMonth', state.get('currentMonth').clone().add(payload, 'month')));

const setDisplayMode = (state, payload) => prepareRendering(state.set('displayMode', payload));

const setSelectedDay = (state, payload) => {
  const [targetMonth, targetYear] = payload.format('MMMM-YYYY').split('-');

  const month = state.get('calendars').toJS()
    .find(d => d.month === targetMonth && `${d.year}` === targetYear);
  const day = month.weeks.reduce((acc, week) => acc.concat(week.days), []).find(d => d.day.isSame(payload));
  return state.set('selectedDay', day);
};

const actionFuncMap = {
  'advance-month': advanceMonth,
  'set-display-mode': setDisplayMode,
  'set-selected-day': setSelectedDay,
  'recieve-calendar': recieveCalendar
};
const NULL_ACTION = (state, payload) => state;

export default createStore(
  combineReducers({
    base: (state = DEFAULT_STATE, {type, payload}) => {
      return (actionFuncMap[type] || NULL_ACTION)(state, payload);
    }
  }),
  applyMiddleware(thunk),
);
