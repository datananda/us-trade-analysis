function makeTimelineStatic(timeSvg) {

	var lineFunction = d3.svg.line()
	  .x(function(d) { return d.x; })
	  .y(function(d) {return d.y; })
	  .interpolate("linear-closed");

	var numTicks = 52;
	var months = ["Jan","Apr","July","Oct","Jan","Apr","July","Oct","Jan","Apr","July","Oct","Jan","Apr","July","Oct","Jan","Apr"];

	// years rectangle
	timeSvg.append("rect")
		.attr("x", 30)
		.attr("y", 0)
		.attr("width", 1320)
		.attr("height", 18)
		.style("fill", "#8C837D");

	// years labels
	for (i=0; i < 4; i++) {
		timeSvg.append("text")
			.attr("class","yearsLabels")
			.attr("x", 162 + i * 300)
			.attr("y", 14)
			.text(function() {
				return 2010 + i;
			})
			.style("fill","white");

	// white lines to separate years
		timeSvg.append("rect")
			.attr("x", 327 + i * 300)
			.attr("y", 0)
			.attr("width", 1)
			.attr("height", 20)
			.style("fill", "white");
	};

	// tick marks
	for (i=0; i < 53; i++) {
		timeSvg.append("rect")
			.attr("class","ticks")
			.attr("x", 40 + i * 25)
			.attr("y", 16)
			.attr("width",1)
			.attr("height",7)
			.style("fill","#999999");
	};

	// month labels
	months.forEach(function(d, i) {
		timeSvg.append("text")
			.attr("class","monthLabels")
			.attr("x", 30 + i * 75)
			.attr("y", 37)
			.text(d)
			.style("fill","#666666");
	});
}

function drawTimeline(timeSvg, relImp, relExp) {
	var midVal = 20;
	var topVal = 40;

	var allVals = d3.merge([relImp, relExp]);

	// scale for Y axis
	var yScale = d3.scale.linear()
		.domain(d3.extent(allVals))
		.range([170,70]);

	var zeroline = yScale(0);
	var midline = yScale(midVal);
	var topline = yScale(topVal);

	// lines for axes
	line1 = [{"x": 30, "y": midline}, {"x": 1350, "y": midline}];
	line2 = [{"x": 30, "y": zeroline}, {"x": 1350, "y": zeroline}];
	line3 = [{"x": 30, "y": topline}, {"x": 1350, "y": topline}];

	timeSvg.append("path")
		.attr("d", lineFunction(line1))
		.attr("class","timeline")
		.attr("stroke","black")
		.attr("fill","none")
		.attr("stroke-width","0.25")
		.attr("stroke-dasharray","4,8");

	timeSvg.append("path")
		.attr("class","timeline")
		.attr("d", lineFunction(line2))
		.attr("stroke","black")
		.attr("fill","none")
		.attr("stroke-width","0.25");

	timeSvg.append("path")
		.attr("class","timeline")
		.attr("d", lineFunction(line3))
		.attr("stroke","black")
		.attr("fill","none")
		.attr("stroke-width","0.25")
		.attr("stroke-dasharray","4,8");

	// labels for axes
	timeSvg.append("text")
		.attr("class","timeline")
		.attr("x", 30)
		.attr("y", 63)
		.text("relative percent change for total exports and imports")
		.style("font-size", "12px");

	timeSvg.append("text")
		.attr("class","timeline")
		.attr("x", 23)
		.attr("y", function() {
			return topline + 3;
		})
		.text(function() {
			return "+" + topVal;
		})
		.style("text-anchor","end")
		.style("text-align", "right")
		.style("font-size", "12px");

	timeSvg.append("text")
		.attr("class","timeline")
		.attr("x", 23)
		.attr("y", function() {
			return zeroline + 3;
		})
		.text("0")
		.style("text-anchor","end")
		.style("text-align", "right")
		.style("font-size", "12px");

	timeSvg.append("text")
		.attr("class","timeline")
		.attr("x", 23)
		.attr("y", function() {
			return midline + 3;
		})
		.text(function() {
			return "+" + midVal;
		})
		.style("text-anchor","end")
		.style("text-align", "right")
		.style("font-size", "12px");

	// scale for X axis
	var xScale = d3.scale.linear()
		.domain([0,relImp.length])
		.range([40,1265])

	var line = d3.svg.line()
		.x(function(d, i) {
			return xScale(i);
		})
		.y(function(d) {
			return yScale(d);
		})

	timeSvg.append("path")
		.attr("class","timeline")
		.attr("d", line(relImp))
		.style("fill", "none")
		.style("stroke", impColor)

	timeSvg.append("path")
		.attr("class","timeline")
		.attr("d", line(relExp))
		.style("fill", "none")
		.style("stroke", expColor)
}

