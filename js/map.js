const pathGenerator = d3.geoPath()
  .projection(d3.geoMercator());


function addLayer() {
  d3.json('./data/manhattan_geometries_sim2.geojson').then((data) => {
    let fitHeight;
    const field = 'parent_safegraph_place_id';

    const nestedFeatures = d3.nest()
      .key(d => d.properties[field])
      .entries(data.features);
    
    const isolated = nestedFeatures
      .filter(d => d.key === 'null' || d.values.length == 1)
      .map(d => d.values)
      .flat();
    const grouped = nestedFeatures
      .filter(d => d.key !== 'null' && d.values.length > 1); 
    const groupedParentIds = grouped.map(d => d.key);

    const svg = d3.select('svg#map');
    const g = svg.append('g');
    const pathProjection = pathGenerator.projection();
    
    pathGenerator.projection(pathProjection.fitWidth(1200,data));

    g.selectAll('path').data(data.features)
      .enter().append('path')
        .attr('class','polygon')
        .attr('d',pathGenerator);

    fitHeight = g.node().getBBox().height;
    svg.style('height',Math.ceil(fitHeight));


    // select "duplicates"
    g.selectAll('path.polygon')
      .filter(d => groupedParentIds.includes(d.properties[field]))
      .style('fill','#CCC');

    g.call(d3.zoom().on('zoom',() => zoom(g)));
    
  });
};

const zoom = (selection) => {
  console.log('d3.event.transform :', d3.event.transform);
  selection.attr('transform',d3.event.transform);
}