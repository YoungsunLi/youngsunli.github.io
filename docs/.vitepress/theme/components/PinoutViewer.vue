<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ChipPinout, Pin } from '../pinout/types'

const props = defineProps<{ chip: ChipPinout }>()

const selected = ref<Pin | null>(null)
const activeFilter = ref('all')

const pinName = (pin: Pin) => pin.label ?? `GPIO${pin.gpio}`

const half = computed(() => Math.ceil(props.chip.pins.length / 2))
const rows = computed(() =>
  props.chip.pins.map((pin, i) => ({
    pin,
    side: i < half.value ? 'left' : 'right',
    // 桌面端左右两列各自从第 2 行排起（第 1 行留给芯片块上沿）
    row: (i < half.value ? i : i - half.value) + 1
  }))
)

const dimmed = (pin: Pin) => activeFilter.value !== 'all' && !pin.cats.includes(activeFilter.value)

const availText: Record<Pin['availability'], string> = {
  free: '自由使用',
  caution: '有前提 / 副作用',
  avoid: '勿用 / 被占用'
}
</script>

<template>
  <div class="pv">
    <div class="pv-filters" role="group" aria-label="按功能筛选引脚">
      <button
        v-for="f in [{ key: 'all', label: '全部' }, ...chip.filters]"
        :key="f.key"
        :class="{ on: activeFilter === f.key }"
        @click="activeFilter = f.key"
      >
        {{ f.label }}
      </button>
    </div>

    <div class="pv-board" :style="{ '--pv-rows': half }">
      <div class="pv-chip">
        <b>{{ chip.name }}</b>
        <span>{{ chip.subtitle }}</span>
      </div>
      <button
        v-for="{ pin, side, row } in rows"
        :key="pin.gpio"
        class="pv-row"
        :class="[`pv-row--${side}`, { 'pv-row--dim': dimmed(pin), 'pv-row--sel': selected === pin }]"
        :style="{ '--pv-row': row }"
        :aria-pressed="selected === pin"
        @click="selected = selected === pin ? null : pin"
      >
        <span class="pv-pin" :class="`pv-pin--${pin.availability}`">
          <i class="pv-dot" aria-hidden="true"></i>{{ pinName(pin) }}
        </span>
        <span v-for="tag in pin.tags" :key="tag.label" class="pv-tag" :class="`pv-tag--${tag.kind}`">
          {{ tag.label }}
        </span>
      </button>
    </div>

    <div class="pv-detail" aria-live="polite">
      <template v-if="selected">
        <div class="pv-detail-head">
          <b>{{ pinName(selected) }}</b>
          <span class="pv-avail" :class="`pv-avail--${selected.availability}`">
            {{ availText[selected.availability] }}
          </span>
        </div>
        <p>{{ selected.note }}</p>
      </template>
      <p v-else class="pv-hint">
        点击任意引脚查看说明 —— 绿点自由使用，橙点有前提，红点勿用。
      </p>
    </div>
  </div>
</template>

<style>
/* 不用 scoped：全部规则以 .pv 前缀限定，便于用 .dark .pv 整体换色 */
.pv {
  --pv-free: #16a34a;
  --pv-caution: #d97706;
  --pv-avoid: #dc2626;
  --pv-tag-adc-bg: #fdf1d7;
  --pv-tag-adc-fg: #b45309;
  --pv-tag-strap-bg: #fee4e2;
  --pv-tag-strap-fg: #b91c1c;
  --pv-tag-usb-bg: #ede9fe;
  --pv-tag-usb-fg: #6d28d9;
  --pv-tag-uart-bg: #d5f5f0;
  --pv-tag-uart-fg: #0f766e;
  margin: 24px 0;
}
.dark .pv {
  --pv-free: #4ade80;
  --pv-caution: #fbbf24;
  --pv-avoid: #f87171;
  --pv-tag-adc-bg: rgba(245, 158, 11, 0.14);
  --pv-tag-adc-fg: #fbbf24;
  --pv-tag-strap-bg: rgba(239, 68, 68, 0.14);
  --pv-tag-strap-fg: #f87171;
  --pv-tag-usb-bg: rgba(167, 139, 250, 0.14);
  --pv-tag-usb-fg: #c4b5fd;
  --pv-tag-uart-bg: rgba(45, 212, 191, 0.12);
  --pv-tag-uart-fg: #5eead4;
}

