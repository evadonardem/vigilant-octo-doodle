import { Card } from "react-bootstrap";
import Directory from "../../Generic/Directory";

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
    return (
        <>
            <Directory items={BREADCRUMB_ITEMS} />
            <Card className="my-4">
                <Card.Header as="h5">
                    <i className="fa fa-building"></i> Consumable Items
                </Card.Header>
                <Card.Body>

                </Card.Body>
            </Card>
        </>
    );
};

export default WarehouseConsumableItems;
