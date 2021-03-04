import { React, BaseWidget, appActions } from 'jimu-core';

import FeatureLayer = require('esri/layers/FeatureLayer');
import projection = require("esri/geometry/projection");
import SpatialReference = require("esri/geometry/SpatialReference");
import Polygon = require("esri/geometry/Polygon");
import Extent         = require('esri/geometry/Extent');

import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from 'calcite-react/Table';
import { CalciteP } from 'calcite-react/Elements';
import Button, { ButtonGroup } from 'calcite-react/Button';

import Chevron from 'calcite-ui-icons-react/ChevronLeftIcon';
import Download from 'calcite-ui-icons-react/DownloadToIcon';

import ContactTable from './ContactTable';
  

export default class DistrictView extends BaseWidget {

    constructor(props) {
        super(props)

        this.districtsFL = new FeatureLayer({
            url: this.props.data.config.editDistrictsURL
        });

    }

    buildGeoJSON = (e) => {

        projection.load()
        .then(() => {

            var geoJSON = {
                type: "FeatureCollection",
                features: []
            }

            this.props.data.outDistricts.forEach((d) => {

                var p = Polygon({rings: d.geometry.rings, spatialReference: new SpatialReference({wkid: 3857})})
                var projected  = projection.project(p, new SpatialReference({wkid: 4326}))

                geoJSON.features.push({
                    type: 'Feature',
                    properties: {
                        'id': d.attributes.dist_id,
                        'name': d.attributes.dist_name,
                        'comments': d.attributes.comments,
                        'compaction': d.attributes.cmp_index,
                        'diversity': d.attributes.div_index,
                        'population': d.attributes.population
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: projected.rings
                    }
                })

            })

            const exportBlob = new Blob([JSON.stringify(geoJSON)], {type: 'text/json;charset=utf-8'})
            const blobUrl = URL.createObjectURL(exportBlob);

            const anchor = document.createElement('a');
            anchor.href = blobUrl;
            anchor.target = "_blank";
            anchor.download = "boundaries.json";

            anchor.click();
            URL.revokeObjectURL(blobUrl);

        })
        .catch((err) => console.log(`Error Building GeoJSON: ${err}`))

    }

    render() {

        var btnDisable = this.props.data.submission ? false : true;

        var text =  <CalciteP style={{textAlign: 'center', margin: 0}}>
                        Now that you have made a submission, you can do 2 things: submit another response or download your community as a GeoJSON. Any feedback or issues can be 
                        sent to pftp@email.com
                    </CalciteP>

        var message = this.props.data.submission ? text : undefined;

        return(
            <div>

                <div style={{marginBottom: '50px'}}>
                    <ContactTable contacts={this.props.data.contacts} />
                </div>

                {message}

                <div style={{textAlign: 'center', marginTop: 80}}>
                    <ButtonGroup>
                        <Button style={{margin: 1}} clear disabled={btnDisable} onClick={this.props.viewSubmit} icon={<Chevron size={16}/>} iconPosition="before" clear>Map Another Community</Button>
                        <Button id="downloadGeoJSON" style={{margin: 1}} clear  disabled={btnDisable} onClick={this.buildGeoJSON} icon={<Download size={16}/>} clear>GeoJSON</Button>
                    </ButtonGroup>
                </div>
            </div>
        )
    }
 
}
