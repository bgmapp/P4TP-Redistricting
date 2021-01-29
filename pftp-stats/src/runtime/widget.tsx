import { React, BaseWidget, appActions } from 'jimu-core'

import CalciteThemeProvider from 'calcite-react/CalciteThemeProvider'
import { CalciteH3, CalciteP } from 'calcite-react/Elements'

import Information from 'calcite-ui-icons-react/InformationIcon'
import AddInEdit from 'calcite-ui-icons-react/AddInEditIcon'
import Users from 'calcite-ui-icons-react/UsersIcon'
import Tooltip from 'calcite-react/Tooltip'

import Introduction from './Introduction'
import DistrictEdit from './DistrictEdit'
import DistrictView from './DistrictView'

import styled from 'styled-components'

require('./stylesheets/style.scss')


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
    super(props)

    this.state = {
      firstEditLoad: true,
      editModal: false,
      oneSubmission: false,
      submitted: false,
      started: false,
      activeStep: 1,
      firstInput: false
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
      return <DistrictEdit 
              editSubmit={this.editSubmit} 
              started={this.state.oneSubmission}
              data={this.props}
              openModal={this.openModal}
              closeModal={this.closeModal}
              setFirstLoad={this.setFirstLoad}
              sdata={this.state}
              />
    }
    
    if (this.state.activeStep == 3) {
      return <DistrictView viewSubmit={this.viewSubmit} updateActive={this.updateActive} data={this.props} started={this.state.oneSubmission}/>
    } 

  }

  openModal = () => {
    this.setState({
      editModal: true
    })
  }

  closeModal = () => {
    this.setState({
      editModal: false
    })
  }

  setFirstLoad = () => {
    this.setState({
      firstEditLoad: false,
      editModal: true
    })
  }

  render() {

    let mainContent = this.getMainContent()

    let navBaseline = {opacity: '0.5'}
    let navSelected = {color: 'black'}

    return (
      <CalciteThemeProvider>
        <Container>
          <Header>
            <CalciteH3>Mapping Community</CalciteH3>
            <Tooltip title="Overview" enterDelay={1000}>
              <Information id="navBtn" style={this.state.activeStep == 1 ? navSelected : navBaseline} onClick={() => {this.updateActive(1)}}/>
            </Tooltip>
            <Tooltip title="Editor Tab" enterDelay={1000}>
              <AddInEdit id="navBtn" style={this.state.activeStep == 2 ? navSelected : navBaseline} onClick={() => {this.updateActive(2)}}/>
            </Tooltip>
            <Tooltip title="Explore" enterDelay={500}>
              <Users id="navBtn" style={this.state.activeStep == 3 ? navSelected : navBaseline} onClick={() => {this.updateActive(3)}}/>
            </Tooltip>
          </Header>
          <Overflow>
            {mainContent}
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
      districts: state.widgetsState.pftp.districts,
      submission: state.widgetsState.pftp.submission,
      submissionName: state.widgetsState.pftp.submissionName,
      mapView: state.widgetsState.pftp.mapView,
      pushedOIDs: state.widgetsState.pftp.pushedOIDs
    }

  }

}