/* @flow */

import type {Point} from '../../shared/types';
import type {Iteration} from './MnistStream';

import {MnistStream} from './MnistStream';
import {NeuralNetwork} from './NeuralNetwork';
import {Matrix} from './Matrix';
import React from 'react';
import ReactDOM from 'react-dom';
import {Graphs} from './Graphs';
import {Matrices} from './Matrices';

const STATUS = {
  running: 1,
  finished: 2,
  none: 3,
};

type State = {
  nodes: string,
  iterations: Array<Iteration>,
  status: number,
  stream: ?MnistStream,
};

export class Mnist extends React.Component {
  state: State;

  constructor(props: any) {
    super(props);
    this.state = {
      nodes: '',
      iterations: [],
      status: STATUS.none,
      stream: null,
    };
    (this: any).handleRun = this.handleRun.bind(this);
  }

  closeStream(): void {
    if (this.state.stream != null) {
      this.state.stream.close();
    }
  }

  componentWillUnmount(): void {
    this.closeStream();
  }

  handleRun(): void {
    const nodes = this.state.nodes.split(/\s+/).join(' ');
    if (nodes.length === 0) {
      return;
    }
    this.closeStream();
    const stream = new MnistStream(nodes);
    stream.onFinished(() => this.closeStream());
    this.setState(
      {iterations: [], status: STATUS.running, stream},
      () => stream.run(),
    );
  }

  render(): React.Element<any> {
    return (
      <div style={{marginLeft: 10}}>
        <div className="row">
          <div className="col-lg-3">
            <div className="input-group input-group-sm">
              <input
                type="text"
                className="form-control"
                value={this.state.nodes}
                placeholder={'Nodes in hidden layers, e.g. 5 2'}
                onChange={event => this.setState({nodes: event.target.value})}
              />
            </div>
          </div>
          <div className="col-lg-1" />
          <div className="col-lg-2">
            <div className="btn-group btn-group-sm" role="group">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={this.handleRun}>
                Start stream
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => this.closeStream()}>
                Close stream
              </button>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-4">
            <Graphs stream={this.state.stream} />
          </div>
          <div className="col-lg-8">
            <Matrices stream={this.state.stream} />
          </div>
        </div>
      </div>
    );
  }
}