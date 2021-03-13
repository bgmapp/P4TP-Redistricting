import { React, BaseWidget, appActions } from 'jimu-core';

import MultiSelect from 'calcite-react/MultiSelect';
import { CalciteP } from 'calcite-react/Elements';
import { MenuItem } from 'calcite-react/Menu';


export default class DistrictFilter extends BaseWidget {

    constructor(props) {
        super(props)

        this.state = {
            selectedValues: []
        }

    }

    handleMultiSelectChange = async (values) => {

        if (values.length == 0 || values.includes('ALL')) {
            var where = '1=1'
        } else {
            var where =  `dist_name in (${values.map(x => `'${x}'`).join(",")})`
        }

        this.setState({
          selectedValues: values
        })

        this.props.data.dispatch(
            appActions.widgetStatePropChange('pftp', 'districtWhere', where)
        )
    }

    getMenuItems = () => {

        let menuItems = undefined

        if (this.props.data.uniqueNames === undefined || this.props.data.uniqueNames < 1) {
            return <div style={{textAlign: 'center'}}><CalciteP value="ALL">No Submissions in Current Extent</CalciteP></div>
        } 

        menuItems = this.props.data.uniqueNames.map((u) => {
            return <MenuItem value={u}>{u}</MenuItem>
        })
        menuItems.unshift(<MenuItem value="ALL">All Submissions</MenuItem>)

        return (
            <MultiSelect onChange={this.handleMultiSelectChange} selectedValues={this.state.selectedValues}
            placeholder='Filter Previous Submissions . . .' closeOnSelect={false} fulldWidth={true} fullWidth>
                {menuItems}
            </MultiSelect>
        )

    }


    render() {
        return this.getMenuItems()
    }

}