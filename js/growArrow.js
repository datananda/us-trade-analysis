////////////////////////////////////////////////////////////////////////////////
// this function draws an arrow of imp/exp given two points and imp/exp values
////////////////////////////////////////////////////////////////////////////////

// create array of points around oval of United States

var ptsAroundUS = [
[540,200],[562,203],[580,210],[590,225],[595,240],
[595,250],[590,255],[580,260],[562,270],[540,270],
[470,240],[480,250],[490,260],[500,265],[520,270],
[520,200],[500,203],[485,207],[475,215],[470,230]
];

function growArrow(cntryObj, scale, transitionLength) {

  var offset = 0;
  var pt1 = usCenterPt;
  var pt2 = projection([cntryObj.pos[1],cntryObj.pos[0]]);
  var val;
  if (tradeFlow == "net") {
    val = netValue(cntryObj);
  }
  else {
    val = Object.byString(cntryObj, objectLookupString);
  }
  var valScaled = scale(Math.abs(val));
  var name = cntryObj.name;
  var arrowtipWidth = valScaled * 0.7;
  var arrowtipWings = valScaled / 3;

  // pt1 always USA

  // find point around US that is closest to pt2
  var closestDist = 5000;
  var closestPt = [0,0];

  ptsAroundUS.forEach(function(pt) {
    d = Math.sqrt(Math.pow((pt2[0] - pt[0]), 2) + Math.pow((pt2[1]-pt[1]), 2));
    if (d < closestDist) {
      closestDist = d;
      closestPt = pt;
    };   
  });

  pt1 = closestPt;

  // var index = ptsAroundUS.indexOf(pt1);
  // if (index > -1) {
  //   ptsAroundUS.splice(index, 1);
  // }


  // compute distance and angle between points
  d = Math.sqrt(Math.pow((pt2[0] - pt1[0]), 2) + Math.pow((pt2[1]-pt1[1]), 2))
  angle = Math.atan2(pt2[1] - pt1[1], pt2[0] - pt1[0]) * 180 / Math.PI;

  if (((tradeFlow == "import")) || ((tradeFlow == "net") && (val < 0))) {
    // get origin point to grow out of
    var origin_point = [];
    origin_point = [{"x": pt2[0], "y": pt2[1]}, 
              {"x": pt2[0], "y": pt2[1]}, 
              {"x": pt2[0], "y": pt2[1]}, 
              {"x": pt2[0], "y": pt2[1]}, 
              {"x": pt2[0], "y": pt2[1]}, 
              {"x": pt2[0], "y": pt2[1]}];

    // create temporary point that is perpendicular to pt2
    temp = [pt2[0] - d, pt2[1]];

    arrow = [{"x": temp[0] + arrowtipWidth, "y": temp[1] - valScaled / 2}, 
              {"x": temp[0] + arrowtipWidth, "y": temp[1] - valScaled / 2 - arrowtipWings}, 
              {"x": temp[0], "y": temp[1]}, 
              {"x": temp[0] + arrowtipWidth, "y": temp[1] + valScaled / 2 + arrowtipWings}, 
              {"x": temp[0] + arrowtipWidth, "y": temp[1] + valScaled / 2}, 
              {"x": pt2[0], "y": pt2[1]}];
  }
  else {
    // get origin point to grow out of
    var origin_point = [];
    origin_point = [{"x": pt1[0], "y": pt1[1]}, 
              {"x": pt1[0], "y": pt1[1]}, 
              {"x": pt1[0], "y": pt1[1]}, 
              {"x": pt1[0], "y": pt1[1]}, 
              {"x": pt1[0], "y": pt1[1]}, 
              {"x": pt1[0], "y": pt1[1]}];

    // create temporary point that is perpendicular to pt1
    temp = [pt1[0] + d, pt1[1]];

    arrow = [{"x": temp[0] - arrowtipWidth, "y": temp[1] - valScaled / 2}, 
              {"x": temp[0] - arrowtipWidth, "y": temp[1] - valScaled / 2 - arrowtipWings}, 
              {"x": temp[0], "y": temp[1]}, 
              {"x": temp[0] - arrowtipWidth, "y": temp[1] + valScaled / 2 + arrowtipWings}, 
              {"x": temp[0] - arrowtipWidth, "y": temp[1] + valScaled / 2}, 
              {"x": pt1[0] + arrowtipWidth + offset, "y": pt1[1]}];
  }

  // draw paths
  mapSvg.append("path")
    .attr("d", lineFunction(origin_point))
    .attr("class","arrow")
    .attr("opacity", 0.5)
    .attr("name", name)
    .attr("transform", "rotate(" + angle + "," + origin_point[0]["x"] + "," + origin_point[0]["y"] + ")")
    .style("fill", function() {
      if(tradeFlow == "import") {
        return impColor;
      }
      else if (tradeFlow == "export") {
        return expColor;
      }
      else {
        if(val > 0) {
          return expColor;
        }
        else {
          return impColor;
        }
      }
    })
    .transition()
    .duration(transitionLength)
    .attr("d", lineFunction(arrow));
}