import { React } from 'jimu-core'
import { CalciteP } from 'calcite-react/Elements'

import {ScatterChart, Scatter, XAxis, YAxis, Label, Legend, CartesianGrid, ResponsiveContainer, Dot, Cell } from 'recharts'
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
            <div style={{width: '100%', height: 200, marginTop: 50}}>
                <ResponsiveContainer>
                    <ScatterChart
                        width={200}
                        height={100}
                        margin={{top: 5, right: 30, left: 20, bottom: 5}}
                    >
                        <CartesianGrid />
                        {/* <Legend verticalAlign="bottom"/> */}
                        <XAxis type="number" tickSize={3} dataKey="cmp" tickCount={4} name='Compaction' domain={[cmpMin, cmpMax]}
                               label={{value: 'Compaction', offset: 0, position: 'insideBottom'}}
                        />
                        <YAxis type="number" tickSize={3} dataKey="div" tickCount={4} name='Diversity' domain={[divMin, divMax]} 
                               label={{value: 'Diversity', offset: 0, angle: -90, position: 'left'}}
                        />
                        <Scatter name="Everyone Else"data={this.props.data.chartData} fill="#747474d1">
                            {/* {this.props.data.chartData.map((e, idx) => {

                                let comp = Math.round((e.cmp / e.div * 100) / 2)

                                if (comp <= 25) {
                                    return <Cell key={`cell-${idx}`} fill="#FFFCD4" stroke='#5151518a' />
                                }

                                if (comp > 25 && comp <= 50) {
                                    return <Cell key={`cell-${idx}`} fill="#c37c4c" stroke='#5151518a'/>
                                }

                                if (comp > 50 && comp <= 75) {
                                    return <Cell key={`cell-${idx}`} fill="#350242" stroke='#5151518a' />
                                }

                                if (comp > 75) {
                                    return <Cell key={`cell-${idx}`} fill="#350242" stroke='#5151518a' />
                                }
          
                            })} */}
                        </Scatter>
                        <Scatter name="Your Response" data={userPlot} fill="#26b81de0" shape={<Dot r={12}/>} />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        )
    }
  
  }