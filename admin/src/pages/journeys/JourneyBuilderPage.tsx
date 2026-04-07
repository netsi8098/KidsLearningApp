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
  Drawer,
  Input,
  LoadingState,
  Pagination,
  StatsCard,
  TextArea,
  Toggle,
  Select,
} from '../../components/ui';

/* ─── Types ─── */

interface JourneyStep {
  id: string;
  order: number;
  delayHours: number;
  messageTemplate: string;
  conditions: string;
}

interface Journey {
  id: string;
  name: string;
  triggerType: 'signup' | 'milestone' | 'inactivity' | 'schedule' | 'event';
  enabled: boolean;
  stepCount: number;
  enrollmentCount: number;
  createdAt: string;
}

interface JourneyDetail extends Journey {
  steps: JourneyStep[];
}

interface JourneysResponse {
  data: Journey[];
  total: number;
  page: number;
  pageSize: number;
}

interface EnrollmentStats {
  active: number;
  completed: number;
  cancelled: number;
}

/* ─── Constants ─── */

const TRIGGER_VARIANTS: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  signup: 'primary',
  milestone: 'success',
  inactivity: 'warning',
  schedule: 'info',
  event: 'danger',
};

const TRIGGER_OPTIONS = [
  { value: 'signup', label: 'Signup' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'inactivity', label: 'Inactivity' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'event', label: 'Event' },
];

/* ─── Component ─── */

