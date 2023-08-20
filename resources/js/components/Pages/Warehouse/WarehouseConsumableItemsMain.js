import { Button, Card, Modal } from "react-bootstrap";
import Directory from "../../Generic/Directory";
import { useState } from "react";

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Warehouse',
        link: '#/warehouse',
    },
    {
        icon: '',
        label: 'Consumable Items',
    },
];

const WarehouseConsumableItems = () => {
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const handleClickSettings = () => {
        setShowSettingsModal(!showSettingsModal);
    };

    return (
        <>
            <Directory items={BREADCRUMB_ITEMS} />
            <Card className="my-4">
                <Card.Header as="h5">
                    <i className="fa fa-building"></i> Consumable Items
                </Card.Header>
                <Card.Body>
                    <Button type="button" onClick={handleClickSettings}>Settings</Button>
                </Card.Body>
            </Card>

            <Modal
                backdrop='static'
                keyboard={false}
                onHide={() => setShowSettingsModal(false)}
                show={showSettingsModal}
                centered>
                <Modal.Header closeButton>
                    <Modal.Title>Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                </Modal.Body>
            </Modal>
        </>
    );
};

export default WarehouseConsumableItems;
