import d3 from 'd3';

export class CostFunction {
  constructor() {
    this.width = null;
    this.height = null;
    this.margin = null;
    this.size = 10;
    this.xNorm = null;
    this.yNorm = null;
    this.xDeNorm = null;
    this.yDeNorm = null;
    this.xi = 0;
    this.yi = 0;
    this.minCost = 0;
    this.maxCost = 0;
    this.svg = null;
    this.prevPoint = null;
    this.xAxis = null;
    this.yAxis = null;
    this.CostCalculator = null;
  }

  init(el, AnimatedFunction, CostCalculator, width, height, margin) {
    this.CostCalculator = CostCalculator;
    this.width = width;
    this.height = height;
    this.margin = margin;

    this.initScales();
    this.initAxis();

    this.svg = d3.select(el).append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    this.xi = (this.width-2*this.margin) / this.size;
    this.yi = (this.height-2*this.margin) / this.size;

    this.prevPoint = {
      theta0: AnimatedFunction.theta0,
      theta1: AnimatedFunction.theta1
    };

    this.svg.append("text")
      .attr("y", this.margin - 10)
      .attr("x", this.margin)
      .text("Cost Function: J(theta0, theta1)");

    this.svg.append("g")
      .attr("class", "axis x")
      .attr("transform", "translate(0," + (this.height - this.margin) + ")")
      .call(this.xAxis);


    this.svg.append("g")
      .attr("class", "axis y")
      .attr("transform", "translate(" + this.margin + ",0)")
      .call(this.yAxis);
  }

  initScales() {
    this.xNorm = d3.scale.linear()
    .domain([this.margin , this.width - this.margin ])
    .range([-3, 3]);

    this.yNorm = d3.scale.linear()
    .domain([this.margin , this.height - this.margin ])
    .range([-3, 3]);

    this.xDeNorm = d3.scale.linear()
    .domain([-3, 3])
    .range([this.margin , this.width - this.margin ]);

    this.yDeNorm = d3.scale.linear()
    .domain([-3, 3])
    .range([this.margin , this.height - this.margin]);
  }

  initAxis() {
    this.xAxis = d3.svg.axis()
    .scale(this.xDeNorm)
    .orient("bottom");

    this.yAxis = d3.svg.axis()
    .scale(this.yDeNorm)
    .orient("left");
  }

  getCost(theta0, theta1, Dataset) {
    return this.CostCalculator.getCost(theta0, theta1, Dataset);
  }

  getMesh(Dataset) {
    var matrix = new Array(this.xi),
    xx = 0;
    this.minCost = 999;
    this.maxCost = -999;
    for(var x = this.margin ; x < this.width - this.margin; x += this.size) {
      matrix[xx] = new Array(this.yi);
      var yy = 0;
      for(var y = this.margin; y < this.height - this.margin ; y += this.size) {
        var theta0 = this.xNorm(x),
        theta1 = this.yNorm(y);

        matrix[xx][yy] = this.getCost(theta0, theta1, Dataset);
        this.minCost = Math.min(this.minCost, matrix[xx][yy]);
        this.maxCost = Math.max(this.maxCost, matrix[xx][yy]);
        yy++;
      }
      xx++;
    }

    return matrix;
  }

  animatePointer(Dataset, AnimatedFunction) {
    if(Dataset.length == 0) {
      return;
    }

    var x1 = (this.xDeNorm(this.prevPoint.theta0)),
    y1 = (this.yDeNorm(this.prevPoint.theta1)),
    x2 = (this.xDeNorm(AnimatedFunction.theta0)),
    y2 = (this.yDeNorm(AnimatedFunction.theta1));

    var dist = Math.pow(x1-x2,2) + Math.pow(y1-y2,2);

    if(dist < 1) {
      return;
    }

    var point = this.svg.selectAll("point").data([{
      theta0: AnimatedFunction.theta0,
      theta1: AnimatedFunction.theta1
    }]);

    var g = point.enter().append("g");
    g.append("circle")
      .attr("cx", Math.round(x2))
      .attr("cy", Math.round(y2))
      .attr("r", "1.4")
      .attr("fill", "blue");

    g.append("line")
      .attr("stroke", "red")
      .attr("x1", Math.round(x1))
      .attr("y1", Math.round(y1))
      .attr("x2", function(d){return Math.round(x2);})
      .attr("y2", function(d){return Math.round(y2);});

    this.prevPoint = {
      theta0: AnimatedFunction.theta0,
      theta1: AnimatedFunction.theta1
    };
  }

  draw(svg2, Dataset) {
    if(Dataset.length == 0) {
      return;
    }

    var svg = this.svg;

    var costFunc = this.svg.selectAll("g.costfunction");
    if(costFunc.size() == 0) {
      costFunc = svg.append("g").attr("class","costfunction");
    }

    costFunc.selectAll("rect").remove();

    var colScale = d3.scale.linear()
    .domain([this.minCost, this.maxCost])
    .range([255, 0]);

    var mesh = this.getMesh(Dataset);
    for(var x = 0  ; x < mesh.length ; x++) {
      for(var y = 0 ; y < mesh[x].length ; y++) {
        var val = Math.round(colScale(mesh[x][y]));
        var col = val % 60;
        if(val == 255) {
          var rgb = "rgb(255,255,255)";
        }
        else if(col < 20 ) {
          val -= 20;

          var rgb = "rgb("+val+","+val+","+val+")";
        }
        else if(col < 40) {
          val -= 50;

          var rgb = "rgb("+val+","+val+","+val+")";
        }
        else {
          val -= 100;

          var rgb = "rgb("+val+","+val+","+val+")";
        }

        costFunc.append("rect")
        .attr("x", this.margin + x * this.size)
        .attr("y", this.margin + y * this.size)
        .attr("width", this.size)
        .attr("height", this.size)
        .attr("fill", rgb);
      }
    }
  }

  destroy() {
    this.svg.remove();
  }
}