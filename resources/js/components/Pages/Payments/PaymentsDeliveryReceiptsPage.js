import Directory from '../../Generic/Directory';
import StoresDeliveryReceiptsPayments from '../../Payments/DeliveryReceipts/StoresDeliveryReceiptsPayments';

const BREADCRUMB_ITEMS = [
    {
        icon: 'fa-dashboard',
        label: '',
        link: '#/dashboard'
    },
    {
        icon: '',
        label: 'Payments',
        link: '#/payments'
    },
    {
        icon: '',
        label: 'Delivery Receipts',
    },
];

const PaymentsDeliveryReceiptsPage = () => {

    return (
        <>
            <Directory items={BREADCRUMB_ITEMS} />
            <br />
            <StoresDeliveryReceiptsPayments />
        </>
    );
}

export default PaymentsDeliveryReceiptsPage;
