const buildEasyAction = type => payload => dispatch => dispatch({type, payload});
export const advanceMonth = buildEasyAction('advance-month');
export const recieveCalendar = buildEasyAction('recieve-calendar');
export const setDisplayMode = buildEasyAction('set-display-mode');
export const setSelectedDay = buildEasyAction('set-selected-day');
