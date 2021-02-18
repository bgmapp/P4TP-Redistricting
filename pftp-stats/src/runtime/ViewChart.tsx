import { React } from 'jimu-core'
import { CalciteP } from 'calcite-react/Elements'

import {BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Dot, Polygon } from 'recharts'
import Loader from 'calcite-react/Loader'


export default class ViewChart extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            loading: true
        }

    }

    render() {

        if (this.props.data.chartData.length < 1) return <Loader text="Fetching Chart Data"/>
        

        const userPlot = [{
            cmp: this.props.data.userCompaction,
            div: this.props.data.userDiversity
        }]
    
        const cmpMax = Math.max.apply(Math, this.props.data.chartData.map(function(i) { return i.cmp; }))
        const cmpMin = Math.min.apply(Math, this.props.data.chartData.map(function(i) { return i.cmp; }))
        const divMax = Math.max.apply(Math, this.props.data.chartData.map(function(i) { return i.div; }))
        const divMin = Math.min.apply(Math, this.props.data.chartData.map(function(i) { return i.div; }))

        return(
            <div style={{ width: '100%', height: 200, marginTop: 50 }}>
                <ResponsiveContainer>
                    <ScatterChart
                        width={200}
                        height={100}
                        margin={{top: 5, right: 30, left: 20, bottom: 5}}
                    >
                        <CartesianGrid />
                        <XAxis type="number" dataKey="cmp" name='Compaction' fill="#8884d8" domain={[cmpMin, cmpMax]}/>
                        <YAxis type="number" dataKey="div" name='Diversity' fill="#82ca9d" domain={[divMin, divMax]}/>
                        {/* <Tooltip cursor={{ strokeDasharray: '3 3' }} /> */}
                        <Legend verticalAlign="bottom"/>
                        <Scatter name="All Responses" data={this.props.data.chartData} fill="#8884d8"/>
                        <Scatter name="You" data={userPlot} fill="#82ca9d" shape={<Dot r={12}/>} />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        )
    }
  
  }