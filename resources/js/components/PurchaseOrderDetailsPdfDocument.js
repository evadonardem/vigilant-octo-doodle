import React, { Component } from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { v4 as uuidv4 } from 'uuid';

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
        // borderTop: '2pt solid black',
        // borderBottom: '2pt solid black',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tableRow: {
        // borderBottom: '1pt solid black',
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

export default class PurchaseOrderDetailsPdfDocument extends Component {
    render() {
        const {
            purchaseOrder,
            purchaseOrderStores,
            purchaseOrderAssignedStaff,
            purchaseOrderExpenses,
            purchaseOrderExpensesMeta,
        } = this.props;

        let itemsTotal = {};

        const details = purchaseOrderStores ? purchaseOrderStores.map((store) => {
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
                    ? <View style={styles.tableRow}>
                        <Text style={{flexGrow: 1, width: '15%'}}>{item.code}</Text>
                        <Text style={{flexGrow: 1, width: '15%'}}>{item.name}</Text>
                        <Text style={{flexGrow: 1, width: '8%'}}>{+item.quantity_original}</Text>
                        <Text style={{flexGrow: 1, width: '8%'}}>{+item.quantity_actual}</Text>
                        <Text style={{flexGrow: 1, width: '8%'}}>{+item.quantity_bad_orders}</Text>
                        <Text style={{flexGrow: 1, width: '8%'}}>{+item.quantity_returns}</Text>
                        <Text style={{flexGrow: 1, width: '11%'}}>{item.delivery_receipt_no}</Text>
                        <Text style={{flexGrow: 1, width: '11%'}}>{item.booklet_no}</Text>
                        <Text style={{flexGrow: 1, width: '16%'}}>{item.remarks}</Text>
                    </View>
                    : <View style={styles.tableRow}>
                        <Text style={{flexGrow: 1, width: '35%'}}>{item.code}</Text>
                        <Text style={{flexGrow: 1, width: '35%'}}>{item.name}</Text>
                        <Text style={{flexGrow: 1, width: '30%'}}>{+item.quantity_original}</Text>
                    </View>;
            });

            const promodisers = store.promodisers.map((promodiser) => {
                return `${promodiser.name} ${promodiser.contact_no}`;
            });

            return <View key={store.id} style={styles.store}>
                <Text>({store.code}) {store.name} | Address: {store.address_line}</Text>
                <Text style={{marginBottom: 5}}>Promodiser(s): {promodisers.join(', ')}</Text>
                {
                    +purchaseOrder.status.id === 3
                        ? <View style={styles.tableHeading}>
                            <Text style={{flexGrow: 1, width: '15%'}}>Code</Text>
                            <Text style={{flexGrow: 1, width: '15%'}}>Name</Text>
                            <Text style={{flexGrow: 1, width: '8%'}}>Qty. (Orig.)</Text>
                            <Text style={{flexGrow: 1, width: '8%'}}>Qty. (Act.)</Text>
                            <Text style={{flexGrow: 1, width: '8%'}}>Qty. (BO)</Text>
                            <Text style={{flexGrow: 1, width: '8%'}}>Qty. (Ret.)</Text>
                            <Text style={{flexGrow: 1, width: '11%'}}>DR#</Text>
                            <Text style={{flexGrow: 1, width: '11%'}}>B#</Text>
                            <Text style={{flexGrow: 1, width: '16%'}}>Remarks</Text>
                        </View>
                        : <View style={styles.tableHeading}>
                            <Text style={{flexGrow: 1, width: '35%'}}>Code</Text>
                            <Text style={{flexGrow: 1, width: '35%'}}>Name</Text>
                            <Text style={{flexGrow: 1, width: '30%'}}>Qty. (Orig.)</Text>
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
                    ? <View key={itemTotal.id} style={styles.tableHeading}>
                        <Text style={{flexGrow: 1, width: '15%'}}>{itemTotal.code}</Text>
                        <Text style={{flexGrow: 1, width: '15%'}}>{itemTotal.name}</Text>
                        <Text style={{flexGrow: 1, width: '8%'}}>{itemTotal.totalQuantityOriginal}</Text>
                        <Text style={{flexGrow: 1, width: '8%'}}>{itemTotal.totalQuantityActual}</Text>
                        <Text style={{flexGrow: 1, width: '8%'}}>{itemTotal.totalQuantityBadOrders}</Text>
                        <Text style={{flexGrow: 1, width: '8%'}}>{itemTotal.totalQuantityReturns}</Text>
                        <Text style={{flexGrow: 1, width: '11%'}}></Text>
                        <Text style={{flexGrow: 1, width: '11%'}}></Text>
                        <Text style={{flexGrow: 1, width: '16%'}}></Text>
                    </View>
                    : <View key={itemTotal.id} style={styles.tableHeading}>
                        <Text style={{flexGrow: 1, width: '35%'}}>{itemTotal.code}</Text>
                        <Text style={{flexGrow: 1, width: '35%'}}>{itemTotal.name}</Text>
                        <Text style={{flexGrow: 1, width: '30%'}}>{itemTotal.totalQuantityOriginal}</Text>
                    </View>
            );
        }

