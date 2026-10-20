'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CustomerOrderView } from '@/components/CustomerOrderView';
import { AdminDashboardView } from '@/components/AdminDashboardView';
import { LoginModal } from '@/components/LoginModal';
import { HPPComponent, Order, Product } from '@/types';
import { INITIAL_HPP_COMPONENTS, INITIAL_PRODUCTS } from '@/lib/constants';
import { SEED_ORDERS } from '@/data/seedOrders';

export default function HomePage() {
  const [view, setView] = useState<'customer' | 'admin'>('customer');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [hppComponents, setHppComponents] = useState<HPPComponent[]>(INITIAL_HPP_COMPONENTS);
  const [loading, setLoading] = useState(true);

  // Check auth session
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      setIsAuthenticated(data.authenticated || false);
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [resOrders, resProducts, resHpp] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/products'),
        fetch('/api/hpp'),
      ]);

      const [ordersJson, productsJson, hppJson] = await Promise.all([
        resOrders.json(),
        resProducts.json(),
        resHpp.json(),
      ]);

      if (ordersJson.success && Array.isArray(ordersJson.data)) {
        setOrders(ordersJson.data);
      }
      if (productsJson.success && Array.isArray(productsJson.data)) {
        setProducts(productsJson.data);
      }
      if (hppJson.success && Array.isArray(hppJson.data)) {
        setHppComponents(hppJson.data);
      }
    } catch (err) {
      console.error('Failed fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
    fetchData();
  }, [checkSession, fetchData]);

  const handleOpenOwner = () => {
    if (isAuthenticated) {
      setView('admin');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setView('admin');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
    setView('customer');
  };

  // Order Actions
  const handleApproveOrder = async (order: Order) => {
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: 'lunas',
          fulfillmentStatus: order.fulfillmentStatus === 'menunggu' ? 'diproses' : order.fulfillmentStatus,
          paymentApprovedAt: new Date().toISOString(),
          paymentApprovedBy: 'Owner',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? data.data : o)));
      }
    } catch (err) {
      console.error('Failed to approve order:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['fulfillmentStatus']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fulfillmentStatus: status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.data : o)));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
    } catch (err) {
      console.error('Failed to delete order:', err);
    }
  };

  const handleCreateOrder = async (orderData: any) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (data.success) {
      setOrders((prev) => [data.data, ...prev]);
    } else {
      throw new Error(data.message || 'Gagal membuat pesanan');
    }
  };

  // HPP Actions
  const handleUpdateHppComponent = async (comp: HPPComponent) => {
    const res = await fetch('/api/hpp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comp),
    });
    const data = await res.json();
    if (data.success) {
      await fetchData(); // Refresh everything to update order profits
    }
  };

  const handleDeleteHppComponent = async (id: string) => {
    const res = await fetch(`/api/hpp?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      await fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {view === 'customer' ? (
        <CustomerOrderView
          products={products}
          onOrderPlaced={(newOrder) => {
            setOrders((prev) => [newOrder, ...prev]);
          }}
          onOpenOwnerLogin={handleOpenOwner}
        />
      ) : (
        <AdminDashboardView
          orders={orders}
          products={products}
          hppComponents={hppComponents}
          onRefresh={fetchData}
          onApproveOrder={handleApproveOrder}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
          onCreateOrder={handleCreateOrder}
          onUpdateHppComponent={handleUpdateHppComponent}
          onDeleteHppComponent={handleDeleteHppComponent}
          onLogout={handleLogout}
          onSwitchToCustomer={() => setView('customer')}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
