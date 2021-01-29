import { React } from 'jimu-core'

import Modal from 'calcite-react/Modal'


export default class EditModal extends React.Component {
    render() {
        return(
            <Modal
            title="Getting Started with the Community Mapping Tool"
            open={this.props.modalOpen}
            onRequestClose={this.props.closeModal}
            appElement={document.body}
            >
            <video muted controls style={{maxHeight: '500px'}}>
                <source src="https://github.com/Jwmazzi/pftp_exb/blob/master/guide/guide.mp4?raw=true" />
            </video>
            </Modal>
        )
    }
}
