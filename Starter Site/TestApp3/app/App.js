/* @flow */

import React from 'react';
import Chart from './Chart.js';
import {SimpleCostCalculator} from './SimpleCostCalculator.js';

export default class App extends React.Component {
  render() {
    return (
      <div>
        <Chart
          costCalculator={new SimpleCostCalculator()}
          width={600}
          height={600}
          margin={50}
        />
      </div>
    );
  }
}
