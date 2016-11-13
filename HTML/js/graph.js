

var width  = 425,
    height = 300,
    colors = d3.scale.category10();

if(window.location.host.indexOf('127.0.0.1') != -1){
            url = 'http://127.0.0.1:8887/';
        }else{
            url = 'http://www.candpgeneration.com/209HTML/'
        }

function draw(elem){


	d3.json(url+"data/"+elem+"-data.json", function(error, res) {
	        if (error){return console.warn(error);}
	        else{
	        	drawGraph(res);
	        }
	});

	function drawGraph(data){

		// Calculate all the various dimensions of nodes and layers so they can be evenly spaced out
		var node_H = 40;
		var node_W = 40;
		var padding_V = 40;
		var padding_H = 70;

		layer_dims = []
		data.map(function(el){
			layer_dims[el.layer] = layer_dims[el.layer] ?  layer_dims[el.layer]+1 : 1
		})

		MAXnodes = Math.max.apply(null, layer_dims)


		var offset = function(node_count){
			return (((MAXnodes-1)*(node_H+padding_V)+node_H) - ((node_count-1)*(node_H+padding_V) + node_H )) /2
		}

		//console.debug('offset',assert(offset(3)==0),assert(offset(1)==60),assert(offset(2)==30))
		// end dimension calculations




		var svg = d3.select('body').select("#"+elem).append("svg")
	                    .attr("width", width)
	                    .attr("height", height);




		var node = svg.selectAll("g")
	                    .data(data)
					    .enter()
					    .append('g')
					    .attr('class','node')
					    .attr("transform", "translate("+node_W+", 0)")

		node.append('g')
					.selectAll('line')
					.data(function (d) { return d.edges; })
					.enter()
					.append('line')
					.attr("x1", function (d,i){return (d.layer-1)*(node_W + padding_H) })
					.attr("y1", function (d,i){return d.source*(node_H + padding_V) + offset(layer_dims[d.layer-1]) })
					.attr("x2", function (d,i){return d.layer*(node_W + padding_H) })
					.attr("y2", function (d,i){return d.dest*(node_H + padding_V)  + offset(layer_dims[d.layer])})
					.attr("stroke-width", 1)
					.attr("stroke", "#cccccc");


		node.append('circle')
					.attr("cx", function (d,i) { return d.layer * (node_W + padding_H); })
					.attr("cy", function (d,i) { return d.node * (node_H + padding_V) + offset(layer_dims[d.layer]) ; })
					.attr("r", node_W/2)
					.style("fill", "#eeeeee")
					.on('mouseenter',function(){
						d3.select(this)
						.transition()
						.attr("r",node_W/2+5)
						.style("fill", "#ff0055")
					})
					.on('mouseleave',function(){
						d3.select(this)
						.transition()
						.attr("r",node_W/2)
						.style("fill", "#eeeeee")
					})

		node.append("foreignObject").attr("width",node_W).attr("height",node_H)	
	        .html(function(d){
	        	setTimeout(function(){
	        		MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
	        	}, 10);
	        	return d.values ? "$"+d.values+"$" : "$x$"
	        })
			.attr("x", function(d) {
			   return (d.layer * (node_W + padding_H)) - node_W/2;
			})
			.attr("y", function(d) { 
				return (d.node * (node_H + padding_V) + offset(layer_dims[d.layer]))  - node_H/2; 
			})

			
			// HIDEOUS DOM RENDER HACK TO MAKE THE MATHJAX RENDER
			$('body').css("border", "solid 1px transparent");
			    setTimeout(function(){
			        $('body').css("border", "solid 0px transparent");
			        $('.d3_graph .mjx-chtml.MathJax_CHTML').css({'left':'55px','top':'10px'})
			    }, 1000);

	}


}