/* 筛选条 */
.pv-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}
.pv-filters button {
  font-size: 13px;
  line-height: 1;
  padding: 7px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.pv-filters button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.pv-filters button.on {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}
.dark .pv-filters button.on {
  color: var(--vp-c-bg);
}

/* 引脚图主体：左行 | 芯片 | 右行 */
.pv-board {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 56px minmax(0, 1fr);
  gap: 6px 10px;
}
.pv-chip {
  grid-column: 2;
  grid-row: 1 / span var(--pv-rows);
  border: 2px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  writing-mode: vertical-rl;
  padding: 16px 0;
}
.pv-chip b {
  font-size: 15px;
  letter-spacing: 0.12em;
  color: var(--vp-c-text-1);
}
.pv-chip span {
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--vp-c-text-3);
}

/* 引脚行 */
.pv-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  cursor: pointer;
  font: inherit;
  text-align: left;
  transition: border-color 0.2s, background 0.2s, opacity 0.2s;
}
.pv-row--left {
  grid-column: 1;
  grid-row: var(--pv-row);
  justify-content: flex-end;
}
.pv-row--right {
  grid-column: 3;
  grid-row: var(--pv-row);
}
/* 左列标签排在引脚名之前，视觉上向芯片靠拢 */
.pv-row--left .pv-pin {
  order: 9;
}
.pv-row:hover {
  border-color: var(--vp-c-brand-1);
}
.pv-row--sel {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.pv-row--dim {
  opacity: 0.22;
}

.pv-pin {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 13.5px;
  color: var(--vp-c-text-1);
  white-space: nowrap;
}
.pv-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex: none;
}
.pv-pin--free .pv-dot {
  background: var(--pv-free);
}
.pv-pin--caution .pv-dot {
  background: var(--pv-caution);
}
.pv-pin--avoid .pv-dot {
  background: var(--pv-avoid);
}

/* 功能标签 */
.pv-tag {
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1;
  padding: 4px 8px;
  border-radius: 999px;
  white-space: nowrap;
}
.pv-tag--spi {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
.pv-tag--hot {
  background: var(--vp-c-brand-1);
  color: #fff;
}
/* 暗色下 brand 是浅蓝，白字压不住，改深色文字（同 .pv-avail 的处理） */
.dark .pv-tag--hot {
  color: var(--vp-c-bg);
}
.pv-tag--adc {
  background: var(--pv-tag-adc-bg);
  color: var(--pv-tag-adc-fg);
}
.pv-tag--strap {
  background: var(--pv-tag-strap-bg);
  color: var(--pv-tag-strap-fg);
}
.pv-tag--usb {
  background: var(--pv-tag-usb-bg);
  color: var(--pv-tag-usb-fg);
}
.pv-tag--uart {
  background: var(--pv-tag-uart-bg);
  color: var(--pv-tag-uart-fg);
}
.pv-tag--flash,
.pv-tag--misc {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
}

/* 详情面板 */
.pv-detail {
  position: relative;
  margin-top: 14px;
  padding: 14px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  min-height: 66px;
}
/* 左侧提示条：独立圆头短条，上下内缩避开卡片圆角，不随边框拐弯 */
.pv-detail::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 12px;
  bottom: 12px;
  width: 3px;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
}
.pv-detail-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.pv-detail-head b {
  font-size: 15px;
}
.pv-avail {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  color: #fff;
}
.pv-avail--free {
  background: var(--pv-free);
}
.pv-avail--caution {
  background: var(--pv-caution);
}
.pv-avail--avoid {
  background: var(--pv-avoid);
}
.dark .pv-avail {
  color: var(--vp-c-bg);
}
.pv-detail p {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: var(--vp-c-text-2);
}
.pv-hint {
  color: var(--vp-c-text-3) !important;
}

/* 窄屏：单列，芯片块变横条 */
@media (max-width: 640px) {
  .pv-board {
    grid-template-columns: 1fr;
  }
  .pv-chip {
    grid-column: 1;
    grid-row: auto;
    writing-mode: horizontal-tb;
    flex-direction: row;
    gap: 10px;
    padding: 10px 16px;
  }
  .pv-row--left,
  .pv-row--right {
    grid-column: 1;
    grid-row: auto;
    justify-content: flex-start;
  }
  .pv-row--left .pv-pin {
    order: -1;
  }
}
</style>
