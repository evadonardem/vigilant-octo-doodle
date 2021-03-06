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

export default class PaySlipsPdfDocument extends Component {
    render() {
        const {
            payPeriod,
        } = this.props;

        const payslips = payPeriod.map((details, index) => {
            return <View key={`paylip${details.biometric_id}`} style={styles.payslip} wrap={false}>
                <View style={styles.payslipHeading}>
                    <Text>GIFT OF GRACE FOOD MANUFACTURING</Text>
                    <Text>#5 Purok 6 Pinsao Pilot, Baguio City</Text>
                    <Text>Tel. No: 074-661-3554</Text>
                    <Text>Payslip</Text>
                </View>
                <View>
                    <Text>ID NO: {details.biometric_id}</Text>
                    <Text>NAME: {details.biometric_name}</Text>
                    <Text>POSITION: {details.position}</Text>
                </View>
                <View style={{marginTop: 5}}>
                    <Text>RATE/HR: {details.effective_per_hour_rate}</Text>
                    <Text>RATE/DELIVERY: {details.effective_per_delivery_rate}</Text>
                </View>
                <View style={{marginTop: 5}}>
                    <Text>PAY PERIOD: {details.meta.from} - {details.meta.to}</Text>
                </View>
                <View style={styles.payslipSection}>
                    <Text>COMPENSATION</Text>
                    <View style={styles.payslipSectionDetail}>
                        <Text style={{flexGrow: 1, width: '40%'}}>TOTAL HOURS (REG)</Text>
                        <Text style={{flexGrow: 1, width: '30%', textAlign: 'right'}}>{details.meta.duration_total_hours}</Text>
                        <Text style={{flexGrow: 1, width: '30%', textAlign: 'right'}}>{details.meta.duration_total_hours_amount}</Text>
                    </View>
                    <View style={styles.payslipSectionDetail}>
                        <Text style={{flexGrow: 1, width: '40%'}}>TOTAL HOURS (OT)</Text>
                        <Text style={{flexGrow: 1, width: '30%', textAlign: 'right'}}>{details.meta.duration_total_hours_overtime}</Text>
                        <Text style={{flexGrow: 1, width: '30%', textAlign: 'right'}}>{details.meta.duration_total_hours_amount_overtime}</Text>
                    </View>
                    <View style={styles.payslipSectionDetail}>
                        <Text style={{flexGrow: 1, width: '40%'}}># OF DELIVERIES</Text>
                        <Text style={{flexGrow: 1, width: '30%', textAlign: 'right'}}>{details.meta.duration_total_deliveries}</Text>
                        <Text style={{flexGrow: 1, width: '30%', textAlign: 'right'}}>{details.meta.duration_total_deliveries_amount}</Text>
                    </View>
                    <View style={styles.payslipSectionDetail}>
                        <Text style={{flexGrow: 1, width: '40%'}}>TOTAL</Text>
                        <Text style={{flexGrow: 1, width: '30%', textAlign: 'right'}}></Text>
                        <Text style={
                            {
                                flexGrow: 1,
                                width: '30%',
                                textAlign: 'right',
                                borderTop: '1pt solid black;'
                            }
                        }>{details.meta.duration_total_gross_amount}</Text>
                    </View>
                </View>
                <View style={styles.payslipSection}>
                    <Text>DEDUCTIONS</Text>
                    {
                        details.deductions.map((deduction) => {
                            return <View key={`deduction${deduction.id}`} style={styles.payslipSectionDetail}>
                                <Text style={{flexGrow: 1, width: '40%'}}>{deduction.deduction_type.title}</Text>
                                <Text style={{flexGrow: 1, width: '30%', textAlign: 'right'}}></Text>
                                <Text style={{flexGrow: 1, width: '30%', textAlign: 'right'}}>{deduction.amount}</Text>
                            </View>;
                        })
                    }
                    <View style={styles.payslipSectionDetail}>
                        <Text style={{flexGrow: 1, width: '40%'}}>TOTAL</Text>
                        <Text style={{flexGrow: 1, width: '30%', textAlign: 'right'}}></Text>
                        <Text style={
                            {
                                flexGrow: 1,
                                width: '30%',
                                textAlign: 'right',
                                borderTop: '1pt solid black;'
                            }
                        }>{details.meta.duration_total_deductions_amount}</Text>
                    </View>
                </View>
                <View style={styles.payslipSection}>
                    <View style={styles.payslipSectionDetail}>
                        <Text style={{flexGrow: 1, width: '40%'}}>NET SALARY</Text>
                        <Text style={{flexGrow: 1, width: '30%', textAlign: 'right'}}></Text>
                        <Text style={
                            {
                                flexGrow: 1,
                                width: '30%',
                                textAlign: 'right',
                            }
                        }>{details.meta.duration_total_net_amount}</Text>
                    </View>
                </View>
                <View style={{marginTop: 22}}>
                    <Text>PREPARED BY:</Text>
                    <Text style={{borderBottom: '1pt solid black', marginTop: 22, width: '50%'}}></Text>
                </View>
            </View>;
        });

        return (
            <Document>
                <Page size="LEGAL" style={styles.page}>
                    {payslips}
                </Page>
            </Document>
        );
    }
}
