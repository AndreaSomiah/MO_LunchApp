import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MenuGrid from '@/components/menu/MenuGrid';
import CartDrawer from '@/components/cart/CartDrawer';
import { OrdersList } from '@/components/orders/OrdersList';
import { useAuth } from '@/hooks/useAuth';

const OrdersPage = (): JSX.Element => {
  const { user, hasSeenProfileNudge, dismissProfileNudge } = useAuth();
  const [tab, setTab] = useState<string>('browse');
  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin';
  const showNudge = !hasSeenProfileNudge && !!user && (!user.name || user.dietary.length === 0);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Orders</h1>
      {showNudge && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <span>
            <strong>Complete your profile</strong> — add a
            {!user.name ? ' name and' : ''} dietary preference so we can personalise your menu.
          </span>
          <div className="flex items-center gap-3 ml-4 shrink-0">
            <Link className="font-medium underline underline-offset-2" to="/profile">
              Go to Profile
            </Link>
            <button className="text-amber-600 hover:text-amber-800" onClick={dismissProfileNudge}>
              ✕
            </button>
          </div>
        </div>
      )}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="browse">Browse menu</TabsTrigger>
          <TabsTrigger value="mine">My orders</TabsTrigger>
          {isManagerOrAdmin && <TabsTrigger value="all">All orders</TabsTrigger>}
        </TabsList>
        <TabsContent value="browse">
          <MenuGrid />
        </TabsContent>
        <TabsContent value="mine">
          <OrdersList scope="mine" onBrowseMenu={() => setTab('browse')} />
        </TabsContent>
        {isManagerOrAdmin && (
          <TabsContent value="all">
            <OrdersList scope="all" />
          </TabsContent>
        )}
      </Tabs>
      <CartDrawer onOrderPlaced={() => setTab('mine')} />
    </div>
  );
};

export default OrdersPage;
