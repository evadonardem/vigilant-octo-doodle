import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { v4 as uuidv4 } from 'uuid';
import { NumericFormat } from 'react-number-format';

const styles = StyleSheet.create({
    page: {
        fontSize: '10pt',
        margin: 0,
        padding: 10,
    },
    heading: {
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    sectionHeading: {
        paddingTop: 5,
        paddingBottom: 5,
    },
    tableHeading: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tableRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    purchaseOrder: {
        padding: 10,
        margin: 0,
        width: '100%',
    },
    store: {
        borderBottom: '1pt dotted black',
        padding: 10,
        margin: 0,
        width: '100%',
    },
    assignedStaff: {
        padding: 10,
        margin: 0,
        width: '40%',
    },
    expenses: {
        padding: 10,
        margin: 0,
        width: '60%',
    },
});

const PurchaseOrderDetailsPdfDocument = ({
    purchaseOrder,
    purchaseOrderAssignedStaff,
    purchaseOrderExpenses,
    purchaseOrderExpensesMeta,
    purchaseOrderStores,
    withUnitPriceAndTotalAmount,
} = props) => {
    let itemsTotal = {};

    const slicePercentage = 60;
    let columnSize = 0;
    if (+purchaseOrder.status.id === 3) {
        columnSize = slicePercentage / (withUnitPriceAndTotalAmount ? 8 : 6);
    } else {
        columnSize = slicePercentage / (withUnitPriceAndTotalAmount ? 5 : 3);
    }

    const details = purchaseOrderStores ? purchaseOrderStores.map((store, i) => {
            const items = store.items.map((item) => {
            if (itemsTotal.hasOwnProperty(item.id)) {
                itemsTotal[item.id].totalQuantityOriginal += +item.quantity_original;
                itemsTotal[item.id].totalQuantityActual += +item.quantity_actual;
                itemsTotal[item.id].totalQuantityBadOrders += +item.quantity_bad_orders;
                itemsTotal[item.id].totalQuantityReturns += +item.quantity_returns;
            } else {
                itemsTotal[item.id] = {
                    code: item.code,
                    name: item.name,
                    totalQuantityOriginal: +item.quantity_original,
                    totalQuantityActual: +item.quantity_actual,
                    totalQuantityBadOrders: +item.quantity_bad_orders,
                    totalQuantityReturns: +item.quantity_returns,
                };
            }

            return +purchaseOrder.status.id === 3
                ? <View key={uuidv4()} style={styles.tableRow}>
                    <NumericFormat
                        value={+item.quantity_original}
                        displayType="text"
                        thousandSeparator
                        renderText={(value) => <Text style={
                            { flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }
                        }>{value}</Text>} />
                    <Text style={{ flexGrow: 1, width: '13%' }}>{item.code}</Text>
                    <Text style={{ flexGrow: 1, width: '13%' }}>{item.name}</Text>
                    {withUnitPriceAndTotalAmount ?
                        <NumericFormat
                            value={+item.effective_price}
                            displayType="text"
                            decimalScale="2"
                            fixedDecimalScale
                            thousandSeparator
                            renderText={(value) => <Text style={
                                { flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }
                            }>{value}</Text>} /> : null}
                    {withUnitPriceAndTotalAmount ?
                        <NumericFormat
                            value={+item.total_amount}
                            displayType="text"
                            decimalScale="2"
                            fixedDecimalScale
                            thousandSeparator
                            renderText={(value) => <Text style={
                                { flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }
                            }>{value}</Text>} /> : null}
                    <NumericFormat
                        value={+item.quantity_actual}
                        displayType="text"
                        thousandSeparator
                        renderText={(value) => <Text style={
                            { flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }
                        }>{value}</Text>} />
                    <NumericFormat
                        value={+item.quantity_bad_orders}
                        displayType="text"
                        thousandSeparator
                        renderText={(value) => <Text style={
                            { flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }
                        }>{value}</Text>} />
                    <NumericFormat
                        value={+item.quantity_returns}
                        displayType="text"
                        thousandSeparator
                        renderText={(value) => <Text style={
                            { flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }
                        }>{value}</Text>} />
                    <Text style={{ flexGrow: 1, width: `${columnSize}%` }}>{item.delivery_receipt_no}</Text>
                    <Text style={{ flexGrow: 1, width: `${columnSize}%` }}>{item.booklet_no}</Text>
                    <Text style={{ flexGrow: 1, width: '14%' }}>{item.remarks}</Text>
                </View>
                : <View key={uuidv4()} style={styles.tableRow}>
                    <NumericFormat
                        value={+item.quantity_original}
                        displayType="text"
                        thousandSeparator
                        renderText={(value) => <Text style={
                            { flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }
                        }>{value}</Text>} />
                    <Text style={{ flexGrow: 1, width: `${columnSize}%` }}>{item.code}</Text>
                    <Text style={{ flexGrow: 1, width: `${columnSize}%` }}>{item.name}</Text>
                    {withUnitPriceAndTotalAmount ?
                        <NumericFormat
                            value={+item.effective_price}
                            displayType="text"
                            decimalScale="2"
                            fixedDecimalScale
                            thousandSeparator
                            renderText={(value) => <Text style={
                                { flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }
                            }>{value}</Text>} /> : null}
                    {withUnitPriceAndTotalAmount ?
                        <NumericFormat
                            value={+item.total_amount}
                            displayType="text"
                            decimalScale="2"
                            fixedDecimalScale
                            thousandSeparator
                            renderText={(value) => <Text style={
                                { flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }
                            }>{value}</Text>} /> : null}
                    <Text style={{ flexGrow: 1, width: '40%' }}></Text>
                </View>;
        });

        const promodisers = store.promodisers.map((promodiser) => {
            return `${promodiser.name} ${promodiser.contact_no}`;
        });

        return <View key={uuidv4()} style={styles.store}>
            <Text>{i + 1}) ({store.code}) {store.name} | Promodiser(s): {promodisers.join(', ')}</Text>
            <Text style={{ marginBottom: 5 }}>Address: {store.address_line}</Text>
            {
                +purchaseOrder.status.id === 3
                    ? <View key={uuidv4()} style={styles.tableHeading}>
                        <Text style={{ flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }}>Qty.</Text>
                        <Text style={{ flexGrow: 1, width: '13%' }}>Code</Text>
                        <Text style={{ flexGrow: 1, width: '13%' }}>Name</Text>
                        {withUnitPriceAndTotalAmount ?
                            <Text style={{ flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }}>Unit Price</Text> : null}
                        {withUnitPriceAndTotalAmount ?
                            <Text style={{ flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }}>Total Amount</Text> : null}
                        <Text style={{ flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }}>Qty. (Act.)</Text>
                        <Text style={{ flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }}>Qty. (BO)</Text>
                        <Text style={{ flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }}>Qty. (Ret.)</Text>
                        <Text style={{ flexGrow: 1, width: `${columnSize}%` }}>DR#</Text>
                        <Text style={{ flexGrow: 1, width: `${columnSize}%` }}>B#</Text>
                        <Text style={{ flexGrow: 1, width: '14%' }}>Remarks</Text>
                    </View>
                    : <View key={uuidv4()} style={styles.tableHeading}>
                        <Text style={{ flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }}>Qty.</Text>
                        <Text style={{ flexGrow: 1, width: `${columnSize}%` }}>Code</Text>
                        <Text style={{ flexGrow: 1, width: `${columnSize}%` }}>Name</Text>
                        {withUnitPriceAndTotalAmount ?
                            <Text style={{ flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }}>Unit Price</Text> : null}
                        {withUnitPriceAndTotalAmount ?
                            <Text style={{ flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }}>Total Amount</Text> : null}
                        <Text style={{ flexGrow: 1, width: '40%' }}></Text>
                    </View>
            }
            {items}
        </View>;
    }) : [];

    let items = [];
    for (const itemId in itemsTotal) {
        const itemTotal = itemsTotal[itemId];
        items.push(
            +purchaseOrder.status.id === 3
                ? <View key={uuidv4()} style={styles.tableHeading}>
                    <NumericFormat
                        value={+itemTotal.totalQuantityOriginal}
                        displayType="text"
                        thousandSeparator
                        renderText={(value) => <Text style={
                            { flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }
                        }>{value}</Text>} />
                    <Text style={{ flexGrow: 1, width: '13%' }}>{itemTotal.code}</Text>
                    <Text style={{ flexGrow: 1, width: '13%' }}>{itemTotal.name}</Text>
                    {withUnitPriceAndTotalAmount ?
                        <Text style={{ flexGrow: 1, width: `${columnSize}%` }}></Text> : null}
                    {withUnitPriceAndTotalAmount ?
                        <Text style={{ flexGrow: 1, width: `${columnSize}%` }}></Text> : null}
                    <NumericFormat
                        value={+itemTotal.totalQuantityActual}
                        displayType="text"
                        thousandSeparator
                        renderText={(value) => <Text style={
                            { flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }
                        }>{value}</Text>} />
                    <NumericFormat
                        value={+itemTotal.totalQuantityBadOrders}
                        displayType="text"
                        thousandSeparator
                        renderText={(value) => <Text style={
                            { flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }
                        }>{value}</Text>} />
                    <NumericFormat
                        value={+itemTotal.totalQuantityReturns}
                        displayType="text"
                        thousandSeparator
                        renderText={(value) => <Text style={
                            { flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }
                        }>{value}</Text>} />
                    <Text style={{ flexGrow: 1, width: `${columnSize}%` }}></Text>
                    <Text style={{ flexGrow: 1, width: `${columnSize}%` }}></Text>
                    <Text style={{ flexGrow: 1, width: '14%' }}></Text>
                </View>
                : <View key={uuidv4()} style={styles.tableHeading}>
                    <NumericFormat
                        value={+itemTotal.totalQuantityOriginal}
                        displayType="text"
                        thousandSeparator
                        renderText={(value) => <Text style={
                            { flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }
                        }>{value}</Text>} />
                    <Text style={{ flexGrow: 1, width: `${columnSize}%` }}>{itemTotal.code}</Text>
                    <Text style={{ flexGrow: 1, width: `${columnSize}%` }}>{itemTotal.name}</Text>
                    {withUnitPriceAndTotalAmount ?
                        <Text style={{ flexGrow: 1, width: `${columnSize}%` }}></Text> : null}
                    {withUnitPriceAndTotalAmount ?
                        <Text style={{ flexGrow: 1, width: `${columnSize}%` }}></Text> : null}
                    <Text style={{ flexGrow: 1, width: '40%' }}></Text>
                </View>
        );
    }

    const totals = <View key={uuidv4()} style={styles.store}>
        <Text key={uuidv4()} style={{ marginBottom: 5 }}>Grand Total</Text>
        {
            +purchaseOrder.status.id === 3
                ? <View key={uuidv4()} style={styles.tableHeading}>
                    <Text style={{ flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }}>Qty.</Text>
                    <Text style={{ flexGrow: 1, width: '13%' }}>Code</Text>
                    <Text style={{ flexGrow: 1, width: '13%' }}>Name</Text>
                    {withUnitPriceAndTotalAmount ?
                        <Text style={{ flexGrow: 1, width: `${columnSize}%` }}></Text> : null}
                    {withUnitPriceAndTotalAmount ?
                        <Text style={{ flexGrow: 1, width: `${columnSize}%` }}></Text> : null}
                    <Text style={{ flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }}>Qty. (Act.)</Text>
                    <Text style={{ flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }}>Qty. (BO)</Text>
                    <Text style={{ flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }}>Qty. (Ret.)</Text>
                    <Text style={{ flexGrow: 1, width: `${columnSize}%` }}></Text>
                    <Text style={{ flexGrow: 1, width: `${columnSize}%` }}></Text>
                    <Text style={{ flexGrow: 1, width: '14%' }}></Text>
                </View>
                : <View key={uuidv4()} style={styles.tableHeading}>
                    <Text style={{ flexGrow: 1, width: `${columnSize}%`, textAlign: 'right', paddingRight: 10 }}>Qty.</Text>
                    <Text style={{ flexGrow: 1, width: `${columnSize}%` }}>Code</Text>
                    <Text style={{ flexGrow: 1, width: `${columnSize}%` }}>Name</Text>
                    {withUnitPriceAndTotalAmount ?
                        <Text style={{ flexGrow: 1, width: `${columnSize}%` }}></Text> : null}
                    {withUnitPriceAndTotalAmount ?
                        <Text style={{ flexGrow: 1, width: `${columnSize}%` }}></Text> : null}
                    <Text style={{ flexGrow: 1, width: '40%' }}></Text>
                </View>
        }
        {items}
    </View>;

    let assignedStaff = [];
    if (purchaseOrderAssignedStaff) {
        assignedStaff = purchaseOrderAssignedStaff.map((staff) => {
            return <View key={uuidv4()} style={styles.tableRow}>
                <Text style={{ flexGrow: 1, width: '40%' }}>{staff.biometric_id}</Text>
                <Text style={{ flexGrow: 1, width: '60%' }}>{staff.name}</Text>
            </View>;
        });

        assignedStaff = <View key={uuidv4()} style={styles.assignedStaff}>
            <View key={uuidv4()} style={styles.sectionHeading}>
                <Text>Assigned Staff</Text>
            </View>
            <View key={uuidv4()} style={styles.tableHeading}>
                <Text style={{ flexGrow: 1, width: '40%' }}>ID</Text>
                <Text style={{ flexGrow: 1, width: '60%' }}>Name</Text>
            </View>
            {assignedStaff}
        </View>;
    }

    let expenses = [];
    if (purchaseOrderExpenses) {
        expenses = purchaseOrderExpenses.map((expense) => {
            return <View key={uuidv4()} style={styles.tableRow}>
                <Text style={{ flexGrow: 1, width: '20%' }}>{expense.name}</Text>
                <NumericFormat
                    value={+expense.amount_original}
                    displayType="text"
                    decimalScale="2"
                    fixedDecimalScale
                    thousandSeparator
                    renderText={(value) => <Text style={
                        { flexGrow: 1, textAlign: 'right', width: '25%' }
                    }>{value}</Text>} />
                {
                    +purchaseOrder.status.id === 3 &&
                    <NumericFormat
                        value={+expense.amount_actual}
                        displayType="text"
                        decimalScale="2"
                        fixedDecimalScale
                        thousandSeparator
                        renderText={(value) => <Text style={
                            { flexGrow: 1, textAlign: 'right', width: '25%' }
                        }>{value}</Text>} />
                }
                <Text style={{ flexGrow: 1, width: '29%' }}></Text>
            </View>;
        });

        expenses = <View key={uuidv4()} style={styles.expenses}>
            <View key={uuidv4()} style={styles.sectionHeading}>
                <Text>Allocated Expenses</Text>
            </View>
            <View key={uuidv4()} style={styles.tableHeading}>
                <Text style={{ flexGrow: 1, width: '20%' }}></Text>
                <Text style={{ flexGrow: 1, textAlign: 'right', width: '25%' }}>Amt. (Orig.)</Text>
                {
                    +purchaseOrder.status.id === 3 &&
                    <Text style={{ flexGrow: 1, textAlign: 'right', width: '25%' }}>Amt. (Act.)</Text>
                }
                <Text style={{ flexGrow: 1, textAlign: 'center', width: '29%' }}>Remarks</Text>
            </View>
            {expenses}

            {
                purchaseOrderExpensesMeta &&
                <View key={uuidv4()} style={styles.tableRow}>
                    <Text style={{ flexGrow: 1, width: '20%' }}></Text>
                    <NumericFormat
                        value={+purchaseOrderExpensesMeta.total_amount_original}
                        displayType="text"
                        decimalScale="2"
                        fixedDecimalScale
                        thousandSeparator
                        renderText={(value) => <Text style={
                            { borderTop: '1pt dotted black', flexGrow: 1, textAlign: 'right', width: '25%' }
                        }>{value}</Text>} />
                    {
                        +purchaseOrder.status.id === 3 &&
                        <NumericFormat
                            value={+purchaseOrderExpensesMeta.total_amount_actual}
                            displayType="text"
                            decimalScale="2"
                            fixedDecimalScale
                            thousandSeparator
                            renderText={(value) => <Text style={
                                { borderTop: '1pt dotted black', flexGrow: 1, textAlign: 'right', width: '25%' }
                            }>{value}</Text>} />
                    }
                    <Text style={{ flexGrow: 1, width: '29%' }}></Text>
                </View>
            }
            {
                +purchaseOrder.status.id === 3 && purchaseOrderExpensesMeta &&
                <View key={uuidv4()} style={styles.sectionHeading}>
                    <NumericFormat
                        value={+purchaseOrderExpensesMeta.change}
                        displayType="text"
                        decimalScale="2"
                        fixedDecimalScale
                        thousandSeparator
                        renderText={(value) => <Text>CHANGE: {value}</Text>} />
                </View>
            }
        </View>;
    }

    const orientation = +purchaseOrder.status.id === 3 ? "landscape" : "portrait";

    return (
        <Document>
            <Page size="LEGAL" orientation={orientation} style={styles.page}>
                <View key={uuidv4()}>
                    <View key={uuidv4()} style={styles.heading}>
                        <Text>GIFT OF GRACE FOOD MANUFACTURING CORPORATION</Text>
                        <Text>#5 Purok 6 Pinsao Pilot, Baguio City</Text>
                        <Text>Tel. No: 074-661-3554</Text>
                        <Text>Purchase Order #{purchaseOrder.code}</Text>
                    </View>
                    <View key={uuidv4()} style={styles.purchaseOrder}>
                        <Text>
                            Location: {purchaseOrder.location}&nbsp;
                            From: {purchaseOrder.from} To: {purchaseOrder.to}&nbsp;
                            ({purchaseOrder.trips} trip{purchaseOrder.trips > 1 ? "s" : ""})
                        </Text>
                    </View>
                    {details}
                    {totals}
                    <View key={uuidv4()} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {assignedStaff}
                        {expenses}
                    </View>
                    {
                        +purchaseOrder.status.id === 3
                            ? <View key={uuidv4()} style={styles.purchaseOrder}>
                                <Text style={{ marginTop: 11 }}>Completed By:</Text>
                                <Text style={{ marginTop: 22 }}>_________________________________</Text>
                            </View>
                            : <View key={uuidv4()} style={styles.purchaseOrder}>
                                <Text style={{ marginTop: 11 }}>Approved By:</Text>
                                <Text style={{ marginTop: 22 }}>_________________________________</Text>
                            </View>
                    }
                </View>
            </Page>
        </Document>
    );
}

export default PurchaseOrderDetailsPdfDocument;
