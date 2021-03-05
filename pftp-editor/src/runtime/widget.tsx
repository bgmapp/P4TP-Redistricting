/** @jsx jsx */
import { BaseWidget, jsx, appActions } from 'jimu-core';

import Map            = require('esri/Map');
import MapView        = require('esri/views/MapView');
import FeatureLayer   = require('esri/layers/FeatureLayer');
import GraphicsLayer  = require('esri/layers/GraphicsLayer');
import Extent         = require('esri/geometry/Extent');
import GeometryEngine = require('esri/geometry/geometryEngine');
import watchUtils     = require("esri/core/watchUtils");
import LayerList      = require("esri/widgets/LayerList");
import Sketch         = require('esri/widgets/Sketch');
import Locate         = require("esri/widgets/Locate");
import Home           = require("esri/widgets/Home");
import Legend         = require("esri/widgets/Legend");


export default class Widget extends BaseWidget {
  
  constructor(props) {
    super(props);

    this.districts = [];
    this.extent    = undefined;
    this.sketch    = undefined;
    this.view      = undefined;

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
    });

    this.districtsFL = new FeatureLayer({
      title: 'Previous Submissions',
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
      visible: false,
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
              title: "Compaction Range"
            },
            stops: [
              {
                value: 25,
                color: "#FFFCD4",
                label: "~ 25"
              },
              {
                value: 50,
                color: "#c37c4c",
                label: "~ 50"
              },
              {
                value: 75,
                color: "#350242",
                label: "~ 75"
              }
            ]
          }
        ]
      }
    });

    this.districtGL = new GraphicsLayer({
      title: 'Your Response',
    });

    this.stateContacts = new FeatureLayer({
      url: this.props.config.stateContactsURL,
      visible: false,
      title: 'State Contacts',
      renderer: {
        type: "simple", 
        symbol: {
          type: "simple-marker",
          size: 15,
          color: "white"
        }
      },
      labelingInfo: [{
        labelExpressionInfo: {
          expression: "$feature.your_name + ' @ ' + $feature.your_organization"
        },
        labelPlacement: "above-center",
        symbol: {
          type: "text",
          font: {
            size: 11,
            family: "Noto Sans"
          },
          horizontalAlignment: "left",
          color: "white"
        }
      }]
    });

    this.districtFL = new FeatureLayer({
      title: 'Proposed Boundaries',
      source: this.districtGL,
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
    });

    this.map = new Map({
      basemap: "dark-gray-vector",
      layers: [
        this.demographicsFL, 
        this.stateContacts,
        this.districtsFL, 
        this.districtGL
      ]
    });

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

    // Return Polsby-Popper Index for Input Geometry

    let a = GeometryEngine.geodesicArea(geometry)
    let l = GeometryEngine.geodesicLength(geometry)
    let p = ((4 * Math.PI) * (a / l ** 2)) * 100

    return Math.trunc(p)

  }

  getDemographics = async (geometry) => {

    // Return Diversity Index & Total Population Within Input Geometry
    // TODO - Attribute (i.e. Field) Names Should Come from Configuration File
    
    let query = this.demographicsFL.createQuery()
    query.geometry = geometry
    query.outFields = ['DIVINDX_CY', 'TOTPOP_CY']
    query.returnGeometry = false
    query.returnQueryGeometry = false

    return await this.demographicsFL.queryFeatures(query).then((resp) => {

      let diversity = resp.features.reduce(function(prev, curr) {
        return prev + curr.attributes.DIVINDX_CY
      }, 0)

      let population = resp.features.reduce(function(prev, curr) {
        return prev + curr.attributes.TOTPOP_CY
      }, 0)

      return {
        diversity: Math.round(diversity / resp.features.length),
        population: Math.round(population)
      }

    })

  }

  getUniqueNames = (extent) => {

    let query = this.districtsFL.createQuery()
    query.returnDistinctValues = true
    query.returnGeometry = false
    query.geometry = new Extent(extent.toJSON())
    query.outFields = ['dist_name']

    this.districtsFL.queryFeatures(query).then((resp) => {

        let uniqueNames =  resp.features.map(f => f.attributes.dist_name);

        this.props.dispatch(
          appActions.widgetStatePropChange('pftp', 'uniqueNames', uniqueNames)
        );

    }).catch((err) => console.log(err));

  }
  
  checkIntersection = (checkGraphic) => {

    // Return true/false If Graphic Intersects Any Other Boundaries

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

  checkActiveGraphic = () => {

    // Push the "Active" Boundary to the DistrictEdit Component of the pftp-stats Widget

    if (this.sketch.updateGraphics.length > 0) {
      this.props.dispatch(
        appActions.widgetStatePropChange('pftp', 'activeUID', this.sketch.updateGraphics.items[0].uid)
      )
    } else {
      this.props.dispatch(
        appActions.widgetStatePropChange('pftp', 'activeUID', -1)
      )
    }

  }

  onCreate = async (event) => {

    if (event.state === "complete") {

      event.graphic.symbol = this.valid

      let valid = this.checkIntersection(event.graphic)

      let baseData = {
        uid: event.graphic.uid,
        valid: valid,
        compaction: this.getCompaction(event.graphic.geometry),
        geometry: event.graphic.geometry.rings  // TODO - Just Pass Geometry & Update DistrictEdit
      }

      let demographicData = await this.getDemographics(event.graphic.geometry)

      this.districts.push({
        ...baseData, ...demographicData
      })

      this.props.dispatch(
        appActions.widgetStatePropChange('pftp', 'districts', this.districts)
      )

      this.checkActiveGraphic()
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
          ed.diversity = d.diversity,
          ed.population = d.population,
          ed.valid = v
          ed.geometry = g.geometry.rings
        } 
      })

      this.props.dispatch(
        appActions.widgetStatePropChange('pftp', 'districts', this.districts)
      )

      this.checkActiveGraphic()

    }

    this.checkActiveGraphic()

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

    this.districtsFL.refresh();

    if (this.props.submission === true) {

      this.map.remove(this.districtGL);

      this.districts = [];
      this.districtGL.removeAll();
      this.props.dispatch(
        appActions.widgetStatePropChange('pftp', 'districts', this.districts)
      );

      this.view.ui.remove(this.sketch);

    } else {

      this.map.add(this.districtGL);
      this.view.ui.add(this.sketch, 'top-right');

    }

    // Receive Filter Expression from DistrictView Component within pftp-stats Widget
    if (this.props.districtWhere) {
        this.districtsFL.definitionExpression = this.props.districtWhere;
    } else {
      this.districtsFL.definitionExpression = '1=1';
    }

    this.districtsFL.refresh();
     
  }

  getContacts = () => {

    console.log(this.props.config.stateContactsURL)

    let query = this.stateContacts.createQuery();
    query.geometry = new Extent(this.view.extent.toJSON());
    query.returnGeometry = false;
    query.outFields = [
      'your_name', 
      'your_organization',
      'your_phone_number', 
      'your_email_address'
    ];

    this.stateContacts.queryFeatures(query).then((resp) => {

        let contacts = resp.features.map(f => f.attributes);

        this.props.dispatch(
          appActions.widgetStatePropChange('pftp', 'contacts', contacts)
        );

    }).catch((err) => console.log(err));

}

  handleViewChange = () => {

    if (this.view.center && this.view.extent) {

      this.getUniqueNames(this.view.extent);

      this.getContacts();

      // if (this.view.center && this.view.extent) {
      //   this.props.dispatch(
      //     appActions.widgetStatePropChange('pftp', 'mapView', {
      //       x:      this.view.center.x, 
      //       y:      this.view.center.y,
      //       wkid:   this.view.center.spatialReference.wkid,
      //       zoom:   this.view.zoom,
      //       extent: this.view.extent.toJSON()
      //     })
      //   )
      // }
      
    }

  }

  validateDistrictGeometries = () => {

    // Ensure Any Potentially Valid Districts Are Updated

    this.sketch.layer.graphics.forEach((g) => {

      this.districts.forEach((dg) => {
        if (dg.uid == g.uid) {
          dg.valid = this.checkIntersection(g);
        }
      })
    })

    this.props.dispatch(
      appActions.widgetStatePropChange('pftp', 'districts', this.districts)
    )

  }

  mapClick = (evt) => {

    this.view.hitTest(evt.screenPoint)
    .then((r) => {

      let names = r.results.map(x => x.graphic.sourceLayer.title)

      if (names.length > 0 && !names.includes('District Submissions')) {
        this.sketch.complete()
      }

      
      this.validateDistrictGeometries()

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
    });

    watchUtils.whenTrue(this.view, 'stationary', this.handleViewChange);

    this.sketch = new Sketch({
      id: 'sketch',
      layer: this.districtGL,
      view: this.view,
      creationMode: "update",
      availableCreateTools: ['polygon'],
      layout: 'vertical'
    });
    this.sketch.on('create', this.onCreate);
    this.sketch.on('update', this.onUpdate);
    this.sketch.on('delete', this.onDelete);

    this.districtGL.on('click', this.checkActiveGraphic);

    const layerList = new LayerList({
      view: this.view
    });

    this.legend = new Legend({
      view: this.view,
      layerInfos: [
        {
          layer: this.districtsFL,
          title: "Submissions"
        },
        {
          layer: this.demographicsFL,
          title: 'Census Tracts 2018'
        }
      ]
    });

    let homeButton = new Home({view: this.view});
    let locateWidget = new Locate({view: this.view});

    this.view.ui.add(homeButton, 'top-left');
    this.view.ui.add(locateWidget, 'top-left');
    this.view.ui.add(layerList, {position: "top-right"});
    this.view.ui.add(this.sketch, 'top-right');
    this.view.ui.add(this.legend, 'bottom-left');

    this.view.on('click', this.mapClick);

  }
  
  render() {
    return <div id="edit-map" style={{height: '100%'}}></div>
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
