var myFilter;

var margin = {top: 40, right: 20, bottom: 30, left: 20},
    width = 1635 - margin.left - margin.right,
    barHeight = 20,
    barWidth = width * .8;

var i = 0,
    duration = 400,
    root;

var tree = d3.layout.tree()
    .nodeSize([0, 20]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var treeSvg = d3.select("#advanced_options").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height",5000)
    .style("margin-top","-20px")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tree_header = treeSvg.append("text")
  .attr("class", "tree_header")
  .attr("transform", "translate(" + 0 + "," + -20 + ")")
  .attr("style", "font-size: 18px; font-weight: bold; font-family: Rockwell;")
  .text(function() {
    return "Filtering by: All Codes";
  });

d3.json("./static/hscodes_with_sections.json", function(error, flare) {
  root = flare;
  root.x0 = 0;
  root.y0 = 0;

  // start with all collapsed
  toggleAll(root)

  update(root);

  d3.select("#total").style("fill","red");
});

function update(source) {

  // Compute the flattened node list
  var nodes = tree.nodes(root);

  var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

  treeSvg.transition()
      .duration(duration)
      .attr("height", height);

  d3.select(self.frameElement).transition()
      .duration(duration)
      .style("height", height + "px");

  // Compute the "layout".
  nodes.forEach(function(n, i) {
    n.x = i * barHeight;
  });

  // Update the nodes…
  var node = treeSvg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .style("opacity", 1e-6);

  // Enter any new nodes at the parent's previous position.
  nodeEnter.append("text")
      .attr("class","nodeText")
      .attr("id", function(d) {
        return d.code;
      })
      .attr("dy", 3.5)
      .attr("dx", function(d) {
        return d._children ? 20 : d.children ? 20 : 6
      })
      .text(function(d) { return d.name; })
      .on("click", function(d) {
        var filteredCommodity = d3.select(this)[0][0].id;
        if (filteredCommodity == "total") {
          commodity = "total";
        }
        else if (filteredCommodity.length == 4) {
          var level00 = filteredCommodity.substring(0,2);
          var section = sectionLookup[level00];
          commodity = "children." + section + ".children." + level00 + ".children." + filteredCommodity;
        }
        else if (filteredCommodity.length == 2) {
          var level00 = filteredCommodity;
          var section = sectionLookup[filteredCommodity];
          commodity = "children." + section + ".children." + level00 + ".total";
        }
        else {
          commodity = "children." + filteredCommodity + ".total";          
        }
        d3.selectAll(".nodeText").style("fill","black");
        d3.select(this).style("fill","red");

        // update text
        var new_text = "Filtering by: " + d3.select(this)[0][0].textContent;
        d3.selectAll(".tree_header").remove()

        var tree_header = treeSvg.append("text")
          .attr("class", "tree_header")
          .attr("transform", "translate(" + 0 + "," + -20 + ")")
          .attr("style", "font-size: 18px; font-weight: bold; font-family: Rockwell;")
          .text(function() {
            return new_text;
          });

        // change timeline to show only filtered commodity totals
        calculateRelativePercentage();
        d3.selectAll(".timeline").remove();
        drawTimeline(timeSvg, totalRelChangeImp, totalRelChangeExp);
        timelineDots(timeSvg, totalRelChangeImp, totalRelChangeExp, month);
        redraw(500);
      });

  nodeEnter.append("text")
    .attr("class","expand")
    .attr("dy", 5.5)
    .attr("dx", 4)
    .style("font-family","fontawesome")
    .style("font-size","14px")
    .text(function(d) {
        return d._children ? "\uf196" : d.children ? "\uf196" : ""
    })
    .on("click", function(d) { 
      if (d3.select(this).attr("class") == "expand") {
        toggle(d);
        d3.select(this).text(function(d) { return '\uf147' })
        d3.select(this).attr("class","contract") 
      }
      else {
        toggleAll(d);
        d3.select(this).text(function(d) { return '\uf196' })
        d3.select(this).attr("class","expand")        
      } 
      update(d);
    });

  // Transition nodes to their new position.
  nodeEnter.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1);

  node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1)
    .select("rect")

  // Transition exiting nodes to the parent's new position.
  node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .style("opacity", 1e-6)
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function toggle(d) {  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
}

function toggleAll(d) {
  if (d.children) {
    d.children.forEach(toggleAll);
    toggle(d);
  }
}