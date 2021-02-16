import { React, appActions } from 'jimu-core'

import List, { ListItem, ListItemTitle } from 'calcite-react/List'
import { CalciteP } from 'calcite-react/Elements'
import TextField from 'calcite-react/TextField'
import Loader from 'calcite-react/Loader'
import Button from 'calcite-react/Button'

import CheckCirle from 'calcite-ui-icons-react/CheckCircleFIcon'
import UsersIcon from 'calcite-ui-icons-react/UsersIcon'
import XCircle from 'calcite-ui-icons-react/XCircleIcon'

import EditModal from './EditModal'

import styled from 'styled-components'


const CenteredLoader = styled(Loader)`
  position: absolute; 
  left: 50%; top: 50%; 
  transform: translate(-50%, -50%)
`


export default class DistrictEdit extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      submissionReady: false,
      districtsReady:  false,
      loading: undefined
    }

  }

  buildFeatures(districtArray, uniqueName, districtLookup) {

    // Create Features for applyEdits Operation

    let features = []

    districtArray.forEach((f) => {
      features.push({
        attributes: {
          div_index: f.m_DIVINDX_CY,
          population: f.m_TOTPOP_FY,
          cmp_index: f.compaction,
          dist_name: uniqueName,
          dist_id: districtLookup[f.uid].id,
          comments: districtLookup[f.uid].comments,
          revised: this.props.started ? 'Yes' : 'No'
        },
        geometry: {rings: f.geometry}
      })
    })

    return features

  }

  validateGeometries() {

    let valid = true

    let invalidGeometryDistricts = Array.from(document.querySelectorAll("[id^=district_][data-valid='false']"))
    if (invalidGeometryDistricts.length >= 1) {
      valid = false
    }

    return valid

  }

  validateNames() {

    let valid = true

    let districtNames = Array.from(document.querySelectorAll("[id^=district_]"))
    
    if (districtNames.length < 1) return false

    districtNames.forEach((d) => {
      if (d.value == '') {
        valid = false
      }
    })

    return valid

  }

  validateSubmission = () => {

    let valid = true

    let uniqueName = document.getElementById("unique").value

    if (!uniqueName) {
      valid = false
    }

    this.setState({
      submissionReady: valid
    })

  }

  validateDistricts = () => {

    let valid = true

    valid = this.validateNames()
    valid = this.validateGeometries()

    this.setState({
      districtsReady: valid
    })

  }

  validateUniqueName() {

    try {

      let uniqueName = document.getElementById("unique").value
      if (uniqueName == undefined || uniqueName == '') {
        return false
      }
      return true

    } catch {

      return false
      
    }

  }

  collectValues() {

    let districtLookup = {}

    let districtNames    = Array.from(document.querySelectorAll("[id^=district_]"))

    districtNames.forEach((d) => {
      districtLookup[d.id.split('_')[1]] = {id: d.value}
    })

    let districtComments = Array.from(document.querySelectorAll("[id^=comment_]"))

    districtComments.forEach((c) => {
      districtLookup[c.id.split('_')[1]].comments = c.value
    })

    let submissionName = document.getElementById("unique").value

    return [submissionName, districtLookup]

  }

  pushEdits = (e) => {

    console.log('Push Edits')
    console.log(this.props.data.districts)

    let addInfo = this.collectValues()
    let adds = this.buildFeatures(this.props.data.districts, addInfo[0], addInfo[1])

    let formData = new FormData()
    formData.append('adds',  JSON.stringify(adds))
    formData.append('f', 'json')

    let requestOptions = {
      redirect: 'follow',
      method: 'POST',
      body: formData
    }

    this.setState({loading: true})

    console.log(`${this.props.data.config.editDistrictsURL}/applyEdits`)

    fetch(`${this.props.data.config.editDistrictsURL}/applyEdits`, requestOptions)
    .then(response => response.json())
    .then(result => {

      // TODO - Stay on Edit Component & Send Message If Length of Successes is Zero
      let successes = result.addResults.filter(r => r.success)
      let pushedOIDs = successes.map(s => s.objectId)

      this.setState({loading: false})

      this.props.data.dispatch(
        appActions.widgetStatePropChange('pftp', 'submission', true)
      )

      this.props.data.dispatch(
        appActions.widgetStatePropChange('pftp', 'pushedOIDs', pushedOIDs)
      )

      this.props.data.dispatch(
        appActions.widgetStatePropChange('pftp', 'uniqueFilter', 'ALL')
      )

      // Set DistrictView as the Active Component
      this.props.editSubmit()

    })

    .catch(error => {
      console.log(`Submission Error: ${error}`)
      this.setState({
        loading: false
      })
    })

  }

  createDistricts = () => {

    if (!this.props.data.districts || this.props.data.districts.length < 1) return [undefined, false]

    let invalidGeometries = true

    let listItems = this.props.data.districts.map((info, i) => {

      let c_icon = info.compaction > 50 ? <CheckCirle /> : <XCircle />
      let d_icon = info.m_DIVINDX_CY > 75 ? <UsersIcon /> : <XCircle />

      if (!info.valid) invalidGeometries = false

      let liStyle =  info.uid == this.props.data.activeUID ? {borderLeft: '5px rgb(240, 185, 5) solid'} : {}

      return(
          <ListItem style={liStyle} disabled={info.valid ? false : true}>
              <TextField onChange={this.validateDistricts} minimal id={`district_${info.uid}`} placeholder="Community Name . . ." data-valid={info.valid}/>
              <ListItem leftNode={<UsersIcon />}>
                <ListItemTitle>Total Population: {info.m_TOTPOP_FY}</ListItemTitle>
              </ListItem>
              <ListItem leftNode={d_icon}>
                <ListItemTitle>Diversity Index: {info.m_DIVINDX_CY}</ListItemTitle>
              </ListItem>
              <ListItem leftNode={c_icon}>
                <ListItemTitle>Compaction Index: {info.compaction}</ListItemTitle>
              </ListItem>
              <ListItem>
                <TextField id={`comment_${info.uid}`} minimal placeholder="Community comments . . ."/>
              </ListItem>
          </ListItem>
      )
    })

    return [(<List>{listItems}</List>), invalidGeometries]

  }

  createSubmission = (disableSubmission) => {

    if (!this.props.data.districts || this.props.data.districts.length < 1) return undefined

    if (disableSubmission) {
      var textDisable = true
      var buttonDisable = true
    } else {
      var textDisable = disableSubmission ? true : false
      var buttonDisable = [this.validateUniqueName(), this.state.submissionReady].some((e) => e === false) ? true : false
    }

    return(
      <TextField
        fullWidth id="unique" disabled={textDisable}
        onChange={this.validateSubmission}
        placeholder="Unique Name or Email . . ." 
        rightAdornment={<Button disabled={buttonDisable} green onClick={this.pushEdits}>Submit</Button>}
      />
    )

  }

  render() {

    if (this.state.loading) return <CenteredLoader text="Processing Information"/>

    let districtValues = this.createDistricts()
    let districts = districtValues[0]
    let geomCheck = districtValues[1]

    // Checking All Districts Again In Case Geometries Have Updated (Not Sure How to Best Handle This Update Without Causing Infinite Loop)
    let extraNameCheck = this.validateNames()

    let noDistricts = <CalciteP style={{textAlign: 'center', fontStyle: 'italic', marginTop: '40px', color: '#b8b8b8'}}>No Boundaries Created</CalciteP>

    // If Any Districts Are Invalid, Then the Submission Is Not Ready (i.e. Should Be Disabled)
    let disableSubmission = [this.state.districtsReady, geomCheck, extraNameCheck].some((e) => e === false)
    let submit = districts == undefined ? noDistricts : this.createSubmission(disableSubmission)

    // //Show Instructions the First Time DistrictEdit is Selected
    // if (this.props.sdata.firstEditLoad) {
    //   this.props.setFirstLoad()
    // }

    return(
        <div>
          <CalciteP>
            Use the sketch tool in the map to get started. You can enforce straight lines while drawing by holding down the control (Ctrl) key. 
            Any boundaries that overlap will be flagged as "invalid" geometries and shown in gray. You will not be able to submit your 
            response until all of your boundaries have a name an do not overlap. We encourage you to spend time exploring how various community 
            shapes impact diversity and compaction.
            <span style={{fontStyle: 'italic', color: '#003eff'}} onClick={this.props.openModal}> More Details</span>
          </CalciteP>

          <EditModal modalOpen={this.props.sdata.editModal} closeModal={this.props.closeModal}/>

          {districts}
          <br/>
          {submit}
        </div>
      )
  }

}