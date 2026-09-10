'use client';

import React, { useState } from 'react';
import { format } from '@/lib/dateUtils';
import { useCart } from '@/context/CartContext';
import { buildWhatsAppUrl, WHATSAPP_NUMBER, JAZZCASH_NUMBER } from '@/lib/whatsapp';
import { X, MessageCircle, UploadCloud, CheckCircle2, ShieldCheck, AlertCircle, Banknote, Loader2 } from 'lucide-react';

type CheckoutModalProps = {
  selectedDate: Date | null;
  selectedSlot: string;
  onClose: () => void;
};

type PaymentMethodType = 'whatsapp' | 'jazzcash';

export default function CheckoutModal({
  selectedDate,
  selectedSlot,
  onClose,
}: CheckoutModalProps) {
  const { state, total, clearCart } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('jazzcash');
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<{
    id: string;
    type: PaymentMethodType;
    total: number;
    dateStr: string;
  } | null>(null);

  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  const validateInputs = () => {
    if (!customerName.trim()) return 'Please enter your full name.';
    if (!email.trim() || !email.includes('@')) return 'Please enter a valid email address for confirmation.';
    if (!phone.trim()) return 'Please enter your phone / WhatsApp number.';
    if (!address.trim()) return 'Please enter your delivery or pickup address in Gujranwala.';
    if (!selectedDate) return 'Please select a delivery date on the calendar.';
    if (!selectedSlot) return 'Please select a preferred time slot.';
    if (state.items.length === 0) return 'Your cart is empty.';
    if (paymentMethod === 'jazzcash' && !proofFile) {
      return 'Please upload your JazzCash transfer screenshot / receipt.';
    }
    return null;
  };

  const handleWhatsAppCheckout = () => {
    const error = validateInputs();
    if (error) {
      setErrorMessage(error);
      return;
    }
    setErrorMessage('');

    const currentTotal = total;

    const url = buildWhatsAppUrl({
      customerName,
      email,
      phone,
      address,
      date: dateStr,
      slot: selectedSlot,
      items: state.items,
      total: currentTotal,
      paymentType: 'whatsapp',
      notes,
    });

    window.open(url, '_blank');
    clearCart();
    setCompletedOrder({
      id: `WA-${Date.now().toString().slice(-6)}`,
      type: 'whatsapp',
      total: currentTotal,
      dateStr,
    });
  };

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateInputs();
    if (error) {
      setErrorMessage(error);
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);

    const currentTotal = total;

    try {
      let uploadedProofUrl: string | undefined;

      if (paymentMethod === 'jazzcash' && proofFile) {
        const formData = new FormData();
        formData.append('file', proofFile);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Failed to upload JazzCash payment receipt.');
        }
        uploadedProofUrl = uploadData.fileUrl;
      }

      const orderPayload = {
        date: dateStr,
        slot: selectedSlot,
        customer: {
          name: customerName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
        },
        items: state.items,
        total: currentTotal,
        paymentType: paymentMethod,
        proofUrl: uploadedProofUrl,
        notes: notes.trim() || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Order submission failed.');
      }

      clearCart();
      setCompletedOrder({
        id: data.orderId || `SB-${Date.now().toString().slice(-6)}`,
        type: paymentMethod,
        total: currentTotal,
        dateStr,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="cart-overlay flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 animate-scale-in shadow-2xl border border-pink-200">
          <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E6007E] bg-pink-50 px-3 py-1 rounded-full">
              Pre-Order Confirmed 🎉
            </span>
            <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#4A2C2A]">
              Thank You, {customerName}!
            </h2>
            <p className="text-xs sm:text-sm text-[#7A4C4A] leading-relaxed">
              Your order has been logged with ID{' '}
              <strong className="text-[#4A2C2A]">#{completedOrder.id}</strong>.
              A confirmation email has been dispatched to <strong>{email}</strong>.
            </p>
          </div>

          <div className="bg-[#FFF5F9] p-4 rounded-2xl border border-pink-200 text-xs text-left space-y-2 text-[#4A2C2A]">
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-bold">{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>City:</span>
              <span className="font-bold text-[#E6007E]">Gujranwala Only</span>
            </div>
            <div className="flex justify-between">
              <span>Bake Date:</span>
              <span className="font-bold">{completedOrder.dateStr} ({selectedSlot})</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-bold capitalize">{completedOrder.type === 'jazzcash' ? 'JazzCash Advance' : 'WhatsApp Order'}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-pink-200 text-sm">
              <span className="font-bold">Grand Total:</span>
              <span className="font-bold text-[#E6007E] font-playfair text-base">
                Rs. {completedOrder.total.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full py-3 text-xs justify-center"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Connect on WhatsApp for Live Updates</span>
            </a>

            <button onClick={onClose} className="btn-secondary w-full py-3 text-xs justify-center">
              Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-overlay flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-pink-200 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 border-b border-pink-100 flex items-center justify-between bg-[#FDF0F5] sticky top-0 z-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E6007E]">
              Checkout Flow • Gujranwala
            </span>
            <h2 className="font-playfair text-xl sm:text-2xl font-bold text-[#4A2C2A]">
              Complete Your Pre-Order
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white text-[#4A2C2A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          <div className="bg-[#FFF5F9] rounded-2xl border border-pink-200 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-pink-200/80 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4A2C2A]">
                Schedule Summary
              </span>
              <span className="text-xs font-bold text-[#E6007E]">
                {selectedDate ? format(selectedDate, 'EEE, MMMM d, yyyy') : 'No date'} • {selectedSlot}
              </span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {state.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs text-[#4A2C2A]">
                  <span className="truncate pr-2">
                    {item.name} ({item.variant}{item.flavor ? ` - ${item.flavor}` : ''}) × {item.quantity}
                  </span>
                  <span className="font-bold shrink-0">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-2 border-t border-pink-200 text-sm font-bold text-[#4A2C2A]">
              <span>Order Grand Total:</span>
              <span className="text-[#E6007E] font-playfair text-lg">
                Rs. {total.toLocaleString()}
              </span>
            </div>
          </div>

          <form onSubmit={handleDirectSubmit} className="space-y-5">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A2C2A] border-b border-pink-100 pb-2">
                1. Customer & Delivery Information (Gujranwala Only)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4A2C2A] block">
                    Full Name <span className="text-[#E6007E]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Khan"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs px-4 py-2.5 rounded-xl border border-pink-200 bg-[#FFF5F9] focus:outline-none focus:border-[#E6007E]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4A2C2A] block">
                    Email Address (For Order Receipts) <span className="text-[#E6007E]">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. sarah@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-4 py-2.5 rounded-xl border border-pink-200 bg-[#FFF5F9] focus:outline-none focus:border-[#E6007E]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#4A2C2A] block">
                  Phone / WhatsApp Number <span className="text-[#E6007E]">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +92 300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 rounded-xl border border-pink-200 bg-[#FFF5F9] focus:outline-none focus:border-[#E6007E]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#4A2C2A] block">
                  Delivery Address (Gujranwala Only) <span className="text-[#E6007E]">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="House/Apartment #, Street, Model Town / DC Colony / Cantt / Wapda Town, Gujranwala..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 rounded-xl border border-pink-200 bg-[#FFF5F9] focus:outline-none focus:border-[#E6007E] resize-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#4A2C2A] block">
                  Special Instructions / Allergies (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please add ribbon packaging, leave at security gate..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 rounded-xl border border-pink-200 bg-[#FFF5F9] focus:outline-none focus:border-[#E6007E]"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-pink-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A2C2A]">
                  2. Select Payment Option (No COD)
                </h3>
                <span className="text-[10px] bg-pink-100 text-[#E6007E] font-bold px-2 py-0.5 rounded-full">
                  Advance Payment Only
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('jazzcash')}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2 ${
                    paymentMethod === 'jazzcash'
                      ? 'bg-pink-50 border-[#E6007E] shadow-md'
                      : 'bg-[#FFF5F9] border-pink-200 hover:border-[#E6007E]/50'
                  }`}
                >
                  <Banknote className="w-6 h-6 text-[#E6007E]" />
                  <div>
                    <span className="text-xs font-bold text-[#4A2C2A] block">JazzCash Transfer</span>
                    <span className="text-[10px] text-[#7A4C4A]">Upload transfer screenshot</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('whatsapp')}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2 ${
                    paymentMethod === 'whatsapp'
                      ? 'bg-emerald-50 border-[#25D366] shadow-md'
                      : 'bg-[#FFF5F9] border-pink-200 hover:border-[#25D366]/50'
                  }`}
                >
                  <MessageCircle className="w-6 h-6 text-[#25D366]" />
                  <div>
                    <span className="text-xs font-bold text-[#4A2C2A] block">Instant WhatsApp Pre-Order</span>
                    <span className="text-[10px] text-[#7A4C4A]">Send structured order directly</span>
                  </div>
                </button>
              </div>

              {paymentMethod === 'jazzcash' && (
                <div className="bg-[#FFF5F9] border border-pink-200 p-4 rounded-2xl space-y-3 animate-fade-in">
                  <div className="space-y-1 text-xs text-[#4A2C2A]">
                    <p className="font-bold text-[#E6007E]">📱 JazzCash Account Details:</p>
                    <p><strong>Account Title:</strong> SusatBakes</p>
                    <p><strong>JazzCash Mobile Number:</strong> <span className="font-bold text-[#E6007E] text-sm">{JAZZCASH_NUMBER}</span> (+92 308 4977958)</p>
                    <p className="text-[11px] text-[#7A4C4A] pt-1">
                      Transfer <strong>Rs. {total.toLocaleString()}</strong> to the number above and upload the confirmation screenshot below.
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-[#4A2C2A] block">
                      Upload JazzCash Payment Screenshot / Receipt: <span className="text-[#E6007E]">*</span>
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-pink-300 rounded-2xl cursor-pointer hover:bg-white transition-colors bg-white/60">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      />
                      {proofFile ? (
                        <div className="flex items-center gap-2 text-xs text-[#4A2C2A] font-bold">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>{proofFile.name} ({(proofFile.size / 1024).toFixed(0)} KB)</span>
                        </div>
                      ) : (
                        <div className="text-center space-y-1">
                          <UploadCloud className="w-6 h-6 text-[#E6007E] mx-auto" />
                          <p className="text-xs font-semibold text-[#4A2C2A]">Click or Drag to Upload Receipt</p>
                          <p className="text-[10px] text-[#7A4C4A]">JPG, PNG, WebP or PDF (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-3">
              {paymentMethod === 'whatsapp' ? (
                <button
                  type="button"
                  onClick={handleWhatsAppCheckout}
                  className="w-full btn-whatsapp py-3.5 text-sm justify-center shadow-lg hover:shadow-xl"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Send Order to WhatsApp (+92 370 6572463)</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-3.5 text-sm justify-center shadow-lg hover:shadow-xl disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Order & Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Submit Pre-Order — Rs. {total.toLocaleString()}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
