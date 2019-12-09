const pathGenerator = d3.geoPath()
  .projection(d3.geoMercator());


function addLayer() {
  d3.json('./data/manhattan.json').then((data) => {
    let fitHeight;
    const field = 'parent_safegraph_place_id';
    const collection = topojson.feature(data,data.objects.manhattan);
    const svg = d3.select('svg#map');
    const g = svg.append('g');
    const pathProjection = pathGenerator.projection();
    
    pathGenerator.projection(pathProjection.fitWidth(1100,collection));

    g.selectAll('path').data(collection.features)
      .enter().append('path')
        .attr('class','polygon')
        .attr('d',pathGenerator);

    fitHeight = g.node().getBBox().height;
    svg.style('height',Math.ceil(fitHeight));

    g.selectAll('path')
      .style('fill','#CCC')
      .transition()
        .delay(3000)
        .duration(2000)
        .style('fill',d => `rgb(${randomRgb()},${randomRgb()},${randomRgb()})`);

    //g.call(d3.zoom().on('zoom',() => zoom(g)));
    
  });
};

const zoom = (selection) => {
  console.log('d3.event.transform :', d3.event.transform);
  selection.attr('transform',d3.event.transform);
};

const randomRgb = () => Math.floor(Math.random() * 255);