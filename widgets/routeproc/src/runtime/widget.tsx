import { React, AllWidgetProps } from 'jimu-core'
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis'
import FeatureLayer from 'esri/layers/FeatureLayer'

const { useState } = React

const Widget = (props: AllWidgetProps<any>) => {
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>()
  const [month, setMonth] = useState("");
  const [mlayer, setmLayer] = useState(null);

  const activeViewChangeHandler = (jmv: JimuMapView) => {
    if (jmv) {
      setJimuMapView(jmv)
    }
  }

  const registerMonth= (e) => {
    e.preventDefault();
    if(mlayer) {
      jimuMapView.view.map.remove(mlayer);
    }

    if (e.target.value === "January") {
      // create a new FeatureLayer (dummy layer for now)
      const layer = new FeatureLayer({
        url: 'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads_Styled/FeatureServer/0'
      })
      // Add the layer to the map (accessed through the Experience Builder JimuMapView data source)
      jimuMapView.view.map.add(layer)
      setmLayer(layer);
      console.log("should have been added by now...")
    }
    else {
      setmLayer(null);
    }
    setMonth(e.target.value);
  }

  const formSubmit = (evt) => {
    evt.preventDefault()




    var result = {
      month: month,
      directionline:[],
      directionpoint:[],
    };
    
    
    const layerViews = jimuMapView.view.allLayerViews
    for(const layerView of layerViews) {
      const layer = layerView.layer
      console.log(layer.title + ": type " + layer.type);
      if (layer.type === "route") {
        console.log("Route found!")
        // TODO put this in a JSON and send an HTTP request.
        
        for (const directionLine of layer.directionLines) {
          // console.log("leg, distance: " + directionLine.distance)
          // console.log("sptaial reference wkid: " + directionLine.geometry.spatialReference.wkid)
          // console.log(directionLine.geometry.paths)
          result.directionline.push({
            distance: directionLine.distance,
            geometry: directionLine.geometry.toJSON(),
          })
        }

  

        for (const directionPoint of layer.directionPoints) {
          console.log("direction points"+ directionPoint.displayText)
          console.log("sptaial reference wkid: " + directionPoint.geometry.spatialReference.wkid)
          console.log(directionPoint.geometry.paths)
          result.directionpoint.push({
            directionPointType: directionPoint.directionPointType,
            displayText: directionPoint.displayText,
            geometry: directionPoint.geometry.toJSON()
          })
        }
        // TODO: send here. 
        console.log(JSON.stringify(result))
      }
    }
  }

  return (
    <div className="widget-starter jimu-widget">
      {
        props.useMapWidgetIds &&
        props.useMapWidgetIds.length === 1 && (
          <JimuMapViewComponent
            useMapWidgetId={props.useMapWidgetIds?.[0]}
            onActiveViewChange={activeViewChangeHandler}
          />
        )
      }

      <form onSubmit={formSubmit}>
        <div>
          <p>Select Month</p>
        <select name="month" value={month} onChange={event => registerMonth(event)}>
            <option id="0" ></option>
            <option id="1" >January</option>
            <option id="2" >Febuary</option>
        </select>
          <button>Process Route</button>
        </div>
      </form>
    </div>
  )
}

export default Widget
