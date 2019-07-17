//////////////////////////////////////////
// define variables & create blank svgs
//////////////////////////////////////////

// map SVG
var mapW = 950;
var mapH = 550;

var mapSvg = d3.select("#map")
  .append("svg")
  .attr("width", mapW)
  .attr("height", mapH);

var projection = d3.geo.mercator()
  .center([0, 35])
  .scale(150)
  .rotate([120, 0]);

var usCenterPt = projection([-97, 38]);

var path = d3.geo.path()
  .projection(projection);

// bar SVG
var barW = 600;
var barH = 525;

var barSvg = d3.select("#bar_chart")
  .append("svg")
  .attr('width', barW)
  .attr('height', barH);

// timeline SVG
var timeSvg = d3.select("#timeline")
  .append("svg")
  .attr("width", 1350)
  .attr("height", 200);

// static variables
var numTop = 20;
var arrowtipScale;
var arrowRange = [10, 50];
var impColor = "#026689";
var expColor = "#F0622E";
var lineFunction = d3.svg.line()
  .x(function(d) { return d.x; })
  .y(function(d) {return d.y; })
  .interpolate("linear-closed");
var numMonths = 49;

// data variables
var trade_data;
var totalRelChangeImp = [];
var totalRelChangeExp = [];
var countryNameByID = [];

// changing variables
var tradeFlow = "net";
var month = 0;
var commodity = "total";
var objectLookupString = tradeFlow + "." + month + "." + commodity;
var topCountries;
var scale_numbers = [0,0,0,0,0];
var closestDollars;

///////////////////////////////////////////////////////////////
// function to calculate net trade of a country object
///////////////////////////////////////////////////////////////
function netValue(cntryObject) {
  if ((Object.byString(cntryObject, "export" + "." + month + "." + commodity) != 0) && (Object.byString(cntryObject, "import" + "." + month + "." + commodity) != 0)) {
    return (Object.byString(cntryObject, "export" + "." + month + "." + commodity) - Object.byString(cntryObject, "import" + "." + month + "." + commodity));  
  }
  else {
    return 0;
  }
}

///////////////////////////////////////////////////////////////
// function for changing data when trade flow buttons clicked
///////////////////////////////////////////////////////////////
function tradeFlowButton(btn) {
  var clickedButton = document.getElementById(btn);
  tradeFlow = clickedButton.id;
  if (clickedButton.className == "trade-direction") {
    var allButtons = document.getElementsByName('tradeButton');
    for (var i=0, n = allButtons.length; i < n; i++) {
      allButtons[i].className = "trade-direction";
    };
    clickedButton.className = "trade-direction-active";
  };

  redraw(500);
}

///////////////////////////////////////////////////////////////
// function to convert dollars into thousands, mills, or bills
///////////////////////////////////////////////////////////////
function makeDollars(inDollars) {
  var outDollars;

  if (inDollars > 0) {
    outDollars = "$" + (inDollars / closestDollars).toFixed(2);
  }
  else if (inDollars == 0) {
    outDollars = "$0";
  }
  else {
    outDollars = "-$" + Math.abs((inDollars / closestDollars).toFixed(2));
  }
  return outDollars;
}

////////////////////////
// slider functions
////////////////////////
d3.select("#slider").on('change', function() {
  changeSlider(500);
});

function changeSlider(tLength) {
  // change month and redraw
  month = document.getElementById("slider").value;
  redraw(tLength);
};

/////////////////////////////
// queue data
/////////////////////////////
queue()
  .defer(d3.json, './static/world-50m.json')
  .defer(d3.tsv, './static/world_country_ids.tsv')
  .defer(d3.json, './static/trade_data.json') // load trade data
  .await(makeViz);

