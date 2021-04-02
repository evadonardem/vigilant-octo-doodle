import React, { Component } from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import cookie from 'react-cookies';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        fontSize: '10pt',
        margin: 0,
        padding: 10,
    },
    payslip: {
        border: '1pt solid black',
        float: 'left',
        padding: 10,
        width: '50%',
    },
    payslipHeading: {
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    payslipSection: {
        marginTop: 5,
    },
    payslipSectionDetail: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: 10,
    },
});

export default class PurchaseOrderDetailsPdfDocument extends Component {
    constructor(props) {
        super(props);

        window.console.log("Update PDF document...");
    }

    render() {
        const {
            purchaseOrder,
        } = this.props;

        return (
            <Document>
                <Page size="LEGAL" style={styles.page}>
                    <View>
                        <View style={styles.payslipHeading}>
                            <Text>GIFT OF GRACE FOOD MANUFACTURING</Text>
                            <Text>#5 Purok 6 Pinsao Pilot, Baguio City</Text>
                            <Text>Tel. No: 074-661-3554</Text>
                            <Text>Purchase Order</Text>
                        </View>
                        <View>
                            <Text>Code: {purchaseOrder.code}</Text>
                            <Text>
                                Location: {purchaseOrder.location}&nbsp;
                                From: {purchaseOrder.from} To: {purchaseOrder.to}&nbsp;
                                ({purchaseOrder.days} day{purchaseOrder.days > 0 ? "s" : ""})
                            </Text>
                        </View>
                    </View>
                </Page>
            </Document>
        );
    }
}
