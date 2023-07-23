import { React, AllWidgetProps } from 'jimu-core'
import { JimuMapViewComponent, JimuMapView } from 'jimu-arcgis'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftLong, faRightLong, faArrowUp, faVolcano, faTriangleExclamation, faHouseCrack, faHurricane, faTornado, faCloudMeatball, faWater, faTemperatureFull } from '@fortawesome/free-solid-svg-icons'

import './mystyle.css';

import FeatureLayer from 'esri/layers/FeatureLayer'
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer.js";
import Graphic from "@arcgis/core/Graphic.js";
import PolygonBarrier from "@arcgis/core/rest/support/PolygonBarrier.js";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine.js";



import { Alert } from 'reactstrap'
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

const { useState, useEffect } = React

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
  ]
}

const weatherLayer = new FeatureLayer({
  url: 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/NWS_Watches_Warnings_v1/FeatureServer/6'
})
const fireLayer = new FeatureLayer({
  url: 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/USA_Wildfires_v1/FeatureServer/0'
})

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
    return "#CD6935";
  }
  else if(text.toLowerCase().includes("earthquake")) {
    return "#C500FF";
  }
  else if(text.toLowerCase().includes("hurricane")) {
    return "#0070FF";
  }
  else if(text.toLowerCase().includes("tornado")) {
    return "#FFC146";
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
  const [showWeatherLayer, setShowWeatherLayer] = useState(null)
  const [showFireLayer, setShowFireLayer] = useState(null)
  const [initial, setInitial] = useState(true)
  const [avoids, setAvoids] = useState([false,false,false,false])

  const [tempDirections, setTempDirections] = useState([]);
  const [gptResult, setGptResult] = useState(null);

  useEffect(() => {
    if(gptResult) {
      console.log(gptResult);
      gptResult.data.map((x) => {
        let symbol = {
          type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
          style: "triangle",
          color: "orange",
          size: "14px",  // pixels
        };
        let pointGraphic = new Graphic({
            symbol: symbol,
            geometry: {
              spatialReference:{latestWkid:3857, wkid:102100},
              type: "point",
              x: x[1][0],
              y: x[1][1]
            },
            attributes: {
              severity: x[2],
              hazardType: x[0]
            }
        })
        jimuMapView.view.graphics.add(pointGraphic);
      });
    }
  }, [gptResult])

  const activeViewChangeHandler = (jmv: JimuMapView) => {
    if (jmv) {
      setJimuMapView(jmv)
    }
  }

  const registerMonth= (e) => {
    e.preventDefault();
    if(mlayer) {
      if(Array.isArray(mlayer)) {
        for (const layer of mlayer) {
          jimuMapView.view.map.remove(layer);
        }
      }
      else {
        jimuMapView.view.map.remove(mlayer);
      }
    }

    if (e.target.value === "May") {
      var layerHandles = []
      for (const i of [0,1,2,6]) {
        const layer = new FeatureLayer({
          url: 'https://services8.arcgis.com/LLNIdHmmdjO2qQ5q/arcgis/rest/services/HazardRisk_MAY_WFL1/FeatureServer/' + i
        })
        jimuMapView.view.map.add(layer)
        layerHandles.push(layer)
      }
      setmLayer(layerHandles)
    }
    else if (e.target.value === "June") {
      var layerHandles = []
      for (const i of [0,1,2,6]) {
        const layer = new FeatureLayer({
          url: 'https://services8.arcgis.com/LLNIdHmmdjO2qQ5q/arcgis/rest/services/HazardRisk_JUNE_WFL1/FeatureServer/' + i
        })
        jimuMapView.view.map.add(layer)
        layerHandles.push(layer)
      }
      setmLayer(layerHandles)
    }
    else if (e.target.value === "July") {
      var layerHandles = []
      for (const i of [0,1,2,6]) {
        const layer = new FeatureLayer({
          url: 'https://services8.arcgis.com/LLNIdHmmdjO2qQ5q/arcgis/rest/services/HazardRisk_JULY_WFL1/FeatureServer/' + i
        })
        jimuMapView.view.map.add(layer)
        layerHandles.push(layer)
      }
      setmLayer(layerHandles)
    }
    else if (e.target.value === "August") {
      var layerHandles = []
      for (const i of [4,5,6,7]) {
        const layer = new FeatureLayer({
          url: 'https://services8.arcgis.com/LLNIdHmmdjO2qQ5q/arcgis/rest/services/HazardRisk_AUG_WFL1/FeatureServer/' + i
        })
        jimuMapView.view.map.add(layer)
        layerHandles.push(layer)
      }
      setmLayer(layerHandles)
    }
    else {
      alert("We recommend looking at months May-August.")
      setMonth("")
      setmLayer(null)
      return
    }
    setMonth(e.target.value);
  }

  const toggleWeatherLayer = () => {
    if (showWeatherLayer) {
      jimuMapView.view.map.remove(weatherLayer);
    }
    else {
      jimuMapView.view.map.add(weatherLayer);
    }
    setShowWeatherLayer(!showWeatherLayer);
  }

  const toggleFireLayer = () => {
    if (showFireLayer) {
      jimuMapView.view.map.remove(fireLayer);
    }
    else {
      jimuMapView.view.map.add(fireLayer);
    }
    setShowFireLayer(!showFireLayer);
  }

  async function barrierGenerate(layerViews, layer) {
    var barriersList = []
    await ["volcano", "earthquake", "tornado", "hurricane"].map(async (x,i) => {
      if(avoids[i]) {
        for(const layerView2 of layerViews) {
          const layer2 = layerView2.layer
          if (layer2.title.toLowerCase().includes(x)) {
            await jimuMapView.view.whenLayerView(layer2).then(async function(layerView){
                   await layerView.queryFeatures({
                    outFields:  ["*"],
                    returnGeometry: true,
                    //where: "DEW_POINT > 10"
                   })
                   .then(function(results) {
                     console.log(results.features.length, " features returned");
                     console.log(JSON.stringify(results.features))
                     for(const graphic of results.features) {
                        layer.polygonBarriers.add({
                          geometry: geometryEngine.simplify(graphic.geometry),
                          barrierType: "restriction",
                      })
                      barriersList.push({
                        geometry: graphic.geometry,
                        barrierType: "restriction",
                    })
                     }
                   })
                   .catch(function(error) {
                     console.log("query failed: ", error);
                   });
            })
          }
        }
      }
    })
    await new Promise(resolve => setTimeout(resolve, 1500)).then(
      () => {console.log("returning now"); }
    );
    return barriersList
  }

  const formSubmit = async (evt) => {
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
        if (layer.title === "Route") {
          alert("Please select a route first")
          return
        }

        if(avoids.find(x => x==true)) {
          var barriersList = await barrierGenerate(layerViews, layer);

          console.log(JSON.stringify(barriersList))
          const results = await layer.solve({
            //polygonBarriers: barriersList,
          });
          console.log("layer.solve returned:")
          console.log(results);
          layer.update(results);
        }
        
        for (const directionLine of layer.directionLines) {
          // console.log("leg, distance: " + directionLine.distance)
          // console.log("sptaial reference wkid: " + directionLine.geometry.spatialReference.wkid)
          // console.log(directionLine.geometry.paths)
          result.directionline.push({
            distance: directionLine.distance,
            geometry: directionLine.geometry.toJSON(),
          })
        }

  
        var directionBuffer = []
        for (const directionPoint of layer.directionPoints) {
          //console.log("direction points"+ directionPoint.displayText)
          //console.log("sptaial reference wkid: " + directionPoint.geometry.spatialReference.wkid)
          //console.log(directionPoint.geometry.paths)
          directionBuffer.push(directionPoint.displayText);
          result.directionpoint.push({
            directionPointType: directionPoint.directionPointType,
            displayText: directionPoint.displayText,
            geometry: directionPoint.geometry.toJSON()
          })
        }
        setTempDirections(directionBuffer);

        // TODO: send here. 
        console.log(JSON.stringify(result))

        const Http = new XMLHttpRequest();
        const url="http://localhost:8000/";
        Http.open("POST", url);
        Http.setRequestHeader("Content-Type", "text/plain"); // Set the Content-Type header to indicate JSON data
        Http.send(JSON.stringify(result));
        
        Http.responseType = "text";
        Http.onreadystatechange = (e) => {
          setGptResult(JSON.parse(Http.responseText))
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
      (<form className="entire-pad" onSubmit={formSubmit}>
        <head>
        <link rel="stylesheet" href="mystyle.css"></link>
        </head>
        <div>
          <p>Select Month</p>
          <select name="month" value={month} onChange={event => registerMonth(event)}>
              <option id="0" ></option>
              <option id="1" >January</option>
              <option id="2" >Febuary</option>
              <option id="3" >March</option>
              <option id="4" >April</option>
              <option id="5" >May</option>
              <option id="6" >June</option>
              <option id="7" >July</option>
              <option id="8" >August</option>
              <option id="9" >September</option>
              <option id="10" >October</option>
              <option id="11" >November</option>
              <option id="12" >December</option>
          </select>
          <p></p>
          <p>Avoid:</p>
          <p>
          <input
            type="checkbox"
            checked={avoids[0]}
            onChange={() => {var avoidsNew = avoids.slice(); avoidsNew[0] = !avoids[0]; setAvoids(avoidsNew)}}
          /> Avoid volcanos
          </p>
          <p>
          <input
            type="checkbox"
            checked={avoids[1]}
            onChange={() => {var avoidsNew = avoids.slice(); avoidsNew[1] = !avoids[1]; setAvoids(avoidsNew)}}
          /> Avoid earthquakes
          </p>
          <p>
          <input
            type="checkbox"
            checked={avoids[2]}
            onChange={() => {var avoidsNew = avoids.slice(); avoidsNew[2] = !avoids[2]; setAvoids(avoidsNew)}}
          /> Avoid tornados
          </p>
          <p>
          <input
            type="checkbox"
            checked={avoids[3]}
            onChange={() => {var avoidsNew = avoids.slice(); avoidsNew[3] = !avoids[3]; setAvoids(avoidsNew)}}
          /> Avoid hurricanes
          </p>
          <p></p>
          <button>Process Route</button>
        </div>
      </form>)
      :
      (<div className="entire-pad">
          <button onClick={() => {setInitial(true);}}>Back</button>
          <p />
          <p>
          <input
            type="checkbox"
            checked={showWeatherLayer}
            onChange={toggleWeatherLayer}
          /> Show Live Weather
          </p>
          <p>
          <input
            type="checkbox"
            checked={showFireLayer}
            onChange={toggleFireLayer}
          /> Show Current Fires
          </p>
          <tr>
            <td><img className="pie-chart" src="https://i.imgur.com/IQIZXPE.png" /></td>
            <td>
              {["earthquake", "hurricane"].map((x) => 
                <>
                <a target="_blank" href={"https://github.com/jaczhi/georiskpro/wiki/Data-Sources#" + x}>Data source(s): {x}</a><br />
                </>
              )}
            </td>
          </tr>
          <p />
          <h2>Per-leg Analysis</h2>
          {tempDirections.map((x) => 
          <>
          <div className="nav-icon">
          <tr>
            <td><h3>{determineNavIcon(x)} &nbsp;</h3></td>
            <td><h3>{x}</h3></td>
          </tr>
            
          </div>
          {Math.random() > 0.5 && (
            <>
          <p><b>{gptResult?.data?.length} hazards ahead!</b></p>
          <ul>
          {gptResult?.data?.slice().map((y) => 
          <li className="hazard-item" >
          <span style={{ color: determineWarningColor(y[0]) }}>{determineWarningIcon(y[0])}</span>{y[0]}, {y[2] > 2 ? "high" : "low"} risk 
          </li>
          )}
          </ul>
          </>
          )}

          </>
          )}
      </div>)
      }
    </div>
  )
}

export default Widget
