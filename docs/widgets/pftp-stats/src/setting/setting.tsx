import { React } from 'jimu-core'

import { CalciteH5 } from 'calcite-react/Elements'
import TextField from 'calcite-react/TextField'

export default class Setting extends React.PureComponent {

  updateDistricts = (evt) => {
      console.log(evt.currentTarget.value)
      this.props.onSettingChange({
          id: this.props.id,
          editDistricts: this.props.config.set('editDistricts', evt.currentTarget.value)
      });
  }

  render() {
      return (
          <div style={{margin: '10px'}}>
              <CalciteH5 style={{marginBottom: '5px'}}>Edit Districts</CalciteH5>
              <TextField onChange={this.updateDistricts} type="textarea" fullWidth placeholder={this.props.config.editDistricts}/>
          </div>
      )
  }
}