import React, { useState } from 'react';
import { 
  Truck, 
  PackageCheck, 
  QrCode, 
  FileText, 
  Printer, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Barcode, 
  Send,
  MapPin
} from 'lucide-react';
import { OrderFulfillment } from '../types';

interface ShippingFulfillmentProps {
  orders: OrderFulfillment[];
  onUpdateOrderStatus: (id: string, status: OrderFulfillment['status']) => void;
}

export const ShippingFulfillment: React.FC<ShippingFulfillmentProps> = ({
  orders,
  onUpdateOrderStatus,
}) => {
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<OrderFulfillment | null>(null);
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState<OrderFulfillment | null>(null);

  const ordersToShip = orders.filter((o) => o.status === 'To Ship');
  const ordersInTransit = orders.filter((o) => o.status === 'In Transit' || o.status === 'Label Generated');
  const ordersDelivered = orders.filter((o) => o.status === 'Delivered');

  return (
    <div id="shipping-fulfillment-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Truck className="w-3.5 h-3.5" />
              <span>Fulfillment & Carrier Logistics Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Order Fulfillment & Shipping Labels
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Automate packing slips, generate QR shipping labels with carrier barcode tracking (USPS, FedEx, UPS), and monitor delivery status.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
            <span className="font-bold text-amber-400 text-sm">{ordersToShip.length}</span>
            <span>Orders Ready to Ship</span>
          </div>
        </div>
      </div>

      {/* Kanban Order Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: To Ship */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-white flex items-center">
              <Clock className="w-4 h-4 mr-2 text-amber-400" />
              Ready To Ship ({ordersToShip.length})
            </h3>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          </div>

          {ordersToShip.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No pending orders to ship.</div>
          ) : (
            ordersToShip.map((order) => (
              <div key={order.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-amber-400 font-mono font-bold">{order.orderNumber}</div>
                    <div className="font-bold text-white text-xs mt-0.5">{order.cardTitle}</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">${order.salePrice.toFixed(2)}</span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{order.buyerName} • {order.buyerAddress}</span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedOrderForSlip(order)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center space-x-1"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Packing Slip</span>
                  </button>

                  <button
                    onClick={() => setSelectedOrderForLabel(order)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center space-x-1"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>Generate Label</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Column 2: In Transit */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-white flex items-center">
              <Truck className="w-4 h-4 mr-2 text-indigo-400" />
              In Transit ({ordersInTransit.length})
            </h3>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
          </div>

          {ordersInTransit.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No active shipments in transit.</div>
          ) : (
            ordersInTransit.map((order) => (
              <div key={order.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-indigo-400 font-mono font-bold">{order.orderNumber}</div>
                    <div className="font-bold text-white text-xs mt-0.5">{order.cardTitle}</div>
                  </div>
                  <span className="text-xs font-bold text-indigo-300">{order.carrier}</span>
                </div>

                <div className="text-[10px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800 font-mono flex items-center justify-between">
                  <span className="truncate">Track: {order.trackingNumber}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 ml-1" />
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Shipped: {order.shipDate || 'Recently'}</span>
                  <button
                    onClick={() => onUpdateOrderStatus(order.id, 'Delivered')}
                    className="px-2.5 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 text-[10px] font-bold"
                  >
                    Simulate Delivered
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Column 3: Delivered */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-white flex items-center">
              <PackageCheck className="w-4 h-4 mr-2 text-emerald-400" />
              Delivered & Payout ({ordersDelivered.length})
            </h3>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>

          {ordersDelivered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No delivered orders yet.</div>
          ) : (
            ordersDelivered.map((order) => (
              <div key={order.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-white">{order.cardTitle}</span>
                  <span className="font-bold text-emerald-400">+${order.netPayout.toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Buyer: {order.buyerName}</span>
                  <span className="text-emerald-500 flex items-center font-bold">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Delivered
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Shipping Label Modal */}
      {selectedOrderForLabel && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Prepaid Carrier Shipping Label</h3>
              </div>
              <button onClick={() => setSelectedOrderForLabel(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            {/* Printable Thermal Label Mockup */}
            <div className="bg-white text-slate-950 p-5 rounded-xl border-2 border-slate-900 font-mono text-xs space-y-3 shadow-inner">
              <div className="flex justify-between items-start border-b border-slate-900 pb-2">
                <div>
                  <div className="font-extrabold text-sm uppercase">{selectedOrderForLabel.carrier} GROUND ADVANTAGE</div>
                  <div className="text-[10px]">PREPAID TRACKING LABEL</div>
                </div>
                <div className="text-right text-[10px]">
                  <div>P/O: {selectedOrderForLabel.orderNumber}</div>
                  <div>WT: 0.25 LBS (Slab Bubble Mailer)</div>
                </div>
              </div>

              <div>
                <div className="text-[9px] text-slate-600 uppercase font-bold">SHIP FROM:</div>
                <div className="font-bold">PokéFlip Vault #182</div>
                <div className="text-[10px]">100 Collector Way, San Jose, CA 95110</div>
              </div>

              <div className="pt-2 border-t border-slate-900">
                <div className="text-[9px] text-slate-600 uppercase font-bold">SHIP TO:</div>
                <div className="font-bold text-sm">{selectedOrderForLabel.buyerName}</div>
                <div className="text-xs">{selectedOrderForLabel.buyerAddress}</div>
              </div>

              {/* Barcode representation */}
              <div className="pt-3 text-center border-t border-slate-900">
                <div className="tracking-widest font-bold text-sm mb-1">{selectedOrderForLabel.trackingNumber}</div>
                <div className="bg-slate-900 text-white p-2 rounded flex justify-center">
                  <Barcode className="w-full h-12" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Label</span>
              </button>

              <button
                onClick={() => {
                  onUpdateOrderStatus(selectedOrderForLabel.id, 'In Transit');
                  setSelectedOrderForLabel(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Confirm Shipped
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Packing Slip Modal */}
      {selectedOrderForSlip && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Buyer Receipt & Packing Slip</h3>
              <button onClick={() => setSelectedOrderForSlip(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3 font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white">PokéFlip.AI Fulfillment Slip</span>
                <span className="text-slate-400">{selectedOrderForSlip.createdAt}</span>
              </div>
              <div>Order #: {selectedOrderForSlip.orderNumber}</div>
              <div>Buyer: {selectedOrderForSlip.buyerName}</div>
              <div>Item: {selectedOrderForSlip.cardTitle}</div>
              <div>Paid Amount: ${selectedOrderForSlip.salePrice.toFixed(2)}</div>
            </div>

            <button
              onClick={() => setSelectedOrderForSlip(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