        const totals = <View style={styles.store}>
            <Text style={{marginBottom: 5}}>Grand Total</Text>
            {
                +purchaseOrder.status.id === 3
                ? <View style={styles.tableHeading}>
                    <Text style={{flexGrow: 1, width: '15%'}}>Code</Text>
                    <Text style={{flexGrow: 1, width: '15%'}}>Name</Text>
                    <Text style={{flexGrow: 1, width: '8%'}}>Qty. (Orig.)</Text>
                    <Text style={{flexGrow: 1, width: '8%'}}>Qty. (Act.)</Text>
                    <Text style={{flexGrow: 1, width: '8%'}}>Qty. (BO)</Text>
                    <Text style={{flexGrow: 1, width: '8%'}}>Qty. (Ret.)</Text>
                    <Text style={{flexGrow: 1, width: '11%'}}></Text>
                    <Text style={{flexGrow: 1, width: '11%'}}></Text>
                    <Text style={{flexGrow: 1, width: '16%'}}></Text>
                </View>
                : <View style={styles.tableHeading}>
                    <Text style={{flexGrow: 1, width: '35%'}}>Code</Text>
                    <Text style={{flexGrow: 1, width: '35%'}}>Name</Text>
                    <Text style={{flexGrow: 1, width: '30%'}}>Qty. (Orig.)</Text>
                </View>
            }
            { items }
        </View>;

        let assignedStaff = [];
        if (purchaseOrderAssignedStaff) {
            assignedStaff = purchaseOrderAssignedStaff.map((staff) => {
                return <View key={uuidv4()} style={styles.tableRow}>
                    <Text style={{flexGrow: 1, width: '40%'}}>{staff.biometric_id}</Text>
                    <Text style={{flexGrow: 1, width: '60%'}}>{staff.name}</Text>
                </View>;
            });

            assignedStaff = <View key={uuidv4()} style={styles.assignedStaff}>
                <View key={uuidv4()} style={styles.sectionHeading}>
                    <Text>Assigned Staff</Text>
                </View>
                <View key={uuidv4()} style={styles.tableHeading}>
                    <Text style={{flexGrow: 1, width: '40%'}}>ID</Text>
                    <Text style={{flexGrow: 1, width: '60%'}}>Name</Text>
                </View>
                {assignedStaff}
            </View>;
        }

