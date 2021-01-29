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
                <source src="https://itsy-bitsy.io/pftp/guide.mp4" />
            </video>
            </Modal>
        )
    }
}
