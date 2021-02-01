/** @jsx jsx */
import { BaseWidget, jsx, appActions } from 'jimu-core'

import Map            = require('esri/Map')
import MapView        = require('esri/views/MapView')
import FeatureLayer   = require('esri/layers/FeatureLayer')
import GraphicsLayer  = require('esri/layers/GraphicsLayer')
import GeometryEngine = require('esri/geometry/geometryEngine')
import watchUtils     = require("esri/core/watchUtils")
import LayerList      = require("esri/widgets/LayerList")
import Sketch         = require('esri/widgets/Sketch')
import Locate         = require("esri/widgets/Locate")
import Home           = require("esri/widgets/Home")

export default class Widget extends BaseWidget {
  
  constructor(props) {
    super(props)

    this.districts = []

    this.demographicsFL = new FeatureLayer({
      title: 'Tracts 2018',
      url: this.props.config.demographicsURL,
      visible: false,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          outline: {
            color: [240, 185, 5, 1],
            width: '0.5px'
          }
        }
      }
    })

    this.districtsFL = new FeatureLayer({
      title: 'District Submissions',
      url: this.props.config.editDistrictsURL,
      popupTemplate: {
        title: "{dist_name} - District {dist_id}",
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "population",
                label: "Population"
              },
              {
                fieldName: "cmp_index",
                label: "Compaction"
              },
              {
                fieldName: "div_index",
                label: "Diversity"
              },
              {
                fieldName: "comments",
                label: "Comments"
              }
            ]
          }
        ]
      },
      visible: true,
      opacity: .4,
      renderer: {
        type: 'simple',
        symbol: {
          type: "simple-fill",
          outline: {
            color: [128, 128, 128, 0.2],
            width: "0.5px"
          }
        },
        label: 'Compaction',
        visualVariables: [
          {
            type: "color",
            field: "cmp_index",
            legendOptions: {
              title: "Composite Range"
            },
            stops: [
              {
                value: 75,
                color: "#FFFCD4",
                label: "~ 75"
              },
              {
                value: 50,
                color: "#c37c4c",
                label: "~ 50"
              },
              {
                value: 25,
                color: "#350242",
                label: "~ 25"
              }
            ]
          }
        ]
      }
    })

    this.districtGL = new GraphicsLayer({
      title: 'Proposed Boundaries'
    })

    this.map = new Map({
      basemap: "dark-gray",
      layers: [this.demographicsFL, this.districtGL]
    })

    this.view   = undefined
    this.sketch = undefined

    this.valid = {
      type: "simple-fill",
      style: 'solid',
      color: [87, 87, 88, .5],
      outline: {
        color: '#323232',
        width: 2
      }
    }

    this.invalid = {
      type: "simple-fill",
      style: 'diagonal-cross',
      color: [166, 166, 166, .5],
      outline: {
        color: [166, 166, 166],
        width: 2
      }
    }

  }

  getCompaction(geometry) {

    // Return Polsby-Popper Index

    let a = GeometryEngine.geodesicArea(geometry)
    let l = GeometryEngine.geodesicLength(geometry)
    let p = ((4 * Math.PI) * (a / l ** 2)) * 100

    return Math.trunc(p)

  }

  getDemographics = async (geometry) => {

    // Return Diversity Index or Other Demographic Details w/in District Boundary
    // Currently Returning an Object Because We Expec to Return Multiple Attributes
    
    let query = this.demographicsFL.createQuery()
    query.geometry = geometry
    query.outFields = ['DIVINDX_CY', 'TOTPOP_FY']
    query.returnGeometry = false
    query.returnQueryGeometry = false

    return await this.demographicsFL.queryFeatures(query).then((resp) => {

      let DIVINDX_CY = resp.features.reduce(function(prev, curr) {
        return prev + curr.attributes.DIVINDX_CY
      }, 0)

      let TOTPOP_FY = resp.features.reduce(function(prev, curr) {
        return prev + curr.attributes.TOTPOP_FY
      }, 0)

      return {
        m_DIVINDX_CY: Math.round(DIVINDX_CY / resp.features.length),
        m_TOTPOP_FY: Math.round(TOTPOP_FY)
      }

    })

  }

  // TODO - Each Time Update Is Called, Check IF Any Districts Are Now Valid
  
  checkIntersection = (checkGraphic) => {

    var valid = true

    this.sketch.layer.graphics.forEach((g) => {

      if (g.uid != checkGraphic.uid) {
        if (GeometryEngine.intersects(g.geometry, checkGraphic.geometry)) {
          valid = false 
        }
      }
    })

    if (valid) {
      checkGraphic.symbol = this.valid
    } else {
      checkGraphic.symbol = this.invalid
    }

    return valid

  }

  onCreate = async (event) => {

    if (event.state === "complete") {

      event.graphic.symbol = this.valid

      let valid = this.checkIntersection(event.graphic)

      let baseData = {
        uid: event.graphic.uid,
        valid: valid,
        compaction: this.getCompaction(event.graphic.geometry),
        geometry: event.graphic.geometry.rings
      }

      let demographicData = await this.getDemographics(event.graphic.geometry)

      this.districts.push({
        ...baseData, ...demographicData
      })

      this.props.dispatch(
        appActions.widgetStatePropChange('pftp', 'districts', this.districts)
      )

    }

  }

  onUpdate = async (event) => {

    var valid = this.checkIntersection(event.graphics[0])

    if (event.state === "complete") {

      let g = event.graphics[0]
      let c = this.getCompaction(g.geometry)
      let d = await this.getDemographics(g.geometry)
      let v = valid

      this.districts.forEach((ed) => {
        if (ed.uid == g.uid) {
          ed.compaction = c,
          ed.m_DIVINDX_CY = d.m_DIVINDX_CY,
          ed.m_TOTPOP_FY = d.m_TOTPOP_FY,
          ed.valid = v
          ed.geometry = g.geometry.rings
        } 
      })

      this.props.dispatch(
        appActions.widgetStatePropChange('pftp', 'districts', this.districts)
      )

    }

  }

  onDelete = (event) => {

    event.graphics.forEach((de) => {
      this.districts.forEach((ed, idx) => {
        if (de.uid == ed.uid) {
          this.districts.splice(idx, 1)
        }
      })
    })

    this.props.dispatch(
      appActions.widgetStatePropChange('pftp', 'districts', this.districts)
    )

  }

  componentDidUpdate(prevProps) {

    this.districtsFL.refresh()

    if (this.props.submission === true) {

      this.map.add(this.districtsFL, this.map.layers.length + 1)
      this.map.remove(this.districtGL)

      this.districts = []
      this.districtGL.removeAll()
      this.props.dispatch(
        appActions.widgetStatePropChange('pftp', 'districts', this.districts)
      )

      this.view.ui.remove(this.sketch)

    } else {

      this.map.add(this.districtGL)
      this.view.ui.add(this.sketch, 'top-right')

    }

    // Receive Filter Expression from DistrictView Component within pftp-stats Widget
    if (this.props.districtWhere) {
        this.districtsFL.definitionExpression = this.props.districtWhere
    }
     
  }

  handleViewChange = () => {

    if (this.view.center && this.view.extent) {
      this.props.dispatch(
        appActions.widgetStatePropChange('pftp', 'mapView', {
          x:      this.view.center.x, 
          y:      this.view.center.y,
          wkid:   this.view.center.spatialReference.wkid,
          zoom:   this.view.zoom,
          extent: this.view.extent.toJSON()
        })
      )
    }

  }

  mapClick = (evt) => {

    this.view.hitTest(evt.screenPoint)
    .then((r) => {

      let names = r.results.map(x => x.graphic.sourceLayer.title)

      if (names.length > 0 && !names.includes('District Submissions')) {
        this.sketch.complete()
      }
    })

  }

  componentDidMount() {

    this.view = new MapView({
      container: "edit-map",
      map: this.map,
      zoom: 12,
      center: [-119, 36],
      popup: {
        dockEnabled: true,
        dockOptions: {
          buttonEnabled: false,
          position: 'bottom-right',
          breakpoint: false
        }
      }
    })

    watchUtils.whenTrue(this.view, 'stationary', this.handleViewChange)

    this.sketch = new Sketch({
      id: 'sketch',
      layer: this.districtGL,
      view: this.view,
      creationMode: "update",
      availableCreateTools: ['polygon'],
      layout: 'vertical'
    })
    this.sketch.on('create', this.onCreate)
    this.sketch.on('update', this.onUpdate)
    this.sketch.on('delete', this.onDelete)

    const layerList = new LayerList({
      view: this.view
    })

    let homeButton = new Home({view: this.view})
    let locateWidget = new Locate({view: this.view})

    this.view.ui.add(homeButton, 'top-left')
    this.view.ui.add(locateWidget, 'top-left')
    this.view.ui.add(layerList, {position: "top-right"})
    this.view.ui.add(this.sketch, 'top-right')

    this.view.on('click', this.mapClick)

  }
  
  render() {
    return (
      <div id="edit-map" style={{height: '100%'}}></div>
    )
  }

}

Widget.mapExtraStateProps = (state) => {

  if (state.widgetsState.pftp) {

    return {
      submission: state.widgetsState.pftp.submission,
      uniqueFilter: state.widgetsState.pftp.uniqueFilter,
      districtWhere : state.widgetsState.pftp.districtWhere
    }

  }

}