function timelineDots(timeSvg, relImp, relExp, month) {

	var allVals = d3.merge([relImp, relExp]);

	// scale for Y axis
	var yScale = d3.scale.linear()
		.domain(d3.extent(allVals))
		.range([170,70]);

	// scale for X axis
	var xScale = d3.scale.linear()
		.domain([0,relImp.length])
		.range([40,1265])

	timeSvg.append("circle")
		.attr("class","timeline")
		.attr("cx", xScale(month))
		.attr("cy", yScale(relImp[month]))
		.attr("r", 4)
		.style("fill", impColor)
		.attr("id","timelineImpDot")

	timeSvg.append("circle")
		.attr("class","timeline")
		.attr("cx", xScale(month))
		.attr("cy", yScale(relExp[month]))
		.attr("r", 4)
		.style("fill", expColor)
		.attr("id","timelineExpDot")

	timeSvg.append("text")
		.attr("class","timeline")
		.attr("x", xScale(month) + 3)
		.attr("y", function() {
			if (yScale(relImp[month]) > yScale(relExp[month])) {
				return yScale(relImp[month]) + 18;
			}
			else {
				return yScale(relImp[month]) - 10;
			}
		})
		.text(function() {
			return relImp[month].toFixed(1) + "%";
		})
		.style("font-size","12px")
		.attr("fill", impColor)
		.style("text-anchor", "middle")
		.attr("id","timelineImpTxt")

	timeSvg.append("text")
		.attr("class","timeline")
		.attr("x", xScale(month) + 3)
		.attr("y", function() {
			if (yScale(relImp[month]) > yScale(relExp[month])) {
				return yScale(relExp[month]) - 10;
			}
			else {
				return yScale(relExp[month]) + 18;
			}
		})
		.text(function() {
			return relExp[month].toFixed(1) + "%";
		})
		.style("font-size","12px")
		.attr("fill", expColor)
		.style("text-anchor", "middle")
		.attr("id","timelineExpTxt")
}

function updateTimelineDots(timeSvg, relImp, relExp, month) {

	var allVals = d3.merge([relImp, relExp]);

	// scale for Y axis
	var yScale = d3.scale.linear()
		.domain(d3.extent(allVals))
		.range([170,70]);

	// scale for X axis
	var xScale = d3.scale.linear()
		.domain([0,relImp.length])
		.range([40,1265]);

	d3.select("#timelineImpDot")
		.transition()
		.duration(500)
		.attr("cx", xScale(month))
		.attr("cy", yScale(relImp[month]));

	d3.selectAll("#timelineExpDot")
		.transition()
		.duration(500)
		.attr("cx", xScale(month))
		.attr("cy", yScale(relExp[month]));	

	d3.selectAll("#timelineImpTxt")
		.transition()
		.duration(500)
		.attr("x", xScale(month) + 3)
		.attr("y", function() {
			if (yScale(relImp[month]) > yScale(relExp[month])) {
				return yScale(relImp[month]) + 18;
			}
			else {
				return yScale(relImp[month]) - 10;
			}
		})
		.text(function() {
			return relImp[month].toFixed(1) + "%";
		})

	d3.selectAll("#timelineExpTxt")
		.transition()
		.duration(500)
		.attr("x", xScale(month) + 3)
		.attr("y", function() {
			if (yScale(relImp[month]) > yScale(relExp[month])) {
				return yScale(relExp[month]) - 10;
			}
			else {
				return yScale(relExp[month]) + 18;
			}
		})
		.text(function() {
			return relExp[month].toFixed(1) + "%";
		})
}