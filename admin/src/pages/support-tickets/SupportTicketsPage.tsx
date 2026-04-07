import { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { usePagination } from '../../hooks/usePagination';
import { useFilters } from '../../hooks/useFilters';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';
import {
  Badge,
  Button,
  DataTable,
  Drawer,
  FilterBar,
  Input,
  LoadingState,
  Pagination,
  Select,
  StatsCard,
  StatusChip,
  TextArea,
} from '../../components/ui';

/* ─── Types ─── */

type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  parentEmail: string;
  householdId: string;
  body: string;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TicketsResponse {
  data: SupportTicket[];
  total: number;
  page: number;
  pageSize: number;
}

interface TicketStats {
  open: number;
  inProgress: number;
  waiting: number;
  resolved: number;
}

/* ─── Constants ─── */

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const STATUS_MAP: Record<TicketStatus, 'draft' | 'published' | 'in_review' | 'approved'> = {
  open: 'draft',
  in_progress: 'in_review',
  waiting: 'in_review',
  resolved: 'approved',
  closed: 'published',
};

const PRIORITY_VARIANTS: Record<TicketPriority, 'info' | 'warning' | 'danger' | 'default'> = {
  low: 'info',
  medium: 'warning',
  high: 'danger',
  urgent: 'danger',
};

const UPDATE_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

/* ─── Component ─── */

export function SupportTicketsPage() {
  const toast = useToast();
  const { page, limit, setPage } = usePagination({ initialLimit: 20 });
  const { filters, setFilter, clearFilters } = useFilters({ status: '', priority: '' });
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Detail form state
  const [editStatus, setEditStatus] = useState<string>('');
  const [editAssignee, setEditAssignee] = useState('');
  const [responseNote, setResponseNote] = useState('');

  // Ticket stats
  const { data: stats } = useQuery<TicketStats>(
    () => api.get('/help/tickets', { stats: true } as Record<string, string | number | boolean>),
    [],
  );

  // Tickets list
  const queryParams = useMemo(
    () => ({
      page,
      pageSize: limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
    }),
    [page, limit, filters],
  );

  const { data, loading, refetch } = useQuery<TicketsResponse>(
    () => api.get('/help/tickets', queryParams),
    [JSON.stringify(queryParams)],
  );

  // Update ticket
  const { mutate: updateTicket, loading: updating } = useMutation<
    SupportTicket,
    { id: string; body: Partial<SupportTicket> }
  >(
    ({ id, body }) => api.patch(`/help/tickets/${id}`, body),
    {
      onSuccess: () => {
        toast.success('Ticket updated');
        setSelectedTicket(null);
        refetch();
      },
    },
  );

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const openDetail = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setEditAssignee(ticket.assignee ?? '');
    setResponseNote('');
  };

  const handleUpdate = () => {
    if (!selectedTicket) return;
    updateTicket({
      id: selectedTicket.id,
      body: {
        status: editStatus as TicketStatus,
        assignee: editAssignee || null,
      },
    });
  };

  const handleResolve = () => {
    if (!selectedTicket) return;
    updateTicket({
      id: selectedTicket.id,
      body: {
        status: 'resolved' as TicketStatus,
        assignee: editAssignee || null,
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        key: 'subject',
        header: 'Subject',
        render: (item: SupportTicket) => (
          <span className="font-medium text-text">{item.subject}</span>
        ),
      },
      {
        key: 'category',
        header: 'Category',
        render: (item: SupportTicket) => (
          <Badge variant="default">{item.category}</Badge>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item: SupportTicket) => (
          <StatusChip status={STATUS_MAP[item.status]} />
        ),
      },
      {
        key: 'priority',
        header: 'Priority',
        render: (item: SupportTicket) => (
          <Badge variant={PRIORITY_VARIANTS[item.priority]}>
            {item.priority}
          </Badge>
        ),
      },
      {
        key: 'parentEmail',
        header: 'Parent Email',
        render: (item: SupportTicket) => (
          <span className="text-sm text-text-secondary">{item.parentEmail}</span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Created',
        render: (item: SupportTicket) => (
          <span className="text-sm text-text-secondary">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">Support Tickets</h1>
        <p className="text-text-secondary mt-1">Manage parent support requests.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Open" value={stats?.open ?? 0} />
        <StatsCard title="In Progress" value={stats?.inProgress ?? 0} />
        <StatsCard title="Waiting" value={stats?.waiting ?? 0} />
        <StatsCard title="Resolved" value={stats?.resolved ?? 0} />
      </div>

      {/* Filters */}
      <FilterBar onReset={() => { clearFilters(); setPage(1); }}>
        <Select
          options={STATUS_OPTIONS}
          value={filters.status as string}
          onChange={(e) => { setFilter('status', e.target.value); setPage(1); }}
          className="w-44"
        />
        <Select
          options={PRIORITY_OPTIONS}
          value={filters.priority as string}
          onChange={(e) => { setFilter('priority', e.target.value); setPage(1); }}
          className="w-44"
        />
      </FilterBar>

      {/* Table */}
      {loading && !data ? (
        <LoadingState message="Loading tickets..." />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          emptyMessage="No tickets found. Try adjusting your filters."
          onRowClick={(item) => openDetail(item as SupportTicket)}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Showing {(page - 1) * limit + 1}--{Math.min(page * limit, total)} of {total}
          </p>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Detail Drawer */}
      <Drawer
        open={selectedTicket !== null}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket?.subject ?? 'Ticket Detail'}
      >
        {selectedTicket && (
          <div className="space-y-5">
            {/* Ticket Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text">Status:</span>
                <StatusChip status={STATUS_MAP[selectedTicket.status]} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text">Priority:</span>
                <Badge variant={PRIORITY_VARIANTS[selectedTicket.priority]}>
                  {selectedTicket.priority}
                </Badge>
              </div>
              <div>
                <span className="text-sm font-medium text-text">Category:</span>
                <span className="text-sm text-text-secondary ml-2">{selectedTicket.category}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-text">Parent:</span>
                <span className="text-sm text-text-secondary ml-2">{selectedTicket.parentEmail}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-text">Household:</span>
                <span className="text-sm text-text-secondary ml-2">{selectedTicket.householdId}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-text">Created:</span>
                <span className="text-sm text-text-secondary ml-2">
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Body */}
            <div>
              <h4 className="text-sm font-medium text-text mb-2">Description</h4>
              <div className="bg-bg rounded-lg p-3 text-sm text-text-secondary">
                {selectedTicket.body}
              </div>
            </div>

            {/* Update Form */}
            <div className="border-t border-border pt-4 space-y-4">
              <h4 className="text-sm font-semibold text-text">Update Ticket</h4>
              <Select
                label="Status"
                options={UPDATE_STATUS_OPTIONS}
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              />
              <Input
                label="Assignee"
                value={editAssignee}
                onChange={(e) => setEditAssignee(e.target.value)}
                placeholder="Enter assignee name or email"
              />
              <TextArea
                label="Response Note"
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                rows={3}
                placeholder="Optional internal note..."
              />
              <div className="flex items-center gap-3">
                <Button loading={updating} onClick={handleUpdate}>
                  Update
                </Button>
                <Button variant="secondary" loading={updating} onClick={handleResolve}>
                  Resolve
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
