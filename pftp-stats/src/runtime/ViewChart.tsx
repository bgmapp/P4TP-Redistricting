import { React } from 'jimu-core'
import { CalciteP } from 'calcite-react/Elements'

import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'


export default class ViewChart extends React.Component {

    render() {
        return(
            <div style={{ width: '100%', height: 200, marginTop: 50 }}>
                <CalciteP style={{textAlign: 'center', margin: 0}}>
                    Your submission had a compaction of {Math.round(this.props.data.userCompaction)} and a diversity of {Math.round(this.props.data.userDiversity)}
                </CalciteP>
                <ResponsiveContainer>
                    <BarChart
                        margin={{top: 5, right: 30, left: 20, bottom: 5}}
                        data={this.props.data.chartData}
                        height={100}
                        width={200}
                    >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey='cmp' name='Compaction' fill="#8884d8" />
                    <Bar dataKey='div' name='Diversity' fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        )
    }
  
  }