import axios from "axios";

export type TVietQR = {
  bankCode: string;
  bankName: string;
  bankAccount: string;
  userBankName: string;
  amount: string;
  content: string;
  qrCode: string;
  imgId: string;
  existing: number;
  transactionId: string;
  transactionRefId: string;
  qrLink: string;
  terminalCode: string;
  subTerminalCode: any;
  serviceCode: any;
  orderId: any;
  additionalData: any[];
};
export function generateVietQR(amount: number, content: string) {
  const url = `https://api.vietqr.org/vqr/api/qr/generate/unauthenticated`;
  const payload = {
    bankAccount: "9377196605",
    userBankName: "LE VIET THANG",
    bankCode: "VCB",
    amount: amount,
    content: content,
  };

  return axios.post(url, payload);
}
