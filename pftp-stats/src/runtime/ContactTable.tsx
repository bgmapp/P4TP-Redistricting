import { React } from 'jimu-core';

import Table, {
    TableHeader,
    TableHeaderRow,
    TableHeaderCell,
    TableBody,
    TableRow,
    TableCell
  } from 'calcite-react/Table'


export default class ContactTable extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            loading: true
        }

    }

    render() {
        return(
            <Table>
                <TableHeader>
                    <TableHeaderRow>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell>Phone</TableHeaderCell>
                    </TableHeaderRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                    <TableCell>Jane Doe</TableCell>
                    <TableCell>jdoe@esri.com</TableCell>
                    <TableCell>999-999-9999</TableCell>
                    </TableRow>
                    <TableRow>
                    <TableCell>Jeffrey Scarmazzi</TableCell>
                    <TableCell>jscarmazzi@esri.com</TableCell>
                    <TableCell>999-999-9999</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        )
    }

}