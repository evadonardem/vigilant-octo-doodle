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
        label: 'Finished Goods',
    },
];

const WarehouseFinishedGoods = () => {
    return (
        <>
            <Directory items={BREADCRUMB_ITEMS} />
        </>
    );
};

export default WarehouseFinishedGoods;