/////////////////////////////////////
// draw visualization
/////////////////////////////////////
function makeViz(error, world, countryNameByID, td) {
  makeTimelineStatic(timeSvg);
  if (error) {
    console.log('error', error);
  }
  else {
    console.log("data loaded");
    trade_data = td;   
  }

  // draw map
  var gCountries = mapSvg.append("g");

  var countries = topojson.feature(world, world.objects.countries).features;

  gCountries.selectAll(".country")
    .data(countries)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "map_path")
    .attr("name", function(d) {
      var countryobj = countryNameByID.filter(function(obj) {
        return obj.id == d.id;
      })
      if (typeof countryobj[0] != "undefined") {
        return countryobj[0].name;
      }
      else {
        return "null";
      }
    });

  var map_header = mapSvg.append("text")
    .attr("class", "map_header")
    .attr("x", 20)
    .attr("y", 20)
    .attr("style", "font-size: 18px; font-weight: bold; font-family: Rockwell;")
    .text("Top 20 Countries for Trade Flow and Month");

  var allSections = [];
  for (var i = 1; i < 24; i++) {
    allSections.push("Section " + i.toString())
  }

  // calculate totals
  trade_data.forEach(function(cntryObj, cntryIndex) {
    // calculate total exports
    cntryObj["export"].forEach(function(expRow, expIndex) {
      var total = 0;
      var newExpRow = {"total": 0, "children": {}};
      for (key in expRow) {
        var level00 = key.toString().substring(0,2);
        var section = sectionLookup[level00];
        newExpRow["total"] += expRow[key];
        if (!(section in newExpRow["children"])) {
          newExpRow["children"][section] = {"total": 0, "children": {}};
        }
        newExpRow["children"][section]["total"] += expRow[key];
        if (!(level00 in newExpRow["children"][section]["children"])) {
          newExpRow["children"][section]["children"][level00] = {"total": 0, "children": {}};
        }
        newExpRow["children"][section]["children"][level00]["total"] += expRow[key];
        newExpRow["children"][section]["children"][level00]["children"][key] = expRow[key];        
      }
      cntryObj["export"][expIndex] = newExpRow;
    })
    // calculate total imports
    cntryObj["import"].forEach(function(impRow, impIndex) {
      var total = 0;
      var newImpRow = {"total": 0, "children": {}};
      for (key in impRow) {
        var level00 = key.toString().substring(0,2);
        var section = sectionLookup[level00];
        newImpRow["total"] += impRow[key];
        if (!(section in newImpRow["children"])) {
          newImpRow["children"][section] = {"total": 0, "children": {}};
        }
        newImpRow["children"][section]["total"] += impRow[key];
        if (!(level00 in newImpRow["children"][section]["children"])) {
          newImpRow["children"][section]["children"][level00] = {"total": 0, "children": {}};
        }
        newImpRow["children"][section]["children"][level00]["total"] += impRow[key];
        newImpRow["children"][section]["children"][level00]["children"][key] = impRow[key];        
      }
      cntryObj["import"][impIndex] = newImpRow;
    })
  });

  calculateRelativePercentage();
  drawTimeline(timeSvg, totalRelChangeImp, totalRelChangeExp);
  timelineDots(timeSvg, totalRelChangeImp, totalRelChangeExp, month);

  // sort data & slice top few
  if (tradeFlow == "net") {
    // sort based on absolute value
    trade_data.sort(function (a, b) {
      if (Math.abs(netValue(a)) < Math.abs(netValue(b)))
        return 1;
      if (Math.abs(netValue(a)) > Math.abs(netValue(b)))
        return -1;
      return 0;
    });
  }
  else {
    trade_data.sort(function (a, b) {
      if (Object.byString(a, objectLookupString) < Object.byString(b, objectLookupString))
        return 1;
      if (Object.byString(a, objectLookupString) > Object.byString(b, objectLookupString))
        return -1;
      return 0; 
    });
  }

  var topCountries = trade_data.slice(0,numTop);

  // draw arrows for top countries
  var arrowRangeTop, arrowRangeBottom;
  if (tradeFlow == "net") {
    arrowRangeTop = (Math.abs(netValue(trade_data[numTop - 1])));
    arrowRangeBottom = (Math.abs(netValue(trade_data[0])));
  }
  else {
    arrowRangeTop = Object.byString(trade_data[numTop - 1], objectLookupString)
    arrowRangeBottom = Object.byString(trade_data[0], objectLookupString)
  }
  var arrowtipScale = d3.scale.linear()
    .domain([arrowRangeTop, arrowRangeBottom])
    .range(arrowRange);

  topCountries.forEach(function(d, i) {
    growArrow(d, arrowtipScale, 2000);
  })

  // draw bar chart
  drawBarChart(barSvg, trade_data, numTop, tradeFlow, month, commodity);
}