export function JourneyBuilderPage() {
  const toast = useToast();
  const { page, limit, setPage } = usePagination({ initialLimit: 20 });
  const [selectedJourney, setSelectedJourney] = useState<JourneyDetail | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTrigger, setNewTrigger] = useState('signup');

  // New step form
  const [newStepDelay, setNewStepDelay] = useState('0');
  const [newStepTemplate, setNewStepTemplate] = useState('{}');
  const [newStepConditions, setNewStepConditions] = useState('');

  // Journey list
  const { data, loading, refetch } = useQuery<JourneysResponse>(
    () => api.get('/journeys', { page, pageSize: limit }),
    [page, limit],
  );

  // Enrollment stats
  const { data: enrollments } = useQuery<EnrollmentStats>(
    () => api.get('/journeys/enrollments'),
    [],
  );

  // Journey detail
  const { data: detail, loading: detailLoading, refetch: refetchDetail } = useQuery<JourneyDetail>(
    () => api.get(`/journeys/${selectedJourney?.id}`),
    [selectedJourney?.id],
    { enabled: selectedJourney !== null },
  );

  // Mutations
  const { mutate: createJourney, loading: creating } = useMutation<Journey, { name: string; triggerType: string }>(
    (vars) => api.post('/journeys', vars),
    {
      onSuccess: () => {
        toast.success('Journey created');
        setShowCreate(false);
        setNewName('');
        refetch();
      },
    },
  );

  const { mutate: toggleEnabled } = useMutation<Journey, { id: string; enabled: boolean }>(
    ({ id, enabled }) => api.patch(`/journeys/${id}`, { enabled }),
    { onSuccess: () => refetch() },
  );

  const { mutate: addStep, loading: addingStep } = useMutation<
    JourneyStep,
    { journeyId: string; step: { delayHours: number; messageTemplate: string; conditions: string } }
  >(
    ({ journeyId, step }) => api.post(`/journeys/${journeyId}/steps`, step),
    {
      onSuccess: () => {
        toast.success('Step added');
        setNewStepDelay('0');
        setNewStepTemplate('{}');
        setNewStepConditions('');
        refetchDetail();
      },
    },
  );

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Name',
        render: (item: Journey) => (
          <span className="font-medium text-text">{item.name}</span>
        ),
      },
      {
        key: 'triggerType',
        header: 'Trigger',
        render: (item: Journey) => (
          <Badge variant={TRIGGER_VARIANTS[item.triggerType] ?? 'default'}>
            {item.triggerType}
          </Badge>
        ),
      },
      {
        key: 'enabled',
        header: 'Enabled',
        render: (item: Journey) => (
          <Toggle
            enabled={item.enabled}
            onChange={(val) => toggleEnabled({ id: item.id, enabled: val })}
          />
        ),
      },
      {
        key: 'stepCount',
        header: 'Steps',
        render: (item: Journey) => (
          <span className="text-sm text-text">{item.stepCount}</span>
        ),
      },
      {
        key: 'enrollmentCount',
        header: 'Enrollments',
        render: (item: Journey) => (
          <span className="text-sm font-medium text-text">{item.enrollmentCount}</span>
        ),
      },
    ],
    [toggleEnabled],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Journeys</h1>
          <p className="text-text-secondary mt-1">Automated multi-step engagement journeys.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>New Journey</Button>
      </div>

      {/* Enrollment Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Journeys" value={total} />
        <StatsCard title="Active Enrollments" value={enrollments?.active ?? 0} />
        <StatsCard title="Completed" value={enrollments?.completed ?? 0} />
        <StatsCard title="Cancelled" value={enrollments?.cancelled ?? 0} />
      </div>

      {/* Journey Table */}
      {loading && !data ? (
        <LoadingState message="Loading journeys..." />
      ) : (
        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          emptyMessage="No journeys found."
          onRowClick={(item) => setSelectedJourney(item as unknown as JourneyDetail)}
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

      {/* Create Journey Drawer */}
      <Drawer
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Journey"
      >
        <div className="space-y-4">
          <Input
            label="Journey Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. New Parent Onboarding"
          />
          <Select
            label="Trigger Type"
            options={TRIGGER_OPTIONS}
            value={newTrigger}
            onChange={(e) => setNewTrigger(e.target.value)}
          />
          <Button
            loading={creating}
            disabled={!newName.trim()}
            onClick={() => createJourney({ name: newName.trim(), triggerType: newTrigger })}
          >
            Create Journey
          </Button>
        </div>
      </Drawer>

      {/* Journey Detail Drawer */}
      <Drawer
        open={selectedJourney !== null && !showCreate}
        onClose={() => setSelectedJourney(null)}
        title={selectedJourney?.name ?? 'Journey Detail'}
      >
        {selectedJourney && (
          <div className="space-y-6">
            {/* Journey Info */}
            <Card>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text">Trigger:</span>
                  <Badge variant={TRIGGER_VARIANTS[selectedJourney.triggerType] ?? 'default'}>
                    {selectedJourney.triggerType}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text">Enrollments:</span>
                  <span className="text-sm text-text-secondary">{selectedJourney.enrollmentCount}</span>
                </div>
              </div>
            </Card>

            {/* Steps */}
            <div>
              <h3 className="text-sm font-semibold text-text mb-3">Steps</h3>
              {detailLoading ? (
                <LoadingState message="Loading steps..." size="sm" />
              ) : (
                <div className="space-y-3">
                  {(detail?.steps ?? []).map((step, idx) => (
                    <Card key={step.id}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-text">Step {idx + 1}</span>
                          <Badge variant="info">{step.delayHours}h delay</Badge>
                        </div>
                        <pre className="text-xs text-text-secondary bg-bg rounded p-2 overflow-auto max-h-32">
                          {step.messageTemplate}
                        </pre>
                        {step.conditions && (
                          <p className="text-xs text-text-muted">Conditions: {step.conditions}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                  {(detail?.steps ?? []).length === 0 && (
                    <p className="text-sm text-text-muted py-4 text-center">No steps yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Add Step Form */}
            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-text mb-3">Add Step</h3>
              <div className="space-y-3">
                <Input
                  label="Delay (hours)"
                  type="number"
                  value={newStepDelay}
                  onChange={(e) => setNewStepDelay(e.target.value)}
                />
                <TextArea
                  label="Message Template (JSON)"
                  value={newStepTemplate}
                  onChange={(e) => setNewStepTemplate(e.target.value)}
                  rows={4}
                />
                <Input
                  label="Conditions"
                  value={newStepConditions}
                  onChange={(e) => setNewStepConditions(e.target.value)}
                  placeholder="e.g. profile.age >= 3"
                />
                <Button
                  size="sm"
                  loading={addingStep}
                  onClick={() =>
                    addStep({
                      journeyId: selectedJourney.id,
                      step: {
                        delayHours: Number(newStepDelay),
                        messageTemplate: newStepTemplate,
                        conditions: newStepConditions,
                      },
                    })
                  }
                >
                  Add Step
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
