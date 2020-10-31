import React, { Component } from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import cookie from 'react-cookies';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        fontSize: '8pt',
    },
    section: {
        flexGrow: 1,
        margin: 5,
        padding: 5,
    },
    payslipHeading: {
        borderBottomColor: 'black',
        borderBottomStyle: 'solid',
        borderBottomWidth: '2px',
        fontWeight: 'bold',
        margin: 5,
        padding: 5,
        textAlign: 'center',
        width: '100%',
    },
    payslipSection: {
        flexGrow: 1,
        margin: 5,
        padding: 5,
        width: '50%',
    },
    payslipSectionDetail: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: 5,
    },
});

export default class PaySlipsPdfDocument extends Component {
    render() {
        const {
            payPeriod,
        } = this.props;

        const payslips = payPeriod.map((details) => {
            return <Page key={`payslip${details.biometric_id}`} size={[306, 396]} style={styles.page}>
                    <View style={styles.payslipHeading}>
                        <Text>GIFT OF GRACE FOOD MANUFACTURING</Text>
                        <Text>Payslip</Text>
                    </View>
                    <View style={styles.section}>
                        <Text>ID NO: {details.biometric_id}</Text>
                        <Text>NAME: {details.biometric_name}</Text>
                        <Text>POSITION: {details.position}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text>RATE/HR: {details.effective_per_hour_rate}</Text>
                        <Text>RATE/DELIVERY: {details.effective_per_delivery_rate}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text>PAY PERIOD: {details.meta.from} - {details.meta.to}</Text>
                    </View>
                    <View style={styles.payslipSection}>
                        <Text>COMPENSATION</Text>
                        <View style={styles.payslipSectionDetail}>
                            <Text style={{flexGrow: 1, width: '50%'}}>TOTAL HOURS</Text>
                            <Text style={{flexGrow: 1, width: '25%', textAlign: 'right'}}>{details.meta.duration_total_hours}</Text>
                            <Text style={{flexGrow: 1, width: '25%', textAlign: 'right'}}>{details.meta.duration_total_hours_amount}</Text>
                        </View>
                        <View style={styles.payslipSectionDetail}>
                            <Text style={{flexGrow: 1, width: '50%'}}># OF DELIVERIES</Text>
                            <Text style={{flexGrow: 1, width: '25%', textAlign: 'right'}}>{details.meta.duration_total_deliveries}</Text>
                            <Text style={{flexGrow: 1, width: '25%', textAlign: 'right'}}>{details.meta.duration_total_deliveries_amount}</Text>
                        </View>
                        <View style={styles.payslipSectionDetail}>
                            <Text style={{flexGrow: 1, width: '50%'}}>TOTAL</Text>
                            <Text style={{flexGrow: 1, width: '25%', textAlign: 'right'}}></Text>
                            <Text style={
                                {
                                    flexGrow: 1,
                                    width: '25%',
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
                                    <Text style={{flexGrow: 1, width: '50%'}}>{deduction.deduction_type.title}</Text>
                                    <Text style={{flexGrow: 1, width: '25%', textAlign: 'right'}}></Text>
                                    <Text style={{flexGrow: 1, width: '25%', textAlign: 'right'}}>{+deduction.amount}</Text>
                                </View>;
                            })
                        }
                        <View style={styles.payslipSectionDetail}>
                            <Text style={{flexGrow: 1, width: '50%'}}>TOTAL</Text>
                            <Text style={{flexGrow: 1, width: '25%', textAlign: 'right'}}></Text>
                            <Text style={
                                {
                                    flexGrow: 1,
                                    width: '25%',
                                    textAlign: 'right',
                                    borderTop: '1pt solid black;'
                                }
                            }>{details.meta.duration_total_deductions_amount}</Text>
                        </View>
                    </View>
                    <View style={styles.payslipSection}>
                        <View style={styles.payslipSectionDetail}>
                            <Text style={{flexGrow: 1, width: '50%'}}>NET SALARY</Text>
                            <Text style={{flexGrow: 1, width: '25%', textAlign: 'right'}}></Text>
                            <Text style={
                                {
                                    flexGrow: 1,
                                    width: '25%',
                                    textAlign: 'right',
                                }
                            }>{details.meta.duration_total_net_amount}</Text>
                        </View>
                    </View>
                </Page>;
        });

        return (
            <Document>
                {payslips}
            </Document>
        );
    }
}