/////////////////////////////////////
// draw visualization
/////////////////////////////////////
function redraw(tLength) {
  // new lookup string
  objectLookupString = tradeFlow + "." + month + "." + commodity;

  // clear arrows & bars
  d3.selectAll(".arrow").remove()

  // sort data & slice top few
  if (tradeFlow == "net") {
    // sort based on absolute value
    trade_data.sort(function (a, b) {
      if (Math.abs(netValue(a)) < Math.abs(netValue(b)))
        return 1;
      if (Math.abs(netValue(a)) > Math.abs(netValue(b)))
        return -1;
      return 0;
    });
  }
  else {
    trade_data.sort(function (a, b) {
      if (Object.byString(a, objectLookupString) < Object.byString(b, objectLookupString))
        return 1;
      if (Object.byString(a, objectLookupString) > Object.byString(b, objectLookupString))
        return -1;
      return 0; 
    });
  }

  var topCountries = trade_data.slice(0,numTop);

  // draw arrows for top countries
  var arrowRangeTop, arrowRangeBottom;
  if (tradeFlow == "net") {
    arrowRangeTop = (Math.abs(netValue(trade_data[numTop - 1])));
    arrowRangeBottom = (Math.abs(netValue(trade_data[0])));
  }
  else {
    arrowRangeTop = Object.byString(trade_data[numTop - 1], objectLookupString)
    arrowRangeBottom = Object.byString(trade_data[0], objectLookupString)
  }
  var arrowtipScale = d3.scale.linear()
    .domain([arrowRangeTop, arrowRangeBottom])
    .range(arrowRange);

  topCountries.forEach(function(d, i) {
    growArrow(d, arrowtipScale, tLength * 4);
  })

  transitionBarChart(trade_data, tLength);

  // draw timeline dots
  updateTimelineDots(timeSvg, totalRelChangeImp, totalRelChangeExp, month, commodity);
}

/////////////////////////////////////////////////
// function to get index of key value in array
/////////////////////////////////////////////////
function functiontofindIndexByKeyValue(arraytosearch, key, valuetosearch) {
 
  for (var i = 0; i < arraytosearch.length; i++) {
   
    if (arraytosearch[i][key] == valuetosearch) {
      return i;
    }
  }

  return null;
}

/////////////////////////////////////////////////
// function to check if array contains object
/////////////////////////////////////////////////
function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

/////////////////////////////////////////////////
// function to get object using string
/////////////////////////////////////////////////
Object.byString = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    while (a.length) {
        var n = a.shift();
        if (n in o) {
            o = o[n];
        } else {
            return 0;
        }
    }
    return o;
}

/////////////////////////////////////////////////
// create section lookup object
/////////////////////////////////////////////////
var sectionLookup = {};

for (var i = 1; i < 6; i++) {
  sectionLookup["0" + i.toString()] = "Section 1";
}
for (var i = 6; i < 15; i++) {
  if (i.toString().length == 1) {
    sectionLookup["0" + i.toString()] = "Section 2";
  }
  else {
    sectionLookup[i] = "Section 2";      
  }
}
sectionLookup[15] = "Section 3";
for (var i = 16; i < 25; i++) {
  sectionLookup[i] = "Section 4";
}
for (var i = 25; i < 28; i++) {
  sectionLookup[i] = "Section 5";
}
for (var i = 28; i < 39; i++) {
  sectionLookup[i] = "Section 6";
}
for (var i = 39; i < 41; i++) {
  sectionLookup[i] = "Section 7";
}
for (var i = 41; i < 44; i++) {
  sectionLookup[i] = "Section 8";
}
for (var i = 44; i < 47; i++) {
  sectionLookup[i] = "Section 9";
}
for (var i = 47; i < 50; i++) {
  sectionLookup[i] = "Section 10";
}
for (var i = 50; i < 64; i++) {
  sectionLookup[i] = "Section 11";
}
for (var i = 64; i < 68; i++) {
  sectionLookup[i] = "Section 12";
}
for (var i = 68; i < 71; i++) {
  sectionLookup[i] = "Section 13";
}
sectionLookup[71] = "Section 14";
for (var i = 72; i < 84; i++) {
  sectionLookup[i] = "Section 15";
}
for (var i = 84; i < 86; i++) {
  sectionLookup[i] = "Section 16";
}
for (var i = 86; i < 90; i++) {
  sectionLookup[i] = "Section 17";
}
for (var i = 90; i < 93; i++) {
  sectionLookup[i] = "Section 18";
}
sectionLookup[93] = "Section 19";
for (var i = 94; i < 97; i++) {
  sectionLookup[i] = "Section 20";
}
sectionLookup[97] = "Section 21";
sectionLookup[98] = "Section 22";
sectionLookup[99] = "Section 23";