        let expenses = [];
        if (purchaseOrderExpenses) {
            expenses = purchaseOrderExpenses.map((expense) => {
                return <View key={uuidv4()} style={styles.tableRow}>
                    <Text style={{flexGrow: 1, width: '20%'}}>{expense.name}</Text>
                    <Text style={{flexGrow: 1, textAlign:'right', width: '25%'}}>{expense.amount_original}</Text>
                    {
                        +purchaseOrder.status.id === 3 &&
                        <Text style={{flexGrow: 1, textAlign:'right', width: '25%'}}>{expense.amount_actual}</Text>
                    }
                    <Text style={{flexGrow: 1, width: '29%'}}></Text>
                </View>;
            });

            expenses = <View key={uuidv4()} style={styles.expenses}>
                <View key={uuidv4()} style={styles.sectionHeading}>
                    <Text>Allocated Expenses</Text>
                </View>
                <View key={uuidv4()} style={styles.tableHeading}>
                    <Text style={{flexGrow: 1, width: '20%'}}></Text>
                    <Text style={{flexGrow: 1, textAlign:'right', width: '25%'}}>Amt. (Orig.)</Text>
                    {
                        +purchaseOrder.status.id === 3 &&
                        <Text style={{flexGrow: 1, textAlign:'right', width: '25%'}}>Amt. (Act.)</Text>
                    }
                    <Text style={{flexGrow: 1, textAlign:'center', width: '29%'}}>Remarks</Text>
                </View>
                {expenses}

                {
                    purchaseOrderExpensesMeta &&
                    <View key={uuidv4()} style={styles.tableRow}>
                        <Text style={{flexGrow: 1, width: '20%'}}></Text>
                        <Text style={{borderTop: '1pt dotted black', flexGrow: 1, textAlign:'right', width: '25%'}}>{parseFloat(purchaseOrderExpensesMeta.total_amount_original).toFixed(2)}</Text>
                        {
                            +purchaseOrder.status.id === 3 &&
                            <Text style={{borderTop: '1pt dotted black', flexGrow: 1, textAlign:'right', width: '25%'}}>{parseFloat(purchaseOrderExpensesMeta.total_amount_actual).toFixed(2)}</Text>
                        }
                        <Text style={{flexGrow: 1, width: '29%'}}></Text>
                    </View>
                }
                {
                    +purchaseOrder.status.id === 3 && purchaseOrderExpensesMeta &&
                    <View key={uuidv4()} style={styles.sectionHeading}>
                        <Text>CHANGE: {parseFloat(purchaseOrderExpensesMeta.change).toFixed(2)}</Text>
                    </View>
                }
            </View>;
        }

        const orientation = +purchaseOrder.status.id === 3 ? "landscape" : "portrait";

        return (
            <Document>
                <Page size="LEGAL" orientation={orientation} style={styles.page}>
                    <View>
                        <View style={styles.heading}>
                            <Text>GIFT OF GRACE FOOD MANUFACTURING</Text>
                            <Text>#5 Purok 6 Pinsao Pilot, Baguio City</Text>
                            <Text>Tel. No: 074-661-3554</Text>
                            <Text>Purchase Order</Text>
                        </View>
                        <View style={styles.purchaseOrder}>
                            <Text>
                                Code: {purchaseOrder.code}&nbsp;
                                Location: {purchaseOrder.location}&nbsp;
                                From: {purchaseOrder.from} To: {purchaseOrder.to}&nbsp;
                                ({purchaseOrder.trips} trip{purchaseOrder.trips > 1 ? "s" : ""})
                            </Text>
                        </View>
                        {details}
                        {totals}
                        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                            {assignedStaff}
                            {expenses}
                        </View>
                        {
                            +purchaseOrder.status.id === 3
                                ? <View style={styles.purchaseOrder}>
                                    <Text style={{marginTop: 11}}>Completed By:</Text>
                                    <Text style={{marginTop: 22}}>_________________________________</Text>
                                </View>
                                : <View style={styles.purchaseOrder}>
                                    <Text style={{marginTop: 11}}>Approved By:</Text>
                                    <Text style={{marginTop: 22}}>_________________________________</Text>
                                </View>
                        }
                    </View>
                </Page>
            </Document>
        );
    }
}
