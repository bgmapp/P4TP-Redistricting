import { React } from 'jimu-core';

import Table, {TableHeader,TableHeaderRow,TableHeaderCell,TableBody,TableRow,TableCell} from 'calcite-react/Table';
import { CalciteP} from 'calcite-react/Elements';


export default class ContactTable extends React.Component {

    render() {

        let contactRows = []

        if (this.props.contacts) {

            this.props.contacts.forEach((contact) => {

                let name  = contact.your_name;
                let org   = contact.your_organization;
                let email = contact.your_email_address;
                let phone = contact.your_phone_number;

                if (!name && !email && !phone) {
                    // pass
                } else {
                    contactRows.push(
                        <TableRow>
                            <TableCell style={{textAlign: 'center'}}>{name}</TableCell>
                            <TableCell style={{textAlign: 'center'}}>{org}</TableCell>
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
                    No contacts found in the current extent. If you know of a good place to forward information about your
                    community of interest, please submit a response to this <a href={this.props.surveyUrl} target="_blank">survey</a>.
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
                                <TableHeaderCell style={{textAlign: 'center'}}>Group</TableHeaderCell>
                                <TableHeaderCell style={{textAlign: 'center'}}>Email</TableHeaderCell>
                                <TableHeaderCell style={{textAlign: 'center'}}>Phone</TableHeaderCell>
                            </TableHeaderRow>
                        </TableHeader>
                        <TableBody>
                            {contactRows}
                        </TableBody>
                    </Table>
                    <CalciteP style={{textAlign: 'center', margin: 0}}>
                        Didn't see someone that should be on this list? Please submit a response to 
                        this <a href={this.props.surveyUrl} target="_blank">survey</a> and we will make
                        sure they appear next time around.
                    </CalciteP>
                </div>
            )

        }

    }

}