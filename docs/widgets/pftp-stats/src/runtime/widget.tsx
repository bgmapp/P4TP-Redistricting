import { React, BaseWidget, appActions } from 'jimu-core'

import CalciteThemeProvider from 'calcite-react/CalciteThemeProvider'
import { CalciteH3 } from 'calcite-react/Elements'

import Information from 'calcite-ui-icons-react/InformationIcon'
import AddInEdit from 'calcite-ui-icons-react/AddInEditIcon'
import Users from 'calcite-ui-icons-react/UsersIcon'

import Introduction from './Introduction'
import DistrictEdit from './DistrictEdit'
import DistrictView from './DistrictView'

require('./stylesheets/style.scss')


export default class Widget extends BaseWidget {

  constructor(props) {
    super(props)

    this.state = {
      oneSubmission: false,
      submitted: false,
      started: false,
      activeStep: 1
    }

  }

  updateActive = (value) => {
    this.setState({
      activeStep: value
    })
  }

  viewSubmit = () => {

    // TODO - Adjust Layers in Map to Present New Information
    // TODO - Reset Districts (This Likely Needs to be STATE in Widget Edit)

    this.props.dispatch(
      appActions.widgetStatePropChange('pftp', 'submission', false)
    )

    this.setState({
      oneSubmission: true,
      activeStep: 2
    })

  }

  editSubmit = () => {

    this.setState({
      oneSubmission: true,
      activeStep: 3
    })

  }

  getMainContent = () => {

    if (this.state.activeStep == 1) {
      return <Introduction />
    } 

    if (this.state.activeStep == 2) {
      return <DistrictEdit editSubmit={this.editSubmit} started={this.state.oneSubmission} data={this.props}/>
    }
    
    if (this.state.activeStep == 3) {
      return <DistrictView viewSubmit={this.viewSubmit} updateActive={this.updateActive} data={this.props} started={this.state.oneSubmission}/>
    } 

  }

  render() {

    let mainContent = this.getMainContent()

    let navBaseline = {opacity: '0.5'}
    let navSelected = {color: 'black'}

    return (
      <CalciteThemeProvider>
        <div style={{margin: '25px'}}>

          <div style={{textAlign: 'center'}}>
            <CalciteH3>Mapping Community</CalciteH3>
              <Information id="navBtn" style={this.state.activeStep == 1 ? navSelected : navBaseline} onClick={() => {this.updateActive(1)}}/>
              <AddInEdit id="navBtn" style={this.state.activeStep == 2 ? navSelected : navBaseline} onClick={() => {this.updateActive(2)}}/>
              <Users id="navBtn" style={this.state.activeStep == 3 ? navSelected : navBaseline} onClick={() => {this.updateActive(3)}}/>
          </div>

          <div style={{marginTop: '15px'}}>
            {mainContent}
          </div>

        </div>
      </CalciteThemeProvider>
    )

  }

}

Widget.mapExtraStateProps = (state) => {

  if (state.widgetsState.pftp) {

    return {
      districts: state.widgetsState.pftp.districts,
      submission: state.widgetsState.pftp.submission,
      submissionName: state.widgetsState.pftp.submissionName,
      mapView: state.widgetsState.pftp.mapView
    }

  }

}
