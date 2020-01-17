const pathGenerator = d3.geoPath()
  .projection(d3.geoMercator()/*.angle(29)*/);

function initializeMap() {
  d3.json('./data/manhattan.json').then(async data => {
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
      dayNameMap = {
        Mon: 'Monday',
        Tue: 'Tuesday',
        Wed: 'Wednesday',
        Thu: 'Thursday',
        Fri: 'Friday',
        Sat: 'Saturday',
        Sun: 'Sunday'
      };

    const dayScale = d3.scaleLinear()
      .domain([0,86400]) // seconds in 24hrs
      .rangeRound([0,10000]) //ms
    
    const getOpenHoursInSeconds = (open,close) => {
      [close,open] = [close,open].map(t => {
        let index = t.indexOf(m,':'),
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

    const controller = d3.select('div#controller');
    controller.selectAll('p').data(Object.entries(dayNameMap)).enter()
      .append('p')
      .attr('class','day-selector')
      .text(d => d[1])
      .on('click',d => dayTransition(d[0]));

    const showLegend = controller.append('div')
      .attr('class','legend')
      .on('click',() => { 
        let display = d3.select('div#legend').style('display');
        display = display == 'none' ? 'block' : 'none';
        d3.select('div#legend').style('display',display);
      });
    showLegend.append('img')
      .attr('class','legend-icon')
      .attr('src','imgs/legend.png');
    showLegend.append('span')
      .text('Show legend');
      
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

    const legend = d3.select('div#controller').append('div')
      .attr('id','legend');
    const ramp = legend.append('div')
      .attr('class','ramp-container');
    ramp.append('img')
      .attr('src','imgs/color-ramp.png');
    ramp.append('h6')
      .attr('class','indicator')
      .style('top','-3px')
      .text('-Closed');
    ramp.append('h6')
      .attr('class','indicator')
      .style('top','245px')
      .text('-Just opened');
    
    const classes = legend.selectAll('.class').data(
      [{ color: '#61b864', text: 'Open 24/7' },{ color: '#cccccc', text: 'No Data' }]
    )
      .enter().append('div')
        .attr('class','class-row');
    classes.append('div')
      .attr('class','patch')
      .style('background-color',d => d.color);
    classes.append('h6')
      .attr('class','description')
      .text(d => d.text);
    
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
    allOthers.filter(d => d.properties['Mon'].open != '0')
      .style('fill','purple');

    function dayTransition(day) {
      allOthers.filter(d => d.properties[day].open == '0')
        .style('fill',openingColor);
      allOthers.filter(d => d.properties[day].open != '0')
        .style('fill','purple');

      allOthers.transition()
        .style('fill','black')
        .delay(d => dayScale(d.properties[day].open))
        .duration(d => dayScale(d.properties[day].close - d.properties[day].open))
        .styleTween('fill',() => interpolator)
        .style('stroke','white');
    };
        
  });
};