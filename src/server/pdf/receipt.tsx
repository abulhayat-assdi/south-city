import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Money receipt PDF (spec §8/§21). 🔴 Confirm final format (header, serial, signature)
// with the owner before go-live.

export interface ReceiptData {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  receiptNo: string;
  paymentDate: string; // DD/MM/YYYY
  method: string;
  referenceNo?: string | null;
  amountText: string; // "৳ 50,000"
  saleCode: string;
  projectName: string;
  plotLabel: string;
  customerName: string;
  customerCode: string;
  recordedBy: string;
  note?: string | null;
}

const s = StyleSheet.create({
  page: { padding: 36, fontSize: 11, fontFamily: 'Helvetica', color: '#1F2430' },
  header: { borderBottom: '2 solid #14245C', paddingBottom: 10, marginBottom: 16 },
  company: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#14245C' },
  sub: { fontSize: 9, color: '#5B6472', marginTop: 2 },
  title: { fontSize: 13, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 12, color: '#14245C' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: '#5B6472' },
  value: { fontFamily: 'Helvetica-Bold' },
  amountBox: { marginTop: 14, marginBottom: 14, padding: 12, backgroundColor: '#F6F7FA', borderRadius: 4 },
  amount: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#14245C' },
  sign: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 48 },
  signBox: { width: 180, borderTop: '1 solid #5B6472', paddingTop: 4, textAlign: 'center', fontSize: 9, color: '#5B6472' },
  foot: { position: 'absolute', bottom: 28, left: 36, right: 36, fontSize: 8, color: '#9AA3B2', textAlign: 'center' },
});

export function ReceiptDocument({ d }: { d: ReceiptData }) {
  return (
    <Document>
      <Page size="A5" orientation="landscape" style={s.page}>
        <View style={s.header}>
          <Text style={s.company}>{d.companyName}</Text>
          <Text style={s.sub}>{d.companyAddress}  ·  {d.companyPhone}</Text>
        </View>

        <Text style={s.title}>MONEY RECEIPT / টাকা প্রাপ্তির রশিদ</Text>

        <View style={s.row}><Text style={s.label}>Receipt No</Text><Text style={s.value}>{d.receiptNo}</Text></View>
        <View style={s.row}><Text style={s.label}>Date</Text><Text style={s.value}>{d.paymentDate}</Text></View>
        <View style={s.row}><Text style={s.label}>Received from</Text><Text style={s.value}>{d.customerName} ({d.customerCode})</Text></View>
        <View style={s.row}><Text style={s.label}>Project / Plot</Text><Text style={s.value}>{d.projectName} · {d.plotLabel}</Text></View>
        <View style={s.row}><Text style={s.label}>Sale Ref</Text><Text style={s.value}>{d.saleCode}</Text></View>
        <View style={s.row}><Text style={s.label}>Payment method</Text><Text style={s.value}>{d.method}{d.referenceNo ? ` (${d.referenceNo})` : ''}</Text></View>
        {d.note ? <View style={s.row}><Text style={s.label}>Note</Text><Text style={s.value}>{d.note}</Text></View> : null}

        <View style={s.amountBox}>
          <Text style={s.label}>Amount received</Text>
          <Text style={s.amount}>{d.amountText}</Text>
        </View>

        <View style={s.sign}>
          <Text style={s.signBox}>Received by: {d.recordedBy}</Text>
          <Text style={s.signBox}>Authorized signature</Text>
        </View>

        <Text style={s.foot}>
          This receipt records a payment made offline. The system does not process, transfer or hold money.
        </Text>
      </Page>
    </Document>
  );
}
