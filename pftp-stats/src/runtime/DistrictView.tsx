import { React, BaseWidget, appActions } from 'jimu-core';

import FeatureLayer = require('esri/layers/FeatureLayer');
import projection = require("esri/geometry/projection");
import SpatialReference = require("esri/geometry/SpatialReference");
import Polygon = require("esri/geometry/Polygon");

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
        })

        this.state = {
        }

    }

    componentDidMount = async () => {

        // this.setState({
        //     averageCompaction: stats.compaction,
        //     averageDiversity: stats.diversity,
        //     userCompaction: pushedStats.compaction,
        //     userDiversity: pushedStats.diversity,
        // })

    }

    async componentDidUpdate(prevProps) {

        // if (this.props.data.mapView != prevProps.data.mapView) {

        //     let uniqueNames = await this.getUniqueNames(this.districtsFL)

        //     if (uniqueNames.length < 1) {

        //         this.setState({
        //             uniqueNames: uniqueNames,
        //             averageCompaction: 0,
        //             averageDiversity: 0,
        //             chartData: []
        //         })

        //     } else {

        //         if (this.state.selectedValues.includes('ALL')) {
        //             var where = `dist_name in (${uniqueNames.map(x => `'${x}'`).join(",")})`
        //         } else {
        //             var where = `dist_name in (${this.state.selectedValues.map(x => `'${x}'`).join(",")})`
        //         }

        //         let stats = await this.collectStatistics(where)
        //         let chartData = await this.fetchChartRecords(where)

        //         this.setState({
        //             uniqueNames: uniqueNames,
        //             averageCompaction: stats.compaction,
        //             averageDiversity: stats.diversity,
        //             chartData: chartData
        //         })

        //     }
        // }

    }

    buildGeoJSON = (e) => {

        projection.load()
        .then(() => {

            var geoJSON = {
                type: "FeatureCollection",
                features: []
            }

            this.props.data.outDistricts.forEach((d) => {

                console.log('Export')
                console.log(d)

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
        .catch((err) => console.log(err))

    }

    render() {

        // if (!this.props.started) {
        //     return(
        //         <div>
        //             <CalciteP>
        //                 Please submit a response to uncover what others have contributed for their communities. Once you have made a submission
        //                 on the Editor Tab, you will be brought back here to explore other responses.
        //             </CalciteP>
        //             <div style={{textAlign: 'center'}}>
        //                 <Button clear onClick={() => {this.props.updateActive(2)}}>Start Creating</Button>
        //             </div>
        //         </div>
        //     )
        // }

        var btnDisable = !this.props.started ? true : false;

        return(
            <div>

                <CalciteP style={{textAlign: 'center', margin: 0}}>Community Response Overview</CalciteP>
                <Table>
                    <TableHeader>
                        <TableHeaderCell style={{textAlign: 'center'}}>Responses</TableHeaderCell>
                        <TableHeaderCell style={{textAlign: 'center'}}>Compaction</TableHeaderCell>
                        <TableHeaderCell style={{textAlign: 'center'}}>Diversity</TableHeaderCell>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell style={{textAlign: 'center'}}>{20}</TableCell>
                            <TableCell style={{textAlign: 'center'}}>{74}</TableCell>
                            <TableCell style={{textAlign: 'center'}}>{65</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <CalciteP style={{textAlign: 'center', margin: 0}}>Contacts for Testimony Submission</CalciteP>
                <ContactTable />

                <CalciteP style={{textAlign: 'center', margin: 0}}>
                    You can now take the GeoJSON below and then push it out and do some things.
                </CalciteP>

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
