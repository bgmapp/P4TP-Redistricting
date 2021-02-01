import { React, BaseWidget, appActions } from 'jimu-core'

import FeatureLayer = require('esri/layers/FeatureLayer')
import Extent = require('esri/geometry/Extent')

import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from 'calcite-react/Table'
import { CalciteP } from 'calcite-react/Elements'
import { MenuItem } from 'calcite-react/Menu'
import Button, { ButtonGroup } from 'calcite-react/Button'
import MultiSelect from 'calcite-react/MultiSelect'

import Chevron from 'calcite-ui-icons-react/ChevronLeftIcon'
  
import ViewChart from './ViewChart'


export default class DistrictView extends BaseWidget {

    constructor(props) {
        super(props)

        this.districtsFL = new FeatureLayer({
            url: this.props.data.config.editDistrictsURL
        })

        this.state = {
            selectedValues: ['ALL'],
            uniqueSelected: undefined,
            uniqueNames: [],
            averageCompaction: 0,
            averageDiversity: 0,
            userCompaction: 0,
            userDiversity: 0,
            chartData: [],
            cmpRecords: [],
            divRecords: []
        }

    }

    fetchChartRecords = async(where) => {

        let query = this.districtsFL.createQuery()
        query.outFields = ['cmp_index', 'div_index', 'dist_id']
        query.geometry = new Extent(this.props.data.mapView.extent)
        query.where = where

        let results = await this.districtsFL.queryFeatures(query)
        .then((r) => {
            return r.features.map(function(f) {
                 return {
                    'id':  f.attributes.dist_id, 
                    'cmp': f.attributes.cmp_index,
                    'div': f.attributes.div_index
                }
            })
        })

        return results

    }

    async collectStatistics(where) {

        let cmp = {
            onStatisticField: "cmp_index",
            outStatisticFieldName: "Compaction",
            statisticType: "avg"
        }

        let div = {
            onStatisticField: "div_index",
            outStatisticFieldName: "Diversity",
            statisticType: "avg"
        }

        let query = this.districtsFL.createQuery()
        query.where = where
        query.outStatistics = [ cmp, div ]

        let stats = await this.districtsFL.queryFeatures(query)
        .then((r) => {
            return {
                compaction: r.features[0].attributes['Compaction'].toFixed(2),
                diversity: r.features[0].attributes['Diversity'].toFixed(2)
            }
        })
        .catch((e) => {
            console.log(`Error Fetching Statistics: ${e}`)
            return {
                compaction: 0,
                diversity: 0
            }
        })

        return stats

    }

    handleMultiSelectChange = async (values) => {

        if (values.length == 0 || values.includes('ALL')) {
            var where = '1=1'
        } else {
            var where =  `dist_name in (${values.map(x => `'${x}'`).join(",")})`
        }

        let stats = await this.collectStatistics(where)

        let chartData = await this.fetchChartRecords(where)

        this.setState({
          averageCompaction: stats.compaction,
          averageDiversity: stats.diversity,
          selectedValues: values,
          chartData: chartData
        })

        this.props.data.dispatch(
            appActions.widgetStatePropChange('pftp', 'districtWhere', where)
        )
    }

    async getUniqueNames(featureLayer) {

        let query = featureLayer.createQuery()
        query.returnDistinctValues = true
        query.returnGeometry = false
        query.geometry = new Extent(this.props.data.mapView.extent)
        query.outFields = ['dist_name']

        let uniqueNames = await featureLayer.queryFeatures(query).then((resp) => {
            return resp.features.map(f => f.attributes.dist_name)
        })

        return uniqueNames

    }

    componentDidMount = async () => {

        if (!this.props.data.submission) return

        let stats = await this.collectStatistics('1=1')

        let pushedWhere = `objectId in (${this.props.data.pushedOIDs.map(x => `${x}`).join(",")})`
        let pushedStats = await this.collectStatistics(pushedWhere)

        let chartData = await this.fetchChartRecords('1=1')

        this.setState({
            averageCompaction: stats.compaction,
            averageDiversity: stats.diversity,
            userCompaction: pushedStats.compaction,
            userDiversity: pushedStats.diversity,
            uniqueNames: await this.getUniqueNames(this.districtsFL),
            chartData: chartData
        })

    }

