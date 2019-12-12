const pathGenerator = d3.geoPath()
  .projection(d3.geoMercator().angle(29));


function addLayer() {
  d3.json('./data/manhattan.json').then(async (data) => {
    let index = 0;
    let fitHeight, polygons;
    let alwaysOpen, allOthers, noOpenHours;
    const coastlines = await d3.json('./data/manhattan_polygon.geojson');
    const collection = topojson.feature(data,data.objects.manhattan),
      svg = d3.select('svg#map'),
      g = svg.append('g'),
      pathProjection = pathGenerator.projection(),
      openingColor = d3.color('rgb(249, 249, 134)'),
      interpolator = d3.piecewise(d3.interpolateRgb.gamma(1), [openingColor, 'orange', 'purple']),
      dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    const dayScale = d3.scaleLinear()
      .domain([0,86400]) // seconds in 24hrs
      .rangeRound([0,10000]) //ms
    
    const getOpenHoursInSeconds = (open,close) => {
      [close,open] = [close,open].map(t => {
        let index = t.indexOf(':'),
          hours = +t.slice(0,index),
          mins = +t.slice(index + 1);
        return (hours * 60 * 60) + (mins * 60);
      });
      return { open, close };
    };

    collection.features.forEach(f => {
      const { open_hours } = f.properties;
      if(!open_hours) return;
      for (let key in open_hours) {
        let value = open_hours[key][0] || [];
        let [open,close] = value;
        f.properties.open_hours[key] = value || [];
        f.properties[key] = value.length == 0 ? 
          { open: 0, close: 0 } : getOpenHoursInSeconds(open,close);
      }
    });
    
    pathGenerator.projection(pathProjection.fitWidth(document.body.clientWidth,collection));

    svg.style('background-color','#c0cdd7');

    g.selectAll('path').data(collection.features)
      .enter().append('path')
        .attr('class','polygon')
        .attr('d',pathGenerator);
    
    g.selectAll('path.coastline').data(coastlines.features)
      .enter()
      .append('path')
        .attr('class','coastline')
        .attr('d',pathGenerator)
        .lower()
        .clone()
          .attr('class','bold-coastline')
          .lower();


    fitHeight = g.node().getBBox().height;
    svg.style('height',Math.ceil(fitHeight));

    polygons = g.selectAll('path.polygon');
    alwaysOpen = polygons.filter(d => d.properties.seconds_per_week == 604800);
    noOpenHours = polygons.filter(d => !d.properties.open_hours);

    const idsToDiscard = [
      ...alwaysOpen.data().map(f => f.properties.fid),
      ...noOpenHours.data().map(f => f.properties.fid)
    ];

    allOthers = polygons.filter(d => !idsToDiscard.includes(d.properties.fid));
    
    alwaysOpen
      .style('fill','#61b864');
    noOpenHours
      .style('fill','#cccccc');

    function dayTransition(day) {
      allOthers.transition()
        .style('fill','black')
        .delay(d => dayScale(d.properties[day].open))
        .duration(d => dayScale(d.properties[day].close - d.properties[day].open))
        .styleTween('fill',() => interpolator)
        .style('stroke','white');
    };

    
    //window.dayInterval = setInterval(() => {
    //  let dayName = dayNames[index];
    //  if(!dayName){
    //    clearInterval(window.dayInterval);
    //    index = 0;
    //    return;
    //  }
    //  dayTransition(dayNames[index]);
    //  index += 1;
    //},dayScale.range()[1]);
    
    
    //function runTransition() {
    //  circles.transition()
    //    .on('start',function repeat(d) {
    //      d.index = !isNaN(d.index) ? d.index += 1 : 0;
    //      let prop = props[d.index];
    //    
    //      if(d.index > props.length - 1) {
    //        d.index = 0;
    //        return;
    //      }
    //    
    //      d3.active(this).transition()
    //        .delay(d => scale(d[prop].start))
    //        .duration(d => scale(d[prop].end) - scale(d[prop].start))
    //        .styleTween('fill',() => interpolator)
    //      .transition()
    //        .delay(d => totalTime - scale(d[prop].end ))
    //        .on('start',repeat);
    //    });
    //    
    //};
    
    
  });
};

const zoom = (selection) => {
  console.log('d3.event.transform :', d3.event.transform);
  selection.attr('transform',d3.event.transform);
};

const randomRgb = () => Math.floor(Math.random() * 255);