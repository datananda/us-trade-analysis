//////////////////////////////////////////////////////////////
// this function draws the bar chart to the right of the map
//////////////////////////////////////////////////////////////

function drawBarChart(svg, data, numTop, tradeFlow, month, commodity) {
  var bar_start = 125;
  var bar_end = 500;
  var header = 40;
  var spacing = 23;
  var bar_height = 15;

  // calculate scale
  var max = 0;
  data.forEach(function(cntryObj) {
    if (tradeFlow == "net") {
      if (Math.abs(netValue(cntryObj)) > max) {
        max = Math.abs(netValue(cntryObj));
      }
    }
    else {
      if (Object.byString(cntryObj, objectLookupString) > max) {
        max = Object.byString(cntryObj, objectLookupString);
      }
    }
  });

  // decide what range to use 1000, 1000000, 1000000000
  if (max > 500000000) {
    closestDollars = 1000000000;
  }
  else if (max > 500000) {
    closestDollars = 1000000;
  }
  else {
    closestDollars = 1000;
  }

  // round max up to closest $1 , 5 , or 10 billion
  if ((max / closestDollars) < 5) {
    max = (Math.ceil(Math.ceil((max / closestDollars)) / 1) * 1) * closestDollars;
  }
  else if ((max / closestDollars) < 10) {
    max = (Math.ceil(Math.ceil((max / closestDollars)) / 5) * 5) * closestDollars;    
  }
  else {
    max = (Math.ceil(Math.ceil((max / closestDollars)) / 10) * 10) * closestDollars;        
  }

  // create scale from 0 to max
  var barscale = d3.scale.linear()
    .domain([0, max])
    .range([0,bar_end-bar_start]);

  // get steps
  var step = max / 4;
  scale_numbers = [];
  for (var i = 0; i <= max; i += step) {
    scale_numbers.push(i);
  }

  var bar_header = barSvg.append("text")
    .attr("class", "bar_header")
    .attr("x", 125)
    .attr("y", 20)
    .attr("style", "font-size: 18px; font-weight: bold; font-family: Rockwell;")
    .text(function() {
      if (closestDollars == 1000000000) {
        return "Value of Trade in Billions of US Dollars";
      }
      else if (closestDollars == 1000000) {
        return "Value of Trade in Millions of US Dollars";
      }
      else {
        return "Value of Trade in Thousands of US Dollars";        
      }
    });

  // draw axis
  var axis = svg.selectAll(".axis")
    .data(scale_numbers)
    .enter()
    .append("g")
    .attr("class","axis");

  axis.append("text")
    .attr("class","barText")
    .attr("x", function(d) {
      return bar_start + barscale(d);
    })
    .attr("y", 40)
    .text(function(d) {
      if (makeDollars(d).substring(0,1) == "-") {
        return makeDollars(d).substring(2);
      }
      else {
        return makeDollars(d).substring(1);        
      }
    })
    .attr("text-anchor","middle")
    .attr("font-size","11px");

    axis.append("line")
      .attr("class","barTick")
      .attr("x1", function(d) {
        return bar_start + barscale(d);
      })
      .attr("y1", 45)
      .attr("x2", function(d) {
        return bar_start + barscale(d);
      })
      .attr("y2", 50)
      .attr("stroke","#C4C4C4");

  var countrygroup = svg.selectAll(".barGroup")
    .data(data)
    .enter()
    .append("g")
    .attr("class","barGroup")
    .style("cursor","default")
    .style("visibility",function(d,i) {
      if (i < numTop) {
        return "visible";
      }
      else {
        return "hidden";
      }
    })
    .on('mouseover', function(d){
      var name = d3.select(this).select(".barCntryLabels").text();
      var color = d3.select(this).select("rect").style("fill");
      
      d3.selectAll(".barGroup").style("opacity","0.5");
      d3.select(this).style("opacity","1.0");
      d3.select(this).select(".barCntryValues").style("visibility","visible");
      d3.selectAll(".arrow").style("opacity","0.1");
      d3.select(".arrow[name='"+ name + "']").style("visibility","visible").style("opacity","1.0");
      d3.selectAll(".map_path").style("opacity","0.5")
      d3.selectAll(".map_path[name='"+ name + "']").style("stroke",color).style("stroke-width","1.5px").style("opacity","1.0");
    })
    .on('mouseout', function(d){
      d3.selectAll(".barGroup").style("opacity","1.0")
      d3.select(this).select(".barCntryValues").style("visibility","hidden")
      d3.selectAll(".arrow").style("opacity","0.5");
      d3.selectAll(".map_path").style("stroke","#C4C4C4").style("stroke-width","0.75px").style("opacity","1.0");
    });

  countrygroup.append("rect")
    .attr("width", function(d) {
      if (tradeFlow == "net") {
        return barscale(Math.abs(netValue(d)));
      }
      else {
        return barscale(Object.byString(d, objectLookupString));
      }
    })
    .attr("height", bar_height)
    .attr("x", bar_start)
    .attr("y", function(d, i) {
      return i * spacing + bar_height + header;
    })
    .style("fill", function(d) {
      if(tradeFlow == "import") {
        return impColor;
      }
      else if (tradeFlow == "export") {
        return expColor;
      }
      else {
        if(netValue(d) > 0) {
          return expColor;
        }
        else {
          return impColor;
        }
      }
    });

  countrygroup.append("text")
    .attr("class","barCntryLabels")
    .attr("x", bar_start - 5)
    .attr("y", function(d, i) {
      return i * spacing + bar_height + header + 11;
    })
    .text(function(d) { return d["name"]});

  countrygroup.append("text")
    .attr("class","barCntryValues")
    .attr("x", function(d, i) {
      if (tradeFlow == "net") {
        return (bar_start + barscale(Math.abs(netValue(d))) + 5);
      }
      else {
        return (bar_start + barscale(Object.byString(d, objectLookupString)) + 5);
      }
    })
    .attr("y", function(d, i) {
      return i * spacing + bar_height + header + 11;
    })
    .text(function(d) {
      if (tradeFlow == "net") {
        return (makeDollars(netValue(d)));
      }
      else {
        return (makeDollars(Object.byString(d, objectLookupString)));
      }
    })
    .style("visibility","hidden");
}