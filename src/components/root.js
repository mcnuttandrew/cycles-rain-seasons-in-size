import React from 'react';
import {connect} from 'react-redux';
import * as actionCreators from '../actions';

import Uploader from './upload';
import Calendar from './calendar';
import MyCAl from '../../my-cal.json';

class RootComponent extends React.Component {
  componentDidMount() {
    this.props.recieveCalendar(MyCAl);
    //
  }

  render() {
    const {
      advanceMonth,
      currentMonth,
      currentMonthLayout,
      loaded,
      recieveCalendar,
      selectedDay,
      setSelectedDay,
      setDisplayMode
    } = this.props;
    console.log(currentMonthLayout)
    return (
      <div >
        <h1>ENTER THE HOUSE OF THE WIGGLY BOYS</h1>
        <Uploader recieveCalendar={recieveCalendar}/>
        <div>
          <h3>{currentMonth.format('MMMM YYYY')}</h3>
          <button onClick={() => advanceMonth(-1)}>prev month</button>
          <button onClick={() => advanceMonth(1)}>next month</button>
        </div>
        <div>
          <h3>Choose Display Mode</h3>
          {['table-cartogram', 'psuedocartogram', 'grid'].map(displayMode => {
            return (<button
              key={displayMode}
              onClick={() => setDisplayMode(displayMode)}>{displayMode}</button>);
          })}
        </div>
        <div className="flex">
          {loaded && <Calendar
            setSelectedDay={setSelectedDay}
            currentMonth={currentMonth}
            currentMonthLayout={currentMonthLayout} />}
          {selectedDay && <div>
            <h3>{selectedDay.day.format('MMM DD YYYY')}</h3>
            {selectedDay.events.map((d, idx) => {
              return <div key={idx}>{`${d.baseEvent.SUMMARY}-${d.start.format('MMM DD YYYY')}`}</div>;
            })}
          </div>}
        </div>
      </div>
    );
  }
}

function mapStateToProps({base}) {
  return {
    currentMonth: base.get('currentMonth'),
    currentMonthLayout: base.get('currentMonthLayout'),
    selectedDay: base.get('selectedDay'),
    loaded: base.get('loaded')
  };
}

export default connect(mapStateToProps, actionCreators)(RootComponent);
