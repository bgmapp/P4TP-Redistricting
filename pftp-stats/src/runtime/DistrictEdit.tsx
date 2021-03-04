import { React, appActions } from 'jimu-core'

import List, { ListItem, ListItemTitle } from 'calcite-react/List'
import { CalciteP } from 'calcite-react/Elements'
import TextField from 'calcite-react/TextField'
import Loader from 'calcite-react/Loader'
import Button from 'calcite-react/Button'

import CheckCirle from 'calcite-ui-icons-react/CheckCircleFIcon'
import UsersIcon from 'calcite-ui-icons-react/UsersIcon'
import XCircle from 'calcite-ui-icons-react/XCircleIcon'

import DistrictFilter from './DistrictFilter'
import EditModal from './EditModal'

import styled from 'styled-components'


const CenteredLoader = styled(Loader)`
  position: absolute; 
  left: 50%; top: 50%; 
  transform: translate(-50%, -50%)
`

const FilterDiv = styled.div`
  margin-top: 45px;
  margin-bottom: 45px;
  margin-right: auto;
  margin-left: auto;
  width: 80%;
`


export default class DistrictEdit extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      submissionReady: false,
      districtsReady: false,
      editModal: false,
      loading: undefined
    }

  }

  buildFeatures(districtArray, uniqueName, districtLookup) {

    // Create Features for applyEdits Operation

    let features = []

    districtArray.forEach((f) => {
      features.push({
        attributes: {
          div_index: f.diversity,
          population: f.population,
          cmp_index: f.compaction,
          dist_name: uniqueName,
          dist_id: districtLookup[f.uid].id,
          comments: districtLookup[f.uid].comments
        },
        geometry: {rings: f.geometry}
      })
    })

    return features

  }

  enrichDistricts = () => {

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

    fetch(`${this.props.data.config.editDistrictsURL}/applyEdits`, requestOptions)
    .then(response => response.json())
    .then(result => {

      // TODO - Stay on Edit Component & Send Message If Length of Successes is Zero
      let successes = result.addResults.filter(r => r.success)

      this.setState({loading: false})

      this.props.data.dispatch(
        appActions.widgetStatePropChange('pftp', 'submission', true)
      )

      this.props.data.dispatch(
        appActions.widgetStatePropChange('pftp', 'uniqueFilter', 'ALL')
      )

      // Just Call This Something Else - Esri Districts or Something
      this.props.data.dispatch(
        appActions.widgetStatePropChange('pftp', 'outDistricts', adds)
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
      let d_icon = info.diversity > 75 ? <UsersIcon /> : <XCircle />

      if (!info.valid) invalidGeometries = false

      let liStyle =  info.uid == this.props.data.activeUID ? {borderLeft: '5px rgb(240, 185, 5) solid'} : {}

      return(
          <ListItem style={liStyle} disabled={info.valid ? false : true}>
              <TextField className='communityPlaceholder' onChange={this.validateDistricts} minimal id={`district_${info.uid}`} placeholder="Community Name (Required)" data-valid={info.valid}/>
              <ListItem leftNode={<UsersIcon />}>
                <ListItemTitle>Total Population: {info.population}</ListItemTitle>
              </ListItem>
              <ListItem leftNode={d_icon}>
                <ListItemTitle>Diversity Index: {info.diversity}</ListItemTitle>
              </ListItem>
              <ListItem leftNode={c_icon}>
                <ListItemTitle>Compaction Index: {info.compaction}</ListItemTitle>
              </ListItem>
              <ListItem>
                <TextField id={`comment_${info.uid}`} type='textarea' minimal placeholder="Describe Your Community"/>
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

    return(
        <div>
          <CalciteP>
            Use the sketch tool in the map to get started. You can enforce straight lines while drawing by holding down the control (Ctrl) key. 
            Any boundaries that overlap will be flagged as "invalid" geometries and shown in gray. You will not be able to submit your 
            response until all of your boundaries have a name and do not overlap. We encourage you to spend time exploring how various community 
            shapes impact diversity and compaction.
            <span style={{fontStyle: 'italic', color: '#003eff'}} onClick={this.openModal}> More Details</span>
          </CalciteP>

          <EditModal modalOpen={this.state.editModal} closeModal={this.closeModal}/>

          <FilterDiv>
            <DistrictFilter data={this.props.data} />
          </FilterDiv>

          {districts}
          <br/>
          {submit}
        </div>
      )
  }

}