import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '../../hooks/useQuery';
import { usePagination } from '../../hooks/usePagination';
import { useFilters } from '../../hooks/useFilters';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';
import {
  Button,
  StatsCard,
  SearchInput,
  FilterBar,
  Select,
  DataTable,
  Pagination,
  Badge,
  StatusChip,
  LoadingState,
  Modal,
  Input,
  Card,
} from '../../components/ui';

/* ─── Types ─── */

type SubscriptionStatus = 'active' | 'trialing' | 'cancelled' | 'past_due' | 'paused';

interface SubscriptionItem {
  id: string;
  householdId: string;
  householdName: string;
  plan: string;
  status: SubscriptionStatus;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

interface SubscriptionsResponse {
  data: SubscriptionItem[];
  total: number;
  page: number;
  pageSize: number;
}

interface SubscriptionStats {
  active: number;
  trialing: number;
  cancelled: number;
  monthlyRevenue: number;
}

interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxRedemptions: number;
  currentRedemptions: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
}

interface PromoCodesResponse {
  data: PromoCode[];
}

interface PromoFormData {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  maxRedemptions: string;
  validFrom: string;
  validUntil: string;
}

/* ─── Constants ─── */

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'trialing', label: 'Trialing' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'past_due', label: 'Past Due' },
  { value: 'paused', label: 'Paused' },
];

const PLAN_OPTIONS = [
  { value: '', label: 'All Plans' },
  { value: 'free', label: 'Free' },
  { value: 'basic', label: 'Basic' },
  { value: 'premium', label: 'Premium' },
  { value: 'family', label: 'Family' },
];

const STATUS_MAP: Record<SubscriptionStatus, 'published' | 'in_review' | 'draft' | 'approved' | 'archived'> = {
  active: 'published',
  trialing: 'in_review',
  cancelled: 'archived',
  past_due: 'draft',
  paused: 'approved',
};

const PLAN_VARIANTS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'info'> = {
  free: 'default',
  basic: 'info',
  premium: 'success',
  family: 'primary',
};

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed Amount' },
];

const INITIAL_PROMO_FORM: PromoFormData = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  maxRedemptions: '',
  validFrom: '',
  validUntil: '',
};

/* ─── Component ─── */

