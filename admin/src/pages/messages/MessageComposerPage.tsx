import { useMemo, useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { useMutation } from '../../hooks/useMutation';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';
import {
  Badge,
  Button,
  Card,
  DataTable,
  Input,
  LoadingState,
  Pagination,
  Select,
  Tabs,
  TextArea,
} from '../../components/ui';

/* ─── Types ─── */

type MessageType = 'recap' | 'new_content' | 'tip' | 'system' | 'milestone' | 'promo' | 'alert';

interface Message {
  id: string;
  householdId: string;
  type: MessageType;
  title: string;
  body: string;
  actionUrl: string | null;
  actionLabel: string | null;
  read: boolean;
  createdAt: string;
}

interface MessagesResponse {
  data: Message[];
  total: number;
  page: number;
  pageSize: number;
}

/* ─── Constants ─── */

const TYPE_OPTIONS = [
  { value: 'recap', label: 'Weekly Recap' },
  { value: 'new_content', label: 'New Content' },
  { value: 'tip', label: 'Tip' },
  { value: 'system', label: 'System' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'promo', label: 'Promo' },
  { value: 'alert', label: 'Alert' },
];

const TYPE_VARIANTS: Record<MessageType, 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
  recap: 'primary',
  new_content: 'success',
  tip: 'info',
  system: 'default',
  milestone: 'warning',
  promo: 'primary',
  alert: 'danger',
};

const TAB_ITEMS = [
  { key: 'compose', label: 'Compose' },
  { key: 'recent', label: 'Recent Messages' },
];

/* ─── Component ─── */

export function MessageComposerPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('compose');
  const { page, limit, setPage } = usePagination({ initialLimit: 20 });

  // Compose form state
  const [householdId, setHouseholdId] = useState('');
  const [messageType, setMessageType] = useState<string>('recap');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [actionLabel, setActionLabel] = useState('');

  // Bulk form state
  const [bulkHouseholdIds, setBulkHouseholdIds] = useState('');

  // Recent messages
  const { data: messagesData, loading: messagesLoading, refetch } = useQuery<MessagesResponse>(
    () => api.get('/messages', { page, pageSize: limit }),
    [page, limit],
  );

  // Send single message
  const { mutate: sendMessage, loading: sending } = useMutation<
    Message,
    { householdId: string; type: string; title: string; body: string; actionUrl?: string; actionLabel?: string }
  >(
    (vars) => api.post('/messages', vars),
    {
      onSuccess: () => {
        toast.success('Message sent');
        resetForm();
        refetch();
      },
    },
  );

  // Bulk send
  const { mutate: bulkSend, loading: bulkSending } = useMutation<
    { sent: number },
    { householdIds: string[]; type: string; title: string; body: string; actionUrl?: string; actionLabel?: string }
  >(
    (vars) => api.post('/messages/bulk', vars),
    {
      onSuccess: (data) => {
        toast.success(`Bulk message sent to ${data?.sent ?? 0} households`);
        resetForm();
        refetch();
      },
    },
  );

  const resetForm = () => {
    setHouseholdId('');
    setTitle('');
    setBody('');
    setActionUrl('');
    setActionLabel('');
    setBulkHouseholdIds('');
  };

  const handleSend = () => {
    const payload = {
      householdId: householdId.trim(),
      type: messageType,
      title: title.trim(),
      body: body.trim(),
      ...(actionUrl.trim() && { actionUrl: actionUrl.trim() }),
      ...(actionLabel.trim() && { actionLabel: actionLabel.trim() }),
    };
    sendMessage(payload);
  };

  const handleBulkSend = () => {
    const ids = bulkHouseholdIds.split(',').map((id) => id.trim()).filter(Boolean);
    if (ids.length === 0) {
      toast.error('Enter at least one household ID');
      return;
    }
    bulkSend({
      householdIds: ids,
      type: messageType,
      title: title.trim(),
      body: body.trim(),
      ...(actionUrl.trim() && { actionUrl: actionUrl.trim() }),
      ...(actionLabel.trim() && { actionLabel: actionLabel.trim() }),
    });
  };

  const items = messagesData?.data ?? [];
  const total = messagesData?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const columns = useMemo(
    () => [
      {
        key: 'title',
        header: 'Title',
        render: (item: Message) => (
          <span className="font-medium text-text">{item.title}</span>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        render: (item: Message) => (
          <Badge variant={TYPE_VARIANTS[item.type] ?? 'default'}>
            {item.type}
          </Badge>
        ),
      },
      {
        key: 'householdId',
        header: 'Household',
        render: (item: Message) => (
          <span className="text-sm text-text-secondary font-mono">{item.householdId}</span>
        ),
      },
      {
        key: 'read',
        header: 'Read',
        render: (item: Message) => (
          <Badge variant={item.read ? 'success' : 'default'}>
            {item.read ? 'Read' : 'Unread'}
          </Badge>
        ),
      },
      {
        key: 'createdAt',
        header: 'Sent',
        render: (item: Message) => (
          <span className="text-sm text-text-secondary">
            {new Date(item.createdAt).toLocaleString()}
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
        <h1 className="text-2xl font-bold text-text">Messages</h1>
        <p className="text-text-secondary mt-1">Compose and send messages to households.</p>
      </div>

      {/* Tabs */}
      <Tabs tabs={TAB_ITEMS} activeKey={activeTab} onChange={setActiveTab} />

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <Card>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text">Compose Message</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Household ID"
                value={householdId}
                onChange={(e) => setHouseholdId(e.target.value)}
                placeholder="Single household ID"
              />
              <Select
                label="Message Type"
                options={TYPE_OPTIONS}
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
              />
            </div>

            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Message title"
            />

            <TextArea
              label="Body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="Message body..."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Action URL"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="Optional deep link or URL"
              />
              <Input
                label="Action Label"
                value={actionLabel}
                onChange={(e) => setActionLabel(e.target.value)}
                placeholder="Optional button label"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                loading={sending}
                disabled={!householdId.trim() || !title.trim() || !body.trim()}
                onClick={handleSend}
              >
                Send
              </Button>
            </div>

            {/* Bulk Send Section */}
            <div className="border-t border-border pt-4 mt-4 space-y-4">
              <h3 className="text-sm font-semibold text-text">Bulk Send</h3>
              <TextArea
                label="Household IDs (comma-separated)"
                value={bulkHouseholdIds}
                onChange={(e) => setBulkHouseholdIds(e.target.value)}
                rows={3}
                placeholder="id1, id2, id3..."
                hint="Same message content above will be sent to all listed households."
              />
              <Button
                variant="secondary"
                loading={bulkSending}
                disabled={!bulkHouseholdIds.trim() || !title.trim() || !body.trim()}
                onClick={handleBulkSend}
              >
                Bulk Send
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Messages Tab */}
      {activeTab === 'recent' && (
        <>
          {messagesLoading && !messagesData ? (
            <LoadingState message="Loading messages..." />
          ) : (
            <DataTable
              columns={columns}
              data={items}
              loading={messagesLoading}
              emptyMessage="No messages found."
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
        </>
      )}
    </div>
  );
}
