/* @flow */

export class LinearCostController {
  getCost(theta0: number, theta1: number, Dataset: Array<any>) {
    let cost = 0;
    for(let i = 0 ; i < Dataset.length ;i++) {
      cost += Math.pow((Dataset[i].x * theta1 + theta0 - Dataset[i].y), 2);
    }

    return cost / 2 / Dataset.length;
  }

  hypothesisFunctionLabel: string = 'Hypothesis Function: Ho(x)=theta0 + theta1 * x';

  costFunctionLabel: string = 'Cost Function: J(theta0, theta1)';
};