// ── Application Metrics ──────────────────────────────────────────────────────
// In-memory metrics registry that can export to Prometheus text format or JSON.
// Designed for zero-dependency operation: works standalone but is compatible
// with Prometheus, OpenTelemetry, Datadog, and CloudWatch exporters.
//
// Metric types:
//   counter   - monotonically increasing value (e.g. total requests)
//   gauge     - point-in-time value (e.g. queue depth)
//   histogram - distribution of values (e.g. latency percentiles)
// ─────────────────────────────────────────────────────────────────────────────

interface MetricEntry {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  value: number;
  labels: Record<string, string>;
  timestamp: number;
}

/** Create a stable key from metric name + labels for Map lookups */
function metricKey(name: string, labels: Record<string, string> = {}): string {
  const sortedLabels = Object.keys(labels)
    .sort()
    .map((k) => `${k}="${labels[k]}"`)
    .join(',');
  return sortedLabels ? `${name}{${sortedLabels}}` : name;
}

class MetricsRegistry {
  private counters = new Map<string, { value: number; labels: Record<string, string> }>();
  private gauges = new Map<string, { value: number; labels: Record<string, string> }>();
  private histograms = new Map<string, { values: number[]; labels: Record<string, string> }>();

  // ── Counter: always goes up ─────────────────────────────────────────────

  increment(name: string, labels: Record<string, string> = {}, value = 1) {
    const key = metricKey(name, labels);
    const existing = this.counters.get(key);
    if (existing) {
      existing.value += value;
    } else {
      this.counters.set(key, { value, labels });
    }
  }

  // ── Gauge: can go up or down ────────────────────────────────────────────

  gauge(name: string, value: number, labels: Record<string, string> = {}) {
    const key = metricKey(name, labels);
    this.gauges.set(key, { value, labels });
  }

  // ── Histogram: distribution of values ───────────────────────────────────

  histogram(name: string, value: number, labels: Record<string, string> = {}) {
    const key = metricKey(name, labels);
    const existing = this.histograms.get(key);
    if (existing) {
      existing.values.push(value);
      // Keep a rolling window of last 1000 values to bound memory
      if (existing.values.length > 1000) {
        existing.values = existing.values.slice(-1000);
      }
    } else {
      this.histograms.set(key, { values: [value], labels });
    }
  }

  // ── Export: Prometheus text format ───────────────────────────────────────

  toPrometheus(): string {
    const lines: string[] = [];

    // Counters
    const counterNames = new Set<string>();
    for (const [key, data] of this.counters) {
      const name = key.split('{')[0];
      if (!counterNames.has(name)) {
        lines.push(`# TYPE ${name} counter`);
        counterNames.add(name);
      }
      const labelStr = this.formatLabels(data.labels);
      lines.push(`${name}${labelStr} ${data.value}`);
    }

    // Gauges
    const gaugeNames = new Set<string>();
    for (const [key, data] of this.gauges) {
      const name = key.split('{')[0];
      if (!gaugeNames.has(name)) {
        lines.push(`# TYPE ${name} gauge`);
        gaugeNames.add(name);
      }
      const labelStr = this.formatLabels(data.labels);
      lines.push(`${name}${labelStr} ${data.value}`);
    }

    // Histograms — export as summary (count, sum, percentiles)
    const histNames = new Set<string>();
    for (const [key, data] of this.histograms) {
      const name = key.split('{')[0];
      if (!histNames.has(name)) {
        lines.push(`# TYPE ${name} summary`);
        histNames.add(name);
      }
      const labelStr = this.formatLabels(data.labels);
      const sorted = [...data.values].sort((a, b) => a - b);
      const count = sorted.length;
      const sum = sorted.reduce((a, b) => a + b, 0);

      lines.push(`${name}_count${labelStr} ${count}`);
      lines.push(`${name}_sum${labelStr} ${sum}`);

      // Percentiles: p50, p90, p95, p99
      for (const [quantile, label] of [
        [0.5, '0.5'],
        [0.9, '0.9'],
        [0.95, '0.95'],
        [0.99, '0.99'],
      ] as const) {
        const idx = Math.min(Math.floor(count * quantile), count - 1);
        const qLabels = { ...data.labels, quantile: label };
        lines.push(`${name}${this.formatLabels(qLabels)} ${sorted[idx] ?? 0}`);
      }
    }

    return lines.join('\n') + '\n';
  }

