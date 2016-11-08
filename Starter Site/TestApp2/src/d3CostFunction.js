var d3 = require('d3');

var Settings = require('./Settings.js');

var CostFunction = {
  width: 600,
  height: 600,
  size: 10,
  xNorm: null,
  yNorm: null,
  xDeNorm: null,
  yDeNorm: null,
  xi: 0,
  yi: 0,
  minCost: 0,
  maxCost: 0,
  svg: null,
  prevPoint: null,
  xAxis: null,
  yAxis: null,

  init: function(el, AnimatedFunction) {
    this.initScales();
    this.initAxis();

    this.svg = d3.select(el).append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    this.xi = (this.width-2*Settings.margin) / this.size;
    this.yi = (this.height-2*Settings.margin) / this.size;

    this.prevPoint = {
      theta0: AnimatedFunction.theta0,
      theta1: AnimatedFunction.theta1
    };

    this.svg.append("text")
      .attr("y", Settings.margin - 10)
      .attr("x", Settings.margin)
      .text("Cost Function: J(theta0, theta1)");

    this.svg.append("g")
      .attr("class", "axis x")
      .attr("transform", "translate(0," + (this.height - Settings.margin) + ")")
      .call(this.xAxis);


    this.svg.append("g")
      .attr("class", "axis y")
      .attr("transform", "translate(" + Settings.margin + ",0)")
      .call(this.yAxis);
  },

  initScales: function() {
    this.xNorm = d3.scale.linear()
    .domain([Settings.margin , this.width - Settings.margin ])
    .range([-3, 3]);

    this.yNorm = d3.scale.linear()
    .domain([Settings.margin , this.height - Settings.margin ])
    .range([-3, 3]);

    this.xDeNorm = d3.scale.linear()
    .domain([-3, 3])
    .range([Settings.margin , this.width - Settings.margin ]);

    this.yDeNorm = d3.scale.linear()
    .domain([-3, 3])
    .range([Settings.margin , this.height - Settings.margin]);
  },

  initAxis: function() {
    this.xAxis = d3.svg.axis()
    .scale(this.xDeNorm)
    .orient("bottom");

    this.yAxis = d3.svg.axis()
    .scale(this.yDeNorm)
    .orient("left");
  },


  getCost: function(theta0, theta1, Dataset) {
    var cost = 0;
    for(var i = 0 ; i < Dataset.length ;i++) {
      cost += Math.pow((Dataset[i].x * theta1 + theta0 - Dataset[i].y), 2);
    }

    return cost / 2 / Dataset.length;
  },

  getMesh: function(Dataset) {
    var matrix = new Array(this.xi),
    xx = 0;
    this.minCost = 999;
    this.maxCost = -999;
    for(var x = Settings.margin ; x < this.width - Settings.margin; x += this.size) {
      matrix[xx] = new Array(this.yi);
      var yy = 0;
      for(var y = Settings.margin; y < this.height - Settings.margin ; y += this.size) {
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
  },

  animatePointer: function(Dataset, AnimatedFunction) {
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
  },

  draw: function(svg2, Dataset) {
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
        .attr("x", Settings.margin + x * this.size)
        .attr("y", Settings.margin + y * this.size)
        .attr("width", this.size)
        .attr("height", this.size)
        .attr("fill", rgb);
      }
    }
  }
};

module.exports = CostFunction;