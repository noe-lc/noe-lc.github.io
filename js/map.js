const pathGenerator = d3.geoPath()
  .projection(d3.geoMercator());


function addLayer() {
  d3.json('./data/manhattan_geometries_simplified.geojson').then((data) => {
    const svg = d3.select('svg#map');
    const g = svg.append('g');

    console.log(parseInt(svg.style('width')),
    parseInt(svg.style('height')))

    pathGenerator.projection(pathGenerator.projection().fitSize([
      parseInt(svg.style('width')),
      parseInt(svg.style('height'))
    ],data));

    g.selectAll('path').data(data.features)
      .enter().append('path')
        .attr('class','polygon')
        .attr('d',pathGenerator);

    g.call(d3.zoom().on('zoom',() => zoom(g)));
    
  });
};

const zoom = (selection) => {
  console.log('d3.event.transform :', d3.event.transform);
  selection.attr('transform',d3.event.transform);
}