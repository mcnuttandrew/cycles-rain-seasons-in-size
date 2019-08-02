import React from 'react';

// import {interpolateReds} from 'd3-scale-chromatic';

import {
  XYPlot,
  PolygonSeries,
  LabelSeries
} from 'react-vis';

import {geoCenter} from '../utils';

const findMinObject = (data, comparator) => {
  const minPoint = data.reduce((acc, row, idx) => {
    const newMin = comparator(row);
    if (newMin > acc.min) {
      return acc;
    }
    return {
      min: newMin,
      idx
    };
  }, {min: comparator(data[0]), idx: 0});

  return data[minPoint.idx];
};

class CalendarDisplay extends React.Component {
  constructor() {
    super();
    this.state = {
      selectedDay: null
    };
  }
  render() {
    const {currentMonthLayout, setSelectedDay} = this.props;
    const {selectedDay} = this.state;
    const commonProps = {
      yDomain: [1, 0],
      margin: 60,
      width: 900,
      height: 900
    };

    return (
      <div className="relative">
        <div className="absolute noninteractive">
          <XYPlot {...{animation: {damping: 9, stiffness: 300}, ...commonProps}}>
            {currentMonthLayout.map((cell, index) => {
              return (<PolygonSeries
                key={`triangle-${index}`}
                data={cell.vertices}
                style={{
                  strokeWidth: 2,
                  stroke: 'black',
                  strokeOpacity: 1,
                  fill: selectedDay === index ? 'lightgray' : 'white'
                  // interpolateReds(
                  //   1 - Math.sqrt(1 - (cell.data.count - DATA_DOMAIN.min) / (DATA_DOMAIN.max - DATA_DOMAIN.min))
                  // )
                }}/>);
            })}
            <PolygonSeries
              style={{
                fill: 'none',
                strokeOpacity: 1,
                strokeWidth: 2,
                stroke: 'black'
              }}
              data={[{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 0}]} />
            <LabelSeries data={currentMonthLayout.map((cell, index) => {
              return ({
                ...geoCenter(cell.vertices),
                label: `${cell.data.day.date()}`,
                style: {fontWeight: 'light'}
              });
            })} />
            <LabelSeries data={currentMonthLayout.filter(({data: {events}}) => events.length).map(cell => {
              const {x, y} = geoCenter(cell.vertices);
              return ({
                x,
                y: y + 0.03,
                label: `${cell.data.events.length} events`,
                style: {fontSize: 22}
              });
            })} />
            <LabelSeries
              data={currentMonthLayout.slice(0, 7).map((cell, index) => {
                return ({
                  x: geoCenter(cell.vertices).x,
                  y: -0.01,
                  label: cell.data.day.format('ddd').toUpperCase(),
                  style: {fontSize: 18, fontWeight: 'bold'}
                });
              })} />

          </XYPlot>
        </div>
        <div className="relative">
          <XYPlot {...commonProps}>
            {currentMonthLayout.map((cell, index) => {
              return (<PolygonSeries
                key={`triangle-${index}-hover`}
                data={cell.vertices}
                onSeriesClick={() => {
                  this.setState({selectedDay: index});
                  setSelectedDay(cell.data.day);
                }}
                style={{
                  opacity: 1,
                  fill: 'red'
                }}/>);
            })}
          </XYPlot>
        </div>
      </div>
    );
  }
}

export default CalendarDisplay;
