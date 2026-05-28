import { Utensils, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { MenuItemForm } from '@/components/settings/MenuItemForm';
import { BulkImportDialog } from '@/components/settings/BulkImportDialog';
import { RestaurantForm } from '@/components/settings/RestaurantForm';
import { TeamTable } from '@/components/settings/TeamTable';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useSettings } from '@/hooks/useSettings';
import { useTeam } from '@/hooks/useTeam';
import { useAuth } from '@/hooks/useAuth';
import { fetchRestaurants, deleteRestaurant } from '@/api/restaurantsApi';
import { deleteMenuItem } from '@/api/menuApi';
import { patchSettings, type SettingsPatch } from '@/api/settingsApi';
import { formatCurrency } from '@/lib/formatCurrency';
import type { MenuItem } from '@/types/menu';
import type { Restaurant } from '@/api/restaurantsApi';

export const SettingsPage = (): JSX.Element => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const qc = useQueryClient();

  const menu = useMenuItems();
  const team = useTeam();
  const settings = useSettings();
  const restaurantsQ = useQuery({ queryKey: ['restaurants'], queryFn: fetchRestaurants });

  // local state
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<MenuItem | null>(null);
  const [editingRest, setEditingRest] = useState<Restaurant | null>(null);
  const [restFormOpen, setRestFormOpen] = useState(false);
  const [confirmDeleteRest, setConfirmDeleteRest] = useState<Restaurant | null>(null);

  // settings form state
  const [allowedDomain, setAllowedDomain] = useState('');
  const [currency, setCurrency] = useState<SettingsPatch['currency']>('ZAR');
  const [cutoffTime, setCutoffTime] = useState('11:00');
  const [orderingOpenToday, setOrderingOpenToday] = useState(false);

  useEffect(() => {
    if (settings.data) {
      setAllowedDomain(settings.data.allowedEmailDomain);
      setCurrency(settings.data.currency as SettingsPatch['currency']);
      setCutoffTime(settings.data.cutoffTime);
      setOrderingOpenToday(settings.data.orderingOpenToday);
    }
  }, [settings.data]);

  const settingsMutation = useMutation({
    mutationFn: (payload: SettingsPatch) => patchSettings(payload),
    onSuccess: () => {
      toast.success('Settings saved');
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => deleteMenuItem(id),
    onSuccess: () => {
      toast.success('Menu item deleted');
      qc.invalidateQueries({ queryKey: ['menu-items'] });
      setConfirmDeleteItem(null);
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const deleteRestMutation = useMutation({
    mutationFn: (id: string) => deleteRestaurant(id),
    onSuccess: () => {
      toast.success('Restaurant deleted');
      qc.invalidateQueries({ queryKey: ['restaurants'] });
      setConfirmDeleteRest(null);
    },
    onError: (err) => toast.error((err as Error).message),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <Tabs defaultValue="app">
        <TabsList>
          <TabsTrigger value="app">App</TabsTrigger>
          {isAdmin && <TabsTrigger value="menu">Menu</TabsTrigger>}
          {isAdmin && <TabsTrigger value="restaurants">Restaurants</TabsTrigger>}
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="app">
          <div className="max-w-xl space-y-4 rounded-md border border-slate-200 bg-white p-4">
            {isAdmin && (
              <>
                <div>
                  <Label htmlFor="s-domain">Allowed email domain</Label>
                  <Input id="s-domain" value={allowedDomain} onChange={(e) => setAllowedDomain(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="s-currency">Currency</Label>
                  <Select id="s-currency" value={currency} onChange={(e) => setCurrency(e.target.value as SettingsPatch['currency'])}>
                    <option value="ZAR">ZAR (R)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AUD">AUD (A$)</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="s-cutoff">Cutoff time</Label>
                  <Input id="s-cutoff" type="time" value={cutoffTime} onChange={(e) => setCutoffTime(e.target.value)} />
                </div>
              </>
            )}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="s-open">Re-open ordering today</Label>
                <p className="text-xs text-slate-500">Overrides the cutoff for today only.</p>
              </div>
              <Switch checked={orderingOpenToday} onCheckedChange={setOrderingOpenToday} id="s-open" />
            </div>
            <Button
              onClick={() => {
                const payload: SettingsPatch = { orderingOpenToday };
                if (isAdmin) {
                  payload.allowedEmailDomain = allowedDomain.trim();
                  payload.currency = currency;
                  payload.cutoffTime = cutoffTime;
                }
                settingsMutation.mutate(payload);
              }}
              disabled={settingsMutation.isPending}
            >
              {settingsMutation.isPending ? 'Saving...' : 'Save settings'}
            </Button>
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="menu">
            <div className="mb-3 flex items-center gap-3">
              <Button onClick={() => { setEditingItem(null); setItemFormOpen(true); }}>Add item</Button>
              <Button variant="outline" onClick={() => setBulkOpen(true)}>Bulk import</Button>
            </div>
            <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Available</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {menu.data?.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                          <Utensils className="w-10 h-10 mb-3" />
                          <p className="text-sm font-medium mb-3">No menu items yet.</p>
                          <Button variant="outline" onClick={() => { setEditingItem(null); setItemFormOpen(true); }}>Add Menu Item</Button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {menu.data?.map((m) => (
                    <tr key={m.id} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-medium text-slate-900">{m.name}</td>
                      <td className="px-4 py-2 text-slate-600">{m.category}</td>
                      <td className="px-4 py-2">{formatCurrency(m.price, settings.data)}</td>
                      <td className="px-4 py-2">
                        <Badge className={m.available ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'}>
                          {m.available ? 'Yes' : 'No'}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button size="sm" variant="outline" onClick={() => { setEditingItem(m); setItemFormOpen(true); }}>
                          Edit
                        </Button>{' '}
                        <Button size="sm" variant="destructive" onClick={() => setConfirmDeleteItem(m)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <MenuItemForm
              open={itemFormOpen}
              onClose={() => setItemFormOpen(false)}
              initial={editingItem}
              restaurants={restaurantsQ.data ?? []}
            />
            <BulkImportDialog open={bulkOpen} onClose={() => setBulkOpen(false)} restaurants={restaurantsQ.data ?? []} />
            <ConfirmDialog
              open={Boolean(confirmDeleteItem)}
              title="Delete menu item?"
              description={confirmDeleteItem?.name}
              destructive
              loading={deleteItemMutation.isPending}
              onCancel={() => setConfirmDeleteItem(null)}
              onConfirm={() => confirmDeleteItem && deleteItemMutation.mutate(confirmDeleteItem.id)}
            />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="restaurants">
            <div className="mb-3">
              <Button onClick={() => { setEditingRest(null); setRestFormOpen(true); }}>Add restaurant</Button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {restaurantsQ.data?.length === 0 && (
                <div className="col-span-2 flex flex-col items-center justify-center py-16 text-gray-400">
                  <Store className="w-10 h-10 mb-3" />
                  <p className="text-sm font-medium mb-3">No restaurants added yet.</p>
                  <Button variant="outline" onClick={() => { setEditingRest(null); setRestFormOpen(true); }}>Add Restaurant</Button>
                </div>
              )}
              {restaurantsQ.data?.map((r) => (
                <div key={r.id} className="rounded-md border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{r.name}</p>
                      {r.cuisine && <p className="text-xs text-slate-500">{r.cuisine}</p>}
                    </div>
                    <Badge className={r.active ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'}>
                      {r.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {r.description && <p className="mt-2 text-sm text-slate-600">{r.description}</p>}
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditingRest(r); setRestFormOpen(true); }}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setConfirmDeleteRest(r)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <RestaurantForm open={restFormOpen} onClose={() => setRestFormOpen(false)} initial={editingRest} />
            <ConfirmDialog
              open={Boolean(confirmDeleteRest)}
              title="Delete restaurant?"
              description={confirmDeleteRest?.name}
              destructive
              loading={deleteRestMutation.isPending}
              onCancel={() => setConfirmDeleteRest(null)}
              onConfirm={() => confirmDeleteRest && deleteRestMutation.mutate(confirmDeleteRest.id)}
            />
          </TabsContent>
        )}

        <TabsContent value="team">
          {team.data && <TeamTable users={team.data} canEditRole={isAdmin} currentUserId={user?.id} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};
