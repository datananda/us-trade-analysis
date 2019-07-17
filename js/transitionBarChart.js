function transitionBarChart(trade_data, transitionLength) {
    ////////////////////////////////////
    // transition bar chart
    ////////////////////////////////////
    var bar_start = 125;
    var bar_end = 500;
    var header = 40;
    var spacing = 23;
    var bar_height = 15;

    // calculate scale
    var max = 0;
    trade_data.forEach(function(cntryObj) {
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

    console.log(max);

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

    console.log(closestDollars)

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

    d3.selectAll(".bar_header").remove()
    
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

    d3.selectAll(".barText")
      .data(scale_numbers)
      .transition()
      .duration(transitionLength)
      .text(function(d) {
        if (makeDollars(d).substring(0,1) == "-") {
          return makeDollars(d).substring(2);
        }
        else {
          return makeDollars(d).substring(1);        
        }
      })

    d3.selectAll(".barGroup")
      .transition()
      .duration(transitionLength)
      .style("visibility",function(d,i) {
        var new_index = functiontofindIndexByKeyValue(trade_data,"name", d.name);
        if (new_index < numTop) {
          return "visible";
        }
        else {
          return "hidden";
        }
      });

    if (transitionLength == 0) {
      d3.selectAll(".barGroup").selectAll("rect")
        .attr("y", function(d) {
          var new_index = functiontofindIndexByKeyValue(trade_data,"name", d.name);
          return new_index * spacing + bar_height + header;
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
        })
        .attr("width", function(d) {
          if (tradeFlow == "net") {
            return barscale(Math.abs(netValue(d)));
          }
          else {
            return barscale(Object.byString(d, objectLookupString));
          }    
        });

        d3.selectAll(".barGroup").selectAll(".barCntryLabels")
          .attr("y", function(d) {
            var new_index = functiontofindIndexByKeyValue(trade_data,"name", d.name);
            return new_index * spacing + bar_height + header + 11;
          });

        d3.selectAll(".barGroup").selectAll(".barCntryValues")
          .attr("x", function(d, i) {
            if (tradeFlow == "net") {
              return (bar_start + barscale(Math.abs(netValue(d))) + 5);
            }
            else {
              return (bar_start + barscale(Object.byString(d, objectLookupString)) + 5);
            }         
          })
          .text(function(d) { 
            if (tradeFlow == "net") {
              return (makeDollars(netValue(d)));
            }
            else {
              return (makeDollars(Object.byString(d, objectLookupString)));
            }
          })
          .attr("y", function(d) {
            var new_index = functiontofindIndexByKeyValue(trade_data,"name", d.name);
            return new_index * spacing + bar_height + header + 11;
          });
    }
    else {
      d3.selectAll(".barGroup").selectAll("rect")
        .transition()
        .duration(transitionLength)
        .attr("y", function(d) {
          var new_index = functiontofindIndexByKeyValue(trade_data,"name", d.name);
          return new_index * spacing + bar_height + header;
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
        })
        .transition()
        .duration(transitionLength)
        .attr("width", function(d) {
          if (tradeFlow == "net") {
            return barscale(Math.abs(netValue(d)));
          }
          else {
            return barscale(Object.byString(d, objectLookupString));
          }   
        });

      d3.selectAll(".barGroup").selectAll(".barCntryLabels")
        .transition()
        .duration(10)
        .attr("y", function(d) {
          var new_index = functiontofindIndexByKeyValue(trade_data,"name", d.name);
          return new_index * spacing + bar_height + header + 11;
        });

      d3.selectAll(".barGroup").selectAll(".barCntryValues")
        .transition()
        .duration(10)
        .attr("x", function(d, i) {
          if (tradeFlow == "net") {
            return (bar_start + barscale(Math.abs(netValue(d))) + 5);
          }
          else {
            return (bar_start + barscale(Object.byString(d, objectLookupString)) + 5);
          }
        })
        .text(function(d) { 
          if (tradeFlow == "net") {
            return (makeDollars(netValue(d)));
          }
          else {
            return (makeDollars(Object.byString(d, objectLookupString)));
          }
        })
        .attr("y", function(d) {
          var new_index = functiontofindIndexByKeyValue(trade_data,"name", d.name);
          return new_index * spacing + bar_height + header + 11;
        });
    }
}