  // ── Export: JSON ────────────────────────────────────────────────────────

  toJSON(): MetricEntry[] {
    const now = Date.now();
    const entries: MetricEntry[] = [];

    for (const [, data] of this.counters) {
      const name = this.nameFromLabels(data.labels, 'counter');
      entries.push({ name, type: 'counter', value: data.value, labels: data.labels, timestamp: now });
    }

    for (const [, data] of this.gauges) {
      const name = this.nameFromLabels(data.labels, 'gauge');
      entries.push({ name, type: 'gauge', value: data.value, labels: data.labels, timestamp: now });
    }

    for (const [key, data] of this.histograms) {
      const name = key.split('{')[0];
      const sorted = [...data.values].sort((a, b) => a - b);
      const count = sorted.length;
      const sum = sorted.reduce((a, b) => a + b, 0);
      const avg = count > 0 ? sum / count : 0;
      const p50 = sorted[Math.floor(count * 0.5)] ?? 0;
      const p95 = sorted[Math.floor(count * 0.95)] ?? 0;
      const p99 = sorted[Math.floor(count * 0.99)] ?? 0;

      entries.push({
        name,
        type: 'histogram',
        value: avg,
        labels: { ...data.labels, count: String(count), sum: String(sum), p50: String(p50), p95: String(p95), p99: String(p99) },
        timestamp: now,
      });
    }

    return entries;
  }

  // ── Reset (useful for testing) ──────────────────────────────────────────

  reset() {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }

  // ── Private helpers ─────────────────────────────────────────────────────

  private formatLabels(labels: Record<string, string>): string {
    const entries = Object.entries(labels);
    if (entries.length === 0) return '';
    return `{${entries.map(([k, v]) => `${k}="${v}"`).join(',')}}`;
  }

  private nameFromLabels(labels: Record<string, string>, _type: string): string {
    // Reconstruct the metric name from the key
    for (const [key] of this.counters) {
      const data = this.counters.get(key);
      if (data && data.labels === labels) return key.split('{')[0];
    }
    for (const [key] of this.gauges) {
      const data = this.gauges.get(key);
      if (data && data.labels === labels) return key.split('{')[0];
    }
    return 'unknown';
  }
}

// ── Singleton Registry ───────────────────────────────────────────────────────

export const metrics = new MetricsRegistry();

// ── Predefined Metric Recorders ──────────────────────────────────────────────

/** Record HTTP request latency and count */
export function recordApiLatency(method: string, path: string, status: number, durationMs: number) {
  metrics.histogram('http_request_duration_ms', durationMs, { method, path, status: String(status) });
  metrics.increment('http_requests_total', { method, path, status: String(status) });
}

/** Record queue job lifecycle events */
export function recordQueueMetric(queue: string, event: 'enqueued' | 'completed' | 'failed') {
  metrics.increment(`queue_jobs_${event}_total`, { queue });
}

/** Record current queue depth (number of waiting jobs) */
export function recordQueueDepth(queue: string, depth: number) {
  metrics.gauge('queue_depth', depth, { queue });
}

/** Record database operation latency */
export function recordDbLatency(operation: string, durationMs: number) {
  metrics.histogram('db_operation_duration_ms', durationMs, { operation });
}

/** Record cache hit/miss */
export function recordCacheMetric(hit: boolean) {
  metrics.increment(hit ? 'cache_hits_total' : 'cache_misses_total');
}

/** Record sync errors by type */
export function recordSyncError(errorType: string) {
  metrics.increment('sync_errors_total', { type: errorType });
}

/** Record active WebSocket or SSE connections */
export function recordActiveConnections(count: number) {
  metrics.gauge('active_connections', count);
}

/** Record media processing durations */
export function recordMediaProcessing(operation: string, durationMs: number) {
  metrics.histogram('media_processing_duration_ms', durationMs, { operation });
}

/** Record authentication events */
export function recordAuthEvent(event: 'login' | 'logout' | 'token_refresh' | 'failed_login') {
  metrics.increment('auth_events_total', { event });
}
