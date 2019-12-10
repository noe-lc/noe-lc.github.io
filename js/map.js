const pathGenerator = d3.geoPath()
  .projection(d3.geoMercator());


function addLayer() {
  d3.json('./data/manhattan.json').then((data) => {
    let fitHeight, polygons;
    let alwaysOpen, allOthers, noOpenHours;
    const collection = topojson.feature(data,data.objects.manhattan);
    const svg = d3.select('svg#map');
    const g = svg.append('g');
    const pathProjection = pathGenerator.projection();
    const openingColor = d3.color('rgb(249, 249, 134)');
    const interpolator = d3.piecewise(d3.interpolateRgb.gamma(1), [openingColor, 'orange', 'purple'])

    const scaleGenerator = () => {

    };

    collection.features.forEach(f => {
      const { open_hours } = f.properties;
      if(!open_hours) return;
      for (const key in open_hours) {
        f.properties.open_hours[key] = open_hours[key][0] || [];
      }
    })
    
    pathGenerator.projection(pathProjection.fitWidth(1100,collection));

    g.selectAll('path').data(collection.features)
      .enter().append('path')
        .attr('class','polygon')
        .attr('d',pathGenerator);

    fitHeight = g.node().getBBox().height;
    svg.style('height',Math.ceil(fitHeight));

    polygons = g.selectAll('path.polygon');

    alwaysOpen = polygons.filter(d => {
      const { open_hours } = d.properties;
      if(!open_hours) {
        return false;
      }
      return Object.values(open_hours)
        .every((v) => v.length != 0 && v[0] == '0:00' && v[1] == '24:00');
    });
    
    noOpenHours = polygons.filter(d => !d.properties.open_hours);

    const idsToDiscard = [
      ...alwaysOpen.data().map(f => f.properties.fid),
      ...noOpenHours.data().map(f => f.properties.fid)
    ];

    alwaysOpen.style('fill','#ff7e56');
    noOpenHours.style('fill','#bababa');

    allOthers = polygons.filter(d => !idsToDiscard.includes(d.properties.fid));

    //polygons
    //  .style('fill','#CCC')
    //  .transition()
    //    .delay(3000)
    //    .duration(2000)
    //    .style('fill',d => `rgb(${randomRgb()},${randomRgb()},${randomRgb()})`);

    //g.call(d3.zoom().on('zoom',() => zoom(g)));
    
  });
};

const zoom = (selection) => {
  console.log('d3.event.transform :', d3.event.transform);
  selection.attr('transform',d3.event.transform);
};

const randomRgb = () => Math.floor(Math.random() * 255);