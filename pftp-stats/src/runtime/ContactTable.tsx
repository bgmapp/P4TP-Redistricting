import { React } from 'jimu-core';

import Table, {TableHeader,TableHeaderRow,TableHeaderCell,TableBody,TableRow,TableCell} from 'calcite-react/Table';
import { CalciteP} from 'calcite-react/Elements';


export default class ContactTable extends React.Component {

    render() {

        let contactRows = []

        if (this.props.contacts) {

            this.props.contacts.forEach((contact) => {

                let name  = contact.Contact_Name
                let email = contact.Contact_Email
                let phone = contact.Contact_Phone

                if (!name && !email && !phone) {
                    // pass
                } else {
                    contactRows.push(
                        <TableRow>
                            <TableCell style={{textAlign: 'center'}}>{name}</TableCell>
                            <TableCell style={{textAlign: 'center'}}>{email}</TableCell>
                            <TableCell style={{textAlign: 'center'}}>{phone}</TableCell>
                        </TableRow>

                    )
                }

            });
        }

        if (contactRows.length < 1) {

            return(
                <CalciteP style={{textAlign: 'center', margin: 0}}>
                    No contacts found in this extent. If you know of a good place to forward this content, please submit a response to 
                    this <a href="survey123">survey</a>.
                </CalciteP>
            )

        } else {

            return(
                <div>
                    <CalciteP style={{textAlign: 'center', margin: 0}}>Contacts Found for Testimony Submission</CalciteP>
                    <Table>
                        <TableHeader>
                            <TableHeaderRow>
                                <TableHeaderCell style={{textAlign: 'center'}}>Name</TableHeaderCell>
                                <TableHeaderCell style={{textAlign: 'center'}}>Email</TableHeaderCell>
                                <TableHeaderCell style={{textAlign: 'center'}}>Phone</TableHeaderCell>
                            </TableHeaderRow>
                        </TableHeader>
                        <TableBody>
                            {contactRows}
                        </TableBody>
                    </Table>
                </div>
            )

        }

    }

}