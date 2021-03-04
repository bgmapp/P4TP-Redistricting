import { React, BaseWidget, appActions } from 'jimu-core';

import CalciteThemeProvider from 'calcite-react/CalciteThemeProvider';
import { CalciteH3, CalciteP, CalciteH6 } from 'calcite-react/Elements';

import Introduction from './Introduction';
import DistrictEdit from './DistrictEdit';
import DistrictView from './DistrictView';

import styled from 'styled-components';

require('./stylesheets/style.scss');


const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  padding: 0;
  display: flex;
  flex: auto;
  flex-direction: column;
  height: 100%;
`

const Header = styled.div`
  margin-top: 15px;
  text-align: center;
  margin-bottom: 15px;
`

const Overflow = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  height: 1000px;
  margin: 15px;
`

const Footer = styled.div`
  text-align: center;
`


export default class Widget extends BaseWidget {

  constructor(props) {
    super(props);

    this.state = {
      activeStep: 1,
      firstInput: false,
      submitted: false,
    }

  }

  updateActive = (value) => {
    this.setState({
      activeStep: value
    });
  }

  viewSubmit = () => {

    // TODO - Adjust Layers in Map to Present New Information
    // TODO - Reset Districts (This Likely Needs to be STATE in Widget Edit)

    this.props.dispatch(
      appActions.widgetStatePropChange('pftp', 'submission', false)
    )

    this.setState({
      activeStep: 2
    })

  }

  editSubmit = () => {

    this.setState({
      activeStep: 3
    })

  }

  getMainContent = () => {

    // Swtich to DistrictEdit Component Automatically the First Time Edit is Made
    if (this.props.districts && !this.state.firstInput) {
      this.setState({
        activeStep: 2,
        firstInput: true
      })
    }

    if (this.state.activeStep == 1) {
      return <Introduction />
    } 

    if (this.state.activeStep == 2) {
      return <DistrictEdit editSubmit={this.editSubmit} data={this.props} />
    }
    
    if (this.state.activeStep == 3) {
      return <DistrictView viewSubmit={this.viewSubmit} updateActive={this.updateActive} data={this.props} />
    } 

  }

  render() {

    let navBaseline = {opacity: '0.5'}
    let navSelected = {color: '#535353', fontWeight: 'bold'}

    return (

      <CalciteThemeProvider>
        <Container>
          <Header>
            <CalciteH3>Mapping Community</CalciteH3>
            <CalciteH6 id="navTerm" style={this.state.activeStep == 1 ? navSelected : navBaseline} onClick={() => {this.updateActive(1)}}>Learn</CalciteH6>
            <CalciteH6 id="navTerm" style={this.state.activeStep == 2 ? navSelected : navBaseline} onClick={() => {this.updateActive(2)}}>Create</CalciteH6>
            <CalciteH6 id="navTerm" style={this.state.activeStep == 3 ? navSelected : navBaseline} onClick={() => {this.updateActive(3)}}>Export</CalciteH6>
          </Header>
          <Overflow>
            {this.getMainContent()}
          </Overflow>
          <Footer>
            <CalciteP style={{margin: 'auto', padding: '15px 5px 5px 5px', color: '#4242426b'}}>
              People for the People 2021
            </CalciteP>
          </Footer>
        </Container>
      </CalciteThemeProvider>
    )

  }

}

Widget.mapExtraStateProps = (state) => {

  if (state.widgetsState.pftp) {

    return {
      uniqueNames: state.widgetsState.pftp.uniqueNames,
      districts: state.widgetsState.pftp.districts,
      outDistricts: state.widgetsState.pftp.outDistricts,
      submission: state.widgetsState.pftp.submission,
      submissionName: state.widgetsState.pftp.submissionName,
      mapView: state.widgetsState.pftp.mapView,
      activeUID: state.widgetsState.pftp.activeUID,
      contacts: state.widgetsState.pftp.contacts
    }

  }

}
