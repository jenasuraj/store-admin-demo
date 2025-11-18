import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload } from 'lucide-react';
import {
  getCustomerTotalBalance,
  settleCustomerPayment,
  saveSettlementEntry,
  updateLedgerEntry,
  getLedgerEntries,
} from '@/lib/storage';

interface PaymentModalProps {
  customerId: string;
  customerName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({
  customerId,
  customerName,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const balance = getCustomerTotalBalance(customerId);
  const [paymentMode, setPaymentMode] = useState<'GPAY' | 'BANK_TRANSFER' | 'CASH'>('CASH');
  const [paidAmount, setPaidAmount] = useState(balance.pending);
  const [description, setDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // <CHANGE> Handle payment settlement with multi-entry support
  const handleSettlePayment = () => {
    if (paidAmount <= 0 || paidAmount > balance.pending) {
      alert('Please enter a valid amount');
      return;
    }

    // Get all pending entries for this customer
    const allEntries = getLedgerEntries();
    const pendingEntries = allEntries.filter(
      e => e.customerId === customerId && e.paymentStatus === 'pending'
    );

    let remaining = paidAmount;

    // Mark entries as paid starting from the oldest
    pendingEntries
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach(entry => {
        if (remaining >= entry.editableAmount) {
          updateLedgerEntry(entry.id, { paymentStatus: 'paid' });
          remaining -= entry.editableAmount;
        }
      });

    // Create settlement entry
    const settlement = {
      id: `settlement-${Date.now()}`,
      customerId,
      paidAmount,
      paymentMode,
      description,
      receiptUrl: receiptFile ? URL.createObjectURL(receiptFile) : undefined,
      createdAt: new Date().toISOString(),
    };

    saveSettlementEntry(settlement);
    alert('Payment settled successfully!');
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-slate-200 bg-white rounded-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Settle Payment</h2>
          <Button 
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-900"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* Customer Info */}
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <p className="text-sm text-slate-600">Customer</p>
            <p className="font-semibold text-slate-900">{customerName}</p>
          </div>

          {/* Balance Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <p className="text-xs text-red-600 font-medium">Pending</p>
              <p className="text-lg font-bold text-red-700">₹{balance.pending.toFixed(2)}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
              <p className="text-xs text-emerald-600 font-medium">Paid</p>
              <p className="text-lg font-bold text-emerald-700">₹{balance.paid.toFixed(2)}</p>
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
            <Select value={paymentMode} onValueChange={(value: any) => setPaymentMode(value)}>
              <SelectTrigger className="border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GPAY">GPay</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Paid Amount</label>
            <Input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
              max={balance.pending}
              className="border-slate-300"
            />
            <p className="text-xs text-slate-500 mt-1">Max: ₹{balance.pending.toFixed(2)}</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this payment"
              className="border-slate-300 resize-none text-sm"
              rows={2}
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Receipt (Optional)</label>
            <label className="border-2 border-dashed border-slate-300 rounded-lg p-4 cursor-pointer hover:border-slate-400 transition-colors flex items-center justify-center">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <div className="flex items-center gap-2 text-slate-600">
                <Upload className="w-4 h-4" />
                <span className="text-sm">{receiptFile ? receiptFile.name : 'Upload receipt'}</span>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSettlePayment}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Settle Payment
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1 border-slate-300"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}