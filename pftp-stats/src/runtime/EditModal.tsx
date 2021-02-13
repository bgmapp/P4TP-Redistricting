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
                <source src="https://pftp-media.s3.amazonaws.com/guide.mp4" />
            </video>
            </Modal>
        )
    }
}
