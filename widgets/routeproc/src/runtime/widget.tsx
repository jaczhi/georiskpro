import { React, AllWidgetProps } from 'jimu-core'
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftLong, faRightLong, faArrowUp, faVolcano, faTriangleExclamation, faHouseCrack, faHurricane, faTornado, faCloudMeatball, faWater, faTemperatureFull } from '@fortawesome/free-solid-svg-icons'

import './mystyle.css';

import FeatureLayer from 'esri/layers/FeatureLayer'
import { Alert } from 'reactstrap'
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

const { useState } = React

const dummyResponse = {
  nav: [
    {name: "Turn right after the Parking Garage on N 4th St",
    hazard: [
      {type: "Storm", distance: 1500},
      {type: "Volcano", distance: 1500}
    ]},
    {name: "Merge onto US-95 N toward I-15 N",
    hazard: [
      {type: "Storm", distance: 1500},
      {type: "Volcano", distance: 1500}
    ]},
    {name: "Turn right after the Parking Garage on N 4th St",
    hazard: [
      {type: "Storm", distance: 1500},
      {type: "Volcano", distance: 1500}
    ]},
    {name: "Turn right after the Parking Garage on N 4th St",
    hazard: [
      {type: "Storm", distance: 1500},
      {type: "Volcano", distance: 1500}
    ]},
    {name: "Turn right after the Parking Garage on N 4th St",
    hazard: [
      {type: "Storm", distance: 1500},
      {type: "Volcano", distance: 1500}
    ]},
  ]
}

const determineNavIcon = (text) => {
  if(text.toLowerCase().includes("right")) {
    return (<FontAwesomeIcon icon={faRightLong} />);
  }
  else if(text.toLowerCase().includes("left")) {
    return (<FontAwesomeIcon icon={faLeftLong} />);
  }
  else {
    return (<FontAwesomeIcon icon={faArrowUp} />)
  }
}

// Volcanos, earthquakes, hurricanes, tornado, hail (flooding, temperature)
const determineWarningIcon = (text) => {
  if(text.toLowerCase().includes("volcano")) {
    return (<FontAwesomeIcon icon={faVolcano} />)
  }
  else if(text.toLowerCase().includes("earthquake")) {
    return (<FontAwesomeIcon icon={faHouseCrack} />)
  }
  else if(text.toLowerCase().includes("hurricane")) {
    return (<FontAwesomeIcon icon={faHurricane} />)
  }
  else if(text.toLowerCase().includes("tornado")) {
    return (<FontAwesomeIcon icon={faTornado} />)
  }
  else if(text.toLowerCase().includes("hail")) {
    return (<FontAwesomeIcon icon={faCloudMeatball} />)
  }
  else if(text.toLowerCase().includes("flood")) {
    return (<FontAwesomeIcon icon={faWater} />)
  }
  else if(text.toLowerCase().includes("temperature")) {
    return (<FontAwesomeIcon icon={faTemperatureFull} />)
  }
  else {
    return (<FontAwesomeIcon icon={faTriangleExclamation} />)
  }
}


const determineWarningColor = (text) => {
  if(text.toLowerCase().includes("volcano")) {
    return "#ff0026";
  }
  else if(text.toLowerCase().includes("earthquake")) {
    return "#a31c30";
  }
  else if(text.toLowerCase().includes("hurricane")) {
    return "#393440";
  }
  else if(text.toLowerCase().includes("tornado")) {
    return "#7703fc";
  }
  else if(text.toLowerCase().includes("hail")) {
    return "#03d3fc";
  }
  else if(text.toLowerCase().includes("flood")) {
    return "#3dd3eb";
  }
  else if(text.toLowerCase().includes("temperature")) {
    return "#fc7b03";
  }
  else {
    return "blue";
  }
}


const Widget = (props: AllWidgetProps<any>) => {
  const [jimuMapView, setJimuMapView] = useState<JimuMapView>()
  const [month, setMonth] = useState("");
  const [mlayer, setmLayer] = useState(null);
  const [initial, setInitial] = useState(false);

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


    if (!month) {
      alert("Please choose a month before continuing");
      return ;
    }

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

        const Http = new XMLHttpRequest();
        const url="http://localhost:8000/";
        Http.open("POST", url);
        Http.setRequestHeader("Content-Type", "text/plain"); // Set the Content-Type header to indicate JSON data
        Http.send(JSON.stringify(result));
        
        Http.responseType = "text";
        Http.onreadystatechange = (e) => {
          console.log(Http.responseText)
        }

        setInitial(false);
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
      {
        initial ? 
      (<form onSubmit={formSubmit}>
        <head>
        <link rel="stylesheet" href="mystyle.css"></link>
        </head>
        <div>
          <p>Select Month</p>
          <select name="month" value={month} onChange={event => registerMonth(event)}>
              <option id="0" ></option>
              <option id="1" >January</option>
              <option id="2" >Febuary</option>
          </select>
          <button>Process Route</button>
        </div>
      </form>)
      :
      (<div className="entire-pad">
          <button onClick={() => {setInitial(true);}}>Back</button>
          <p />
          {dummyResponse.nav.map((x) => 
          <>
          <div className="nav-icon">
          <tr>
            <td><h2>{determineNavIcon(x.name)} &nbsp;</h2></td>
            <td><h2>{x.name}</h2></td>
          </tr>
            
          </div>

             {/* <p>{determineNavIcon(x.name)}{x.name}</p> */}
            <p><b>{x.hazard.length} hazards ahead!</b></p>
            <ul>
            {x.hazard.map((y) => 
            <li className="hazard-item" >
            <span style={{ color: determineWarningColor(y.type) }}>{determineWarningIcon(y.type)}</span>{y.type} in {y.distance} meters 
            </li>
            )}
            </ul>
          </>
          )}
      </div>)
      }
    </div>
  )
}

export default Widget
