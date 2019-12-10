const pathGenerator = d3.geoPath()
  .projection(d3.geoMercator());


function addLayer() {
  d3.json('./data/manhattan.json').then((data) => {
    let fitHeight, polygons;
    let alwaysOpen, allOthers, noOpenHours;
    const collection = topojson.feature(data,data.objects.manhattan),
      svg = d3.select('svg#map'),
      g = svg.append('g'),
      pathProjection = pathGenerator.projection(),
      openingColor = d3.color('rgb(249, 249, 134)'),
      interpolator = d3.piecewise(d3.interpolateRgb.gamma(1), [openingColor, 'orange', 'purple']),
      dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    const dayScale = d3.scaleLinear()
      .domain([0,86400]) // seconds in 24hrs
      .range([0,5000]) //ms
    
    const getDiffInSeconds = (open,close) => {
      [close,open] = [close,open].map(t => {
        let index = t.indexOf(':'),
          hours = +t.slice(0,index),
          mins = +t.slice(index + 1);
        return (hours * 60 * 60) + (mins * 60);
      });
      return close - open;
    };

    collection.features.forEach(f => {
      const { open_hours } = f.properties;
      if(!open_hours) return;
      for (let key in open_hours) {
        let value = open_hours[key][0] || [];
        let [open,close] = value;
        f.properties.open_hours[key] = value || [];
        f.properties[key] = value.length == 0 ? 0 : getDiffInSeconds(open,close);
      }
    });
    
    pathGenerator.projection(pathProjection.fitWidth(1100,collection));

    g.selectAll('path').data(collection.features)
      .enter().append('path')
        .attr('class','polygon')
        .attr('d',pathGenerator);

    fitHeight = g.node().getBBox().height;
    svg.style('height',Math.ceil(fitHeight));

    polygons = g.selectAll('path.polygon');
    alwaysOpen = polygons.filter(d => d.properties.seconds_per_week == 604800);
    noOpenHours = polygons.filter(d => !d.properties.open_hours);

    const idsToDiscard = [
      ...alwaysOpen.data().map(f => f.properties.fid),
      ...noOpenHours.data().map(f => f.properties.fid)
    ];

    alwaysOpen.style('fill','#ff7e56');
    noOpenHours.style('fill','#bababa');

    allOthers = polygons.filter(d => !idsToDiscard.includes(d.properties.fid));

    console.log(Math.min(...allOthers.data().map(f => f.properties.seconds_per_week)));

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