export function SubscriptionListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { page, limit, setPage } = usePagination({ initialLimit: 20 });
  const { filters, setFilter, clearFilters } = useFilters({
    status: '',
    plan: '',
  });
  const [search, setSearch] = useState('');
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoForm, setPromoForm] = useState<PromoFormData>(INITIAL_PROMO_FORM);

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.plan && { plan: filters.plan }),
      ...(search && { search }),
      sort: '-createdAt',
    }),
    [page, limit, filters, search],
  );

  const { data, loading, error } = useQuery<SubscriptionsResponse>(
    () => api.get('/subscriptions', queryParams),
    [JSON.stringify(queryParams)],
  );

  const { data: promoData, refetch: refetchPromos } = useQuery<PromoCodesResponse>(
    () => api.get('/subscriptions/promo'),
    [],
  );

  const { mutate: createPromo, loading: creatingPromo } = useMutation<PromoCode, PromoFormData>(
    (vars) =>
      api.post('/subscriptions/promo', {
        code: vars.code,
        description: vars.description,
        discountType: vars.discountType,
        discountValue: Number(vars.discountValue),
        maxRedemptions: Number(vars.maxRedemptions),
        validFrom: vars.validFrom,
        validUntil: vars.validUntil,
      }),
    {
      onSuccess: () => {
        toast.success('Promo code created successfully.');
        setShowPromoModal(false);
        setPromoForm(INITIAL_PROMO_FORM);
        refetchPromos();
      },
      onError: (err) => toast.error(err.message),
    },
  );

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);
  const promos = promoData?.data ?? [];

  // Derive stats
  const stats = useMemo<SubscriptionStats>(() => {
    if (!items.length) return { active: 0, trialing: 0, cancelled: 0, monthlyRevenue: 0 };
    return {
      active: items.filter((i) => i.status === 'active').length,
      trialing: items.filter((i) => i.status === 'trialing').length,
      cancelled: items.filter((i) => i.status === 'cancelled').length,
      monthlyRevenue: items.filter((i) => i.status === 'active').length * 9.99,
    };
  }, [items]);

  const columns = useMemo(
    () => [
      {
        key: 'householdName',
        header: 'Household',
        render: (item: SubscriptionItem) => (
          <Link
            to={`/households/${item.householdId}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-primary hover:text-primary-hover"
          >
            {item.householdName}
          </Link>
        ),
      },
      {
        key: 'plan',
        header: 'Plan',
        render: (item: SubscriptionItem) => (
          <Badge variant={PLAN_VARIANTS[item.plan] ?? 'default'}>
            {item.plan}
          </Badge>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item: SubscriptionItem) => (
          <StatusChip status={STATUS_MAP[item.status]} />
        ),
      },
      {
        key: 'periodStart',
        header: 'Period Start',
        render: (item: SubscriptionItem) => (
          <span className="text-sm text-text-secondary">
            {new Date(item.periodStart).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: 'periodEnd',
        header: 'Period End',
        render: (item: SubscriptionItem) => (
          <span className="text-sm text-text-secondary">
            {new Date(item.periodEnd).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Created',
        render: (item: SubscriptionItem) => (
          <span className="text-sm text-text-secondary">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        ),
      },
    ],
    [],
  );

  const promoColumns = useMemo(
    () => [
      {
        key: 'code',
        header: 'Code',
        render: (item: PromoCode) => (
          <span className="font-mono font-medium text-text">{item.code}</span>
        ),
      },
      {
        key: 'description',
        header: 'Description',
        render: (item: PromoCode) => (
          <span className="text-sm text-text-secondary">{item.description}</span>
        ),
      },
      {
        key: 'discount',
        header: 'Discount',
        render: (item: PromoCode) => (
          <span className="text-sm text-text">
            {item.discountType === 'percentage' ? `${item.discountValue}%` : `$${item.discountValue}`}
          </span>
        ),
      },
      {
        key: 'redemptions',
        header: 'Redemptions',
        render: (item: PromoCode) => (
          <span className="text-sm text-text">
            {item.currentRedemptions} / {item.maxRedemptions}
          </span>
        ),
      },
      {
        key: 'validUntil',
        header: 'Valid Until',
        render: (item: PromoCode) => (
          <span className="text-sm text-text-secondary">
            {new Date(item.validUntil).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: 'active',
        header: 'Active',
        render: (item: PromoCode) => (
          <Badge variant={item.active ? 'success' : 'default'}>
            {item.active ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
    ],
    [],
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-danger/10 border border-danger/20 rounded-lg p-4 text-danger text-sm">
          Failed to load subscriptions: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Subscriptions</h1>
          <p className="text-text-secondary mt-1">
            Manage subscription plans, billing, and promo codes.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Active" value={stats.active} />
        <StatsCard title="Trialing" value={stats.trialing} />
        <StatsCard title="Cancelled" value={stats.cancelled} />
        <StatsCard title="Monthly Revenue" value={`$${stats.monthlyRevenue.toFixed(2)}`} />
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by household name..."
          className="max-w-md"
        />

        <FilterBar onReset={() => { clearFilters(); setSearch(''); setPage(1); }}>
          <Select
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(e) => { setFilter('status', e.target.value); setPage(1); }}
            className="w-40"
          />
          <Select
            options={PLAN_OPTIONS}
            value={filters.plan}
            onChange={(e) => { setFilter('plan', e.target.value); setPage(1); }}
            className="w-40"
          />
        </FilterBar>
      </div>

      {/* Data Table */}
      {loading && !data ? (
        <LoadingState message="Loading subscriptions..." />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          emptyMessage="No subscriptions found. Try adjusting your filters."
          onRowClick={(item) => navigate(`/subscriptions/${item.id}`)}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Showing {(page - 1) * limit + 1}--{Math.min(page * limit, total)} of {total}
          </p>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Promo Codes Section */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-text">Promo Codes</h2>
            <p className="text-sm text-text-secondary mt-0.5">
              Create and manage promotional discount codes.
            </p>
          </div>
          <Button onClick={() => setShowPromoModal(true)}>Create Promo Code</Button>
        </div>

        <DataTable
          columns={promoColumns}
          data={promos}
          emptyMessage="No promo codes created yet."
        />
      </div>

      {/* Create Promo Modal */}
      <Modal open={showPromoModal} onClose={() => setShowPromoModal(false)} title="Create Promo Code" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Code"
              value={promoForm.code}
              onChange={(e) => setPromoForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="SUMMER2026"
            />
            <Select
              label="Discount Type"
              options={DISCOUNT_TYPE_OPTIONS}
              value={promoForm.discountType}
              onChange={(e) =>
                setPromoForm((f) => ({
                  ...f,
                  discountType: e.target.value as 'percentage' | 'fixed',
                }))
              }
            />
          </div>

          <Input
            label="Description"
            value={promoForm.description}
            onChange={(e) => setPromoForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Summer promotion - 20% off premium plan"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Discount Value"
              type="number"
              value={promoForm.discountValue}
              onChange={(e) => setPromoForm((f) => ({ ...f, discountValue: e.target.value }))}
              placeholder={promoForm.discountType === 'percentage' ? '20' : '5.00'}
            />
            <Input
              label="Max Redemptions"
              type="number"
              value={promoForm.maxRedemptions}
              onChange={(e) => setPromoForm((f) => ({ ...f, maxRedemptions: e.target.value }))}
              placeholder="100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Valid From"
              type="date"
              value={promoForm.validFrom}
              onChange={(e) => setPromoForm((f) => ({ ...f, validFrom: e.target.value }))}
            />
            <Input
              label="Valid Until"
              type="date"
              value={promoForm.validUntil}
              onChange={(e) => setPromoForm((f) => ({ ...f, validUntil: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowPromoModal(false)}>
              Cancel
            </Button>
            <Button
              loading={creatingPromo}
              disabled={!promoForm.code.trim() || !promoForm.discountValue}
              onClick={() => createPromo(promoForm)}
            >
              Create Promo Code
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
