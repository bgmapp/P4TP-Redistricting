import { React, BaseWidget, appActions } from 'jimu-core'

import FeatureLayer = require('esri/layers/FeatureLayer')
import Extent = require('esri/geometry/Extent')

import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from 'calcite-react/Table'
import { CalciteP } from 'calcite-react/Elements'
import { MenuItem } from 'calcite-react/Menu'
import Button from 'calcite-react/Button'
import MultiSelect from 'calcite-react/MultiSelect'

import Chevron from 'calcite-ui-icons-react/ChevronLeftIcon'

import styled from 'styled-components'


const Centered = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`

const Overflow = styled.div`
  height: 500px;
`

export default class DistrictView extends BaseWidget {

    constructor(props) {
        super(props)

        this.districtsFL = new FeatureLayer({
            url: this.props.data.config.editDistricts
        })

        this.state = {
            selectedValues: ['ALL'],
            uniqueSelected: undefined,
            uniqueNames: [],
            averageCompaction: 0,
            averageDiversity: 0
        }

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

    handleMultiSelectChange = async (values, items) => {

        if (values.length == 0 || values.includes('ALL')) {
            var where = '1=1'
        } else {
            var where =  `dist_name in (${values.map(x => `'${x}'`).join(",")})`
        }

        let stats = await this.collectStatistics(where)

        this.setState({
          averageCompaction: stats.compaction,
          averageDiversity: stats.diversity,
          selectedValues: values
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

    async componentDidMount() {

        let stats = await this.collectStatistics('1=1')

        this.setState({
            averageCompaction: stats.compaction,
            averageDiversity: stats.diversity,
            uniqueNames: await this.getUniqueNames(this.districtsFL)
        })

    }

    async componentDidUpdate(prevProps) {

        if (this.props.data.mapView != prevProps.data.mapView) {

            let uniqueNames = await this.getUniqueNames(this.districtsFL)

            if (uniqueNames.length < 1) {

                this.setState({
                    uniqueNames: uniqueNames,
                    averageCompaction: 0,
                    averageDiversity: 0
                })

            } else {

                let where = `dist_name in (${uniqueNames.map(x => `'${x}'`).join(",")})`
                let stats = await this.collectStatistics(where)

                this.setState({
                    uniqueNames: uniqueNames,
                    averageCompaction: stats.compaction,
                    averageDiversity: stats.diversity
                })

            }
        }

    }

    buildLink = () => {

        let baseUrl = 'https://ourcommunity.maps.arcgis.com/home/webmap/viewer.html?webmap=612b9f72d6264e5c9baa1148509e0b40'
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
                        Please submit a response to uncover what others have contributed in your area! Once you have made a submission
                        on the Editor Tab, you will be brought back here to explore other responses.
                    </CalciteP>
                    <Centered>
                        <Button clear onClick={() => {this.props.updateActive(2)}}>Go to Editor Tab</Button>
                    </Centered>
                </div>
            )
        }

        return(
            <div>
                <Overflow>
                    <CalciteP style={{textAlign: 'center'}}>
                        Thank you for your submission!
                        Use the filters below to explore the vision of other people in your community and around the nation.
                    </CalciteP>
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
                    {this.getMenuItems()}
                </Overflow>
                <Centered>
                    <Button clear disabled={this.props.data.submission == false ? true : false} onClick={this.props.viewSubmit} icon={<Chevron size={16}/>} iconPosition="before" style={{margin: '5px'}} clear>Submit Again</Button>
                    <Button clear onClick={this.buildLink} style={{margin: '5px'}} clear>Explore on PFTP</Button>
                </Centered>
            </div>
        )
    }
 
}