    async componentDidUpdate(prevProps) {

        if (this.props.data.mapView != prevProps.data.mapView) {

            let uniqueNames = await this.getUniqueNames(this.districtsFL)

            if (uniqueNames.length < 1) {

                this.setState({
                    uniqueNames: uniqueNames,
                    averageCompaction: 0,
                    averageDiversity: 0,
                    chartData: []
                })

            } else {

                if (this.state.selectedValues.includes('ALL')) {
                    var where = `dist_name in (${uniqueNames.map(x => `'${x}'`).join(",")})`
                } else {
                    var where = `dist_name in (${this.state.selectedValues.map(x => `'${x}'`).join(",")})`
                }

                let stats = await this.collectStatistics(where)
                let chartData = await this.fetchChartRecords(where)

                this.setState({
                    uniqueNames: uniqueNames,
                    averageCompaction: stats.compaction,
                    averageDiversity: stats.diversity,
                    chartData: chartData
                })

            }
        }

    }

    buildLink = () => {

        let baseUrl = `https://ourcommunity.maps.arcgis.com/home/webmap/viewer.html?webmap=${this.props.data.config.exploreMapId}`
        let center  = `center=${this.props.data.mapView.x},${this.props.data.mapView.y},${this.props.data.mapView.wkid}`
        let level   = `level=${this.props.data.mapView.zoom - 2}`
        let target  = `${baseUrl}&${center}&${level}`

        window.open(target)

    }

    getMenuItems = () => {

        let menuItems = undefined

        if (this.state.uniqueNames.length < 1) {

            return <div style={{textAlign: 'center'}}><CalciteP value="ALL">No Values Found in Current Extent</CalciteP></div>

        } else {

            menuItems = this.state.uniqueNames.map((u) => {
                return <MenuItem value={u}>{u}</MenuItem>
            })
            menuItems.unshift(<MenuItem value="ALL">Show All Entries</MenuItem>)

            return (
                <MultiSelect closeOnSelect={false} fulldWidth={true} selectedValues={this.state.selectedValues} onChange={this.handleMultiSelectChange} fullWidth>
                    {menuItems}
                </MultiSelect>
            )
        }

    }

    render() {

        if (!this.props.started) {
            return(
                <div>
                    <CalciteP>
                        Please submit a response to uncover what others have contributed for their communities. Once you have made a submission
                        on the Editor Tab, you will be brought back here to explore other responses.
                    </CalciteP>
                    <div style={{textAlign: 'center'}}>
                        <Button clear onClick={() => {this.props.updateActive(2)}}>Go to Editor Tab</Button>
                    </div>
                </div>
            )
        }

        return(
            <div>

                <Table noCol noRow>
                    <TableHeader>
                        <TableHeaderCell style={{textAlign: 'center'}}>Responses</TableHeaderCell>
                        <TableHeaderCell style={{textAlign: 'center'}}>Compaction</TableHeaderCell>
                        <TableHeaderCell style={{textAlign: 'center'}}>Diversity</TableHeaderCell>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell style={{textAlign: 'center'}}>{this.state.uniqueNames.length}</TableCell>
                            <TableCell style={{textAlign: 'center'}}>{this.state.averageCompaction}</TableCell>
                            <TableCell style={{textAlign: 'center'}}>{this.state.averageDiversity}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <div style={{margin: '15px'}}>
                    {this.getMenuItems()}
                </div>

                <ViewChart dataKey='cmp' data={this.state} />

                <div style={{textAlign: 'center', marginTop: 80}}>
                    <ButtonGroup>
                        <Button style={{margin: 1}} clear disabled={this.props.data.submission == false ? true : false} onClick={this.props.viewSubmit} icon={<Chevron size={16}/>} iconPosition="before" clear>Submit Again</Button>
                        <Button style={{margin: 1}} clear onClick={this.buildLink} clear>Explore on PFTP</Button>
                    </ButtonGroup>
                </div>
            </div>
        )
    }
 
}
