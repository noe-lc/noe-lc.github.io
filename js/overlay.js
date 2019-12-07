const createOverlay = function() {
  class Overlay extends window.google.maps.OverlayView {
    constructor(svgContainer,boundCoordinates,bounds,parsedGeoJson){ // data = { zone, comments }
      super(boundCoordinates,parsedGeoJson);
      const { north, south, east, west } = boundCoordinates;
      this._boundCoordinates = boundCoordinates;
      this._bounds = bounds;
      this._data = parsedGeoJson;
      this._container = svgContainer;
      this._pathGenerator = d3.geoPath()
        .projection(d3.geoMercator());
      // Optionally stop clicks, etc., from bubbling up to the map.
      //window.google.maps.OverlayView.preventMapHitsAndGesturesFrom(this.symbol);
    }
    // the following three methods MUST be implemented: onAdd, onRemove & draw
    onAdd(){
      const g = this._container.append("g");
      g.selectAll("path").data(this._data.features)
        .enter().append("path")
          .attr("class","hex");
      
      const panes = this.getPanes();
      panes.overlayLayer.appendChild(this._container.node());
    }
  
    onRemove(){ // called when overlay is removed from the map
      this._container.node().removeChild(this._container.select("g").node());
    }
  
    draw(){ //Called each frame when the popup needs to draw itself
      const overlayProjection = this.getProjection(),
        pathProjection = this._pathGenerator.projection(),
        sw = overlayProjection.fromLatLngToDivPixel(this._bounds.getSouthWest()),
        ne = overlayProjection.fromLatLngToDivPixel(this._bounds.getNorthEast()),
        prevWidth = parseFloat(this._container.style("width")),
        prevHeight = parseFloat(this._container.style("height")),
        width = ne.x - sw.x,
        height = sw.y - ne.y;

      this._pathGenerator.projection(pathProjection.fitSize([width,height],this._data));

      this._container
        .style("width",`${width}px`)
        .style("height",`${height}px`)
        .style("left",sw.x + "px")
        .style("top",ne.y + "px");
      
      if(width.toFixed() != prevWidth.toFixed() && height.toFixed() != prevHeight.toFixed()){
        const widthFactor = Math.abs((prevWidth - width) / width) * 100;
        const heightFactor = Math.abs((prevHeight - height) / height) * 100;
        console.log('widthFactor :', widthFactor);
        console.log('heightFactor :', heightFactor);
        this._container
          .style("display","block");
        //this._container.select("g")
        //  .attr("transform",`scale(${widthFactor} ${heightFactor})`)
        this._container.select("g").selectAll("path")
          .attr("d",this._pathGenerator);
        
      }

      if(!this._container.select("g").select("path").attr("d")){
        this._container.select("g").selectAll("path")
          .attr("d",this._pathGenerator);
      }
      
    }
  }
  return Overlay;
}

