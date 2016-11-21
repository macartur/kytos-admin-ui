/////////////////////////////////////////////////////////
////////////////// Kytos Radar Builder //////////////////
/////////////////////// Based on ////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Written by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
/////////// Inspired by the code of alangrafu ///////////
/////////////////////////////////////////////////////////

function getMaxSpeed(ifaces) {
  var maxValue = 0;
  for (var i in ifaces) {
    if (ifaces[i].speed > maxValue) {
      maxValue = ifaces[i].speed;
    }
  }
  return maxValue;
}

function RadarChart() {
  var Chart = (function(){
    var api = {};

    var data, container_id, container_size, chart_size, margin, positioner,
        maxValue = 100, speedScale, allAxis, total, radius, angleSlice, rScale,
        axisGrid, axis, radarLine,
        cfg = {
         // Width of the circle
         w: null,
         // Height of the circle
         h: null,
         // The margins of the SVG
         margin: {top: null, right: null, bottom: null, left: null},
         // How many levels or inner circles should there be drawn
         levels: 4,
         // What is the value that the biggest circle will represent
         maxValue: maxValue,
         // How much farther than the radius of the outer circle should the labels be placed
         labelFactor: 1.15,
         // The number of pixels after which a label needs to be given a new line
         wrapWidth: 60,
         // The opacity of the area of the blob
         opacityArea: 0.30,
         // The size of the colored circles of each blog
         dotRadius: 3,
         // The opacity of the circles of each blob
         opacityCircles: 0.1,
         // The width of the stroke around each blob
         strokeWidth: 2,
         // If true the area and stroke will follow a round path (cardinal-closed)
         roundStrokes: true,
         color: d3.scaleOrdinal().range(["#549e9f","#b54872"])
        },
        interfaceColor = d3.scaleLinear()
                           .domain([0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100])
                           .range(["#2d2d35", "#41414d","#616173","#77778c","#8d8da6","#a2a2bf","#adadcc","#c3c3e6","#d9d9ff"]);
                           //.range(["#2c7bb6", "#00a6ca","#00ccbc","#90eb9d","#ffff8c","#f9d057","#f29e2e","#e76818","#d7191c"]);

    function init(id, chart_data) {
      // 252 is the min height of a switch_card
      var _h = Math.max($("#" + id).parent().height(), 252*0.8),
          _w = $("#" + id).parent().width();

      container_id = id;
      data = chart_data;

      // data related variables
      speedScale = 7.0 / Math.pow(getMaxSpeed(data[0]),0.5);
      allAxis = (data[0].map(function(i, j) { return i } ));
      total = allAxis.length;
      angleSlice = Math.PI * 2 / total;

      // size related variables; to be updated on resize
      container_size = _w && _w > 0 ? Math.min(_w, _h) : _h;
      chart_size = container_size * 0.75;
      margin = container_size * 0.125;
      cfg.w = chart_size;
      cfg.h = chart_size;
      cfg.margin.top = margin;
      cfg.margin.right = margin;
      cfg.margin.bottom = margin;
      cfg.margin.left = margin;
      radius = Math.min(chart_size/2, chart_size/2);
      rScale = d3.scaleLinear()
                  .range([0, radius])
                  .domain([0, maxValue]);

      // Initiate the radar chart SVG
      svg = d3.select('#' + id).append("svg")
              .attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
              .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
              .attr("id", "chart-radar-" + id + '-' + data.dpid);

      // Append a g element
      positioner = svg.append("g").attr("transform",
              "translate(" + container_size/2 + "," + container_size/2 + ")");

      /////////////////////////////////////////////////////////
      /////////////// Draw the Circular grid //////////////////
      /////////////////////////////////////////////////////////

      // Wrapper for the grid & axes
      axisGrid = positioner.append("g").attr("class", "axisWrapper");

      // Draw the background circles
      axisGrid.selectAll(".levels")
         .data(d3.range(1,(cfg.levels+1)).reverse())
         .enter()
        .append("circle")
        .attr("r", function(d, i){return radius/cfg.levels*d;})
        .attr("class", "grid-lines");

      // Text indicating at what % each level is
      axisGrid.selectAll(".axisLabel")
         .data(d3.range(1, (cfg.levels + 1)).reverse())
         .enter().append("text")
         .attr("class", "axisLabel")
         .attr("x", 0)
         .attr("y", function(d){return - d * radius/cfg.levels;})
         .attr("dy", "1.5em")
         .text(function(d,i) { return (100 / cfg.levels) * d});

      // Create the straight lines radiating outward from the center
      axis = axisGrid.selectAll(".axis")
        .data(allAxis)
        .enter()
        .append("g")
        .attr("class", "axis");

      // Append the lines
      axis.append("line")
        .attr("x1", function(d, i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("y1", function(d, i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
        .attr("x2", function(d, i){ return rScale(maxValue) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("y2", function(d, i){ return rScale(maxValue) * Math.sin(angleSlice*i - Math.PI/2); })
        .attr("class", "line");


      // Append the interfaces circles at each axis
      axis.append("circle")
        .attr("class", "interface")
        .attr("r", function(d,i) { return Math.pow(d.speed,0.5) * speedScale })
        .attr("cx", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("cy", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
        .style("fill", function(d,i) { return interfaceColor(d.value); });

      // The radial line function
      radarLine = d3.radialLine()
        .curve(d3.curveCardinalClosed)
        .radius(function(d) { return rScale(d.value); })
        .angle(function(d,i) {  return i*angleSlice; })

      // Create a wrapper for the blobs
      var blobWrapper = positioner.selectAll(".radarWrapper")
        .data(data)
        .enter().append("g")
        .attr("class", "radarWrapper");

      // Append the backgrounds
      blobWrapper
        .append("path")
        .attr("class", "radarArea")
        .attr("d", function(d,i) { return radarLine(d); })
        .style("fill", function(d,i) { return cfg.color(i); })
        .style("fill-opacity", cfg.opacityArea);
      /*
        .on('mouseover', function (d,i){
          //Dim all blobs
          d3.selectAll(".radarArea")
            .transition().duration(200)
            .style("fill-opacity", 0.1);
          //Bring back the hovered over blob
          d3.select(this)
            .transition().duration(200)
            .style("fill-opacity", 0.7);
        })
        .on('mouseout', function(){
          //Bring back all blobs
          d3.selectAll(".radarArea")
            .transition().duration(200)
            .style("fill-opacity", cfg.opacityArea);
        });
      */

      // Create the outlines
      blobWrapper.append("path")
        .attr("class", "radarStroke")
        .attr("d", function(d,i) { return radarLine(d); })
        .style("stroke-width", cfg.strokeWidth + "px")
        .style("stroke", function(d,i) { return cfg.color(i); })
        .style("fill", "none");
        // .style("filter" , "url(#glow)");

      // Append the circles
      blobWrapper.selectAll(".radarCircle")
        .data(function(d,i) { return d; })
        .enter().append("circle")
        .attr("class", "radarCircle")
        .attr("r", cfg.dotRadius)
        .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
        .style("fill", function(d,i,j) { return cfg.color(j); })
        .style("fill-opacity", 0.8);

      /////////////////////////////////////////////////////////
      //////// Append invisible circles for tooltip ///////////
      /////////////////////////////////////////////////////////

      /*
      // Wrapper for the invisible circles on top
      var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
        .data(data)
        .enter().append("g")
        .attr("class", "radarCircleWrapper");

      // Append a set of invisible circles on top for the mouseover pop-up
      blobCircleWrapper.selectAll(".radarInvisibleCircle")
        .data(function(d,i) { return d; })
        .enter().append("circle")
        .attr("class", "radarInvisibleCircle")
        .attr("r", cfg.dotRadius*4)
        .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
        .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function(d,i) {
          newX =  parseFloat(d3.select(this).attr('cx')) - 10;
          newY =  parseFloat(d3.select(this).attr('cy')) - 10;

          tooltip
            .attr('x', newX)
            .attr('y', newY)
            .text(d.value)
            .transition().duration(200)
            .style('opacity', 1);
        })
        .on("mouseout", function(){
          tooltip.transition().duration(200)
            .style("opacity", 0);
        });
      // Set up the small tooltip for when you hover over a circle
      var tooltip = g.append("text")
        .attr("class", "tooltip")
        .style("opacity", 0);
      */

      // render the chart
      render();
    }

    function render(){
      // 252 is the min height of a switch_card
      var _h = Math.max($("#" + container_id).parent().height(), 252*0.8),
          _w = $("#" + container_id).parent().width();

      updateDimensions(_w && _w > 0 ? Math.min(_w, _h) : _h);

      svg.attr('width', cfg.w + cfg.margin.left + cfg.margin.right);
      positioner.attr('transform',
          'translate(' + container_size/2 + ',' + container_size/2 + ')');
      //radius = Math.min(chart_size/2, chart_size/2);
      //rScale.range([0, radius]);

      //axisGrid.selectAll('circle')
          //.attr('r', function(d, i){ return radius/cfg.levels*d; });
      //// Text indicating at what % each level is
      //axisGrid.selectAll('text')
          //.attr('y', function(d){ return - d * radius/cfg.levels; });
      //// lines
      //axis.selectAll('line')
          //.attr("x1", function(d, i){
              //return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2);
          //}).attr("y1", function(d, i){
              //return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2);
          //}).attr("x2", function(d, i){
              //return rScale(maxValue) * Math.cos(angleSlice*i - Math.PI/2);
          //}).attr("y2", function(d, i){
              //return rScale(maxValue) * Math.sin(angleSlice*i - Math.PI/2);
          //});
      //// interfaces circles at each axis
      //axis.selectAll('circle')
          //.attr("r", function(d,i) {
              //return Math.pow(d.speed,0.5) * speedScale
          //}).attr("cx", function(d, i){
              //return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2);
          //}).attr("cy", function(d, i){
              //return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2);
          //});
      //// radial line function
      //radarLine.radius(function(d) { return rScale(d.value); })
          //.angle(function(d,i) {  return i*angleSlice; });
      //// blob wrapper backgrounds
      //blobWrapper
    }

    function updateDimensions(containerSize) {
      // size related variables; to be updated on resize
      container_size = containerSize;
      chart_size = container_size * 0.75;
      margin = container_size * 0.125;
      cfg.w = chart_size;
      cfg.h = chart_size;
      cfg.margin.top = margin;
      cfg.margin.right = margin;
      cfg.margin.bottom = margin;
      cfg.margin.left = margin;
    }

    api.render = render;
    api.init = init;
    return api;
  })();

  window.addEventListener('resize', Chart.render);

  return Chart;

}//RadarChart
