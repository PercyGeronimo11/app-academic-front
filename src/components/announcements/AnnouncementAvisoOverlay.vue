<template>
  <Teleport to="body">
    <Transition name="aviso-fade">
      <div
        v-if="visible && item"
        class="aviso-overlay"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <div class="aviso-overlay__backdrop" aria-hidden="true"></div>

        <div class="aviso-sheet">
          <header class="aviso-sheet__header">
            <div class="aviso-sheet__badge-row">
              <span class="aviso-sheet__kind">
                <i class="fas fa-bullhorn" aria-hidden="true"></i>
                {{ kindLabel }}
              </span>
              <span v-if="item.type_label || item.is_general !== undefined" class="aviso-sheet__type">
                {{ item.type_label || (item.is_general ? 'Institucional' : 'Aula') }}
              </span>
            </div>
            <h2 :id="titleId" class="aviso-sheet__title">{{ item.title }}</h2>
            <p class="aviso-sheet__meta">
              <span v-if="item.is_general" class="aviso-chip">General</span>
              <span v-else-if="scopeText" class="aviso-chip aviso-chip--grade">{{ scopeText }}</span>
              <span class="aviso-chip aviso-chip--muted">
                <i class="far fa-calendar-alt" aria-hidden="true"></i>
                {{ formatRange(item.starts_at, item.ends_at) }}
              </span>
              <span v-if="item.publisher_name" class="aviso-chip aviso-chip--muted">
                {{ item.publisher_name }}
              </span>
            </p>
          </header>

          <div class="aviso-sheet__body">
            <figure v-if="item.image_url" class="aviso-flyer">
              <img :src="item.image_url" :alt="`Afiche: ${item.title}`" />
            </figure>
            <div
              v-if="hasBody"
              class="announcement-detail-body aviso-sheet__content"
              v-html="item.body"
            ></div>
            <p v-else-if="item.image_url" class="aviso-sheet__image-only">
              Afiche / flyer oficial
            </p>
          </div>

          <footer class="aviso-sheet__footer">
            <p v-if="showCounter" class="aviso-sheet__counter">
              Aviso {{ index + 1 }} de {{ total }}
            </p>
            <div class="aviso-sheet__actions">
              <button
                v-if="showDismiss"
                type="button"
                class="aviso-btn aviso-btn--ghost"
                @click="$emit('dismiss')"
              >
                Cerrar
              </button>
              <button
                v-if="hasNext"
                type="button"
                class="aviso-btn aviso-btn--primary"
                @click="$emit('next')"
              >
                Siguiente aviso
              </button>
              <button
                v-else
                type="button"
                class="aviso-btn aviso-btn--primary"
                @click="$emit('confirm')"
              >
                {{ confirmLabel }}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  item: { type: Object, default: null },
  index: { type: Number, default: 0 },
  total: { type: Number, default: 1 },
  kindLabel: { type: String, default: 'Aviso oficial' },
  confirmLabel: { type: String, default: 'Entendido' },
  showDismiss: { type: Boolean, default: true },
})

defineEmits(['dismiss', 'next', 'confirm'])

const titleId = `aviso-title-${Math.random().toString(36).slice(2, 9)}`

const hasNext = computed(() => props.index < props.total - 1)
const showCounter = computed(() => props.total > 1)

const hasBody = computed(() => {
  const plain = String(props.item?.body || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > 0
})

const scopeText = computed(() => {
  if (props.item?.is_general) return ''
  return props.item?.target_labels || ''
})

const formatRange = (start, end) => {
  if (!start && !end) return '—'
  if (start && end) return `${start} → ${end}`
  return start || end
}
</script>

<style scoped>
.aviso-overlay {
  position: fixed;
  inset: 0;
  z-index: 1080;
  display: grid;
  place-items: center;
  padding: 1rem;
}

.aviso-overlay__backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 10%, rgba(14, 116, 144, 0.45), transparent 55%),
    radial-gradient(ellipse 70% 50% at 90% 80%, rgba(180, 83, 9, 0.35), transparent 50%),
    rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(4px);
}

.aviso-sheet {
  position: relative;
  width: min(640px, 100%);
  max-height: min(92vh, 900px);
  display: flex;
  flex-direction: column;
  border-radius: 1.25rem;
  overflow: hidden;
  background: #fff;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.12),
    0 25px 50px -12px rgba(0, 0, 0, 0.45);
  animation: aviso-rise 0.35s ease-out;
}

.aviso-sheet::before {
  content: '';
  display: block;
  height: 6px;
  background: linear-gradient(90deg, #0e7490, #0891b2, #22d3ee);
}

.aviso-sheet__header {
  padding: 1.15rem 1.35rem 0.85rem;
  background: linear-gradient(180deg, #f0f9ff 0%, #fff 100%);
}

.aviso-sheet__badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.65rem;
}

.aviso-sheet__kind {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #0e7490;
}

.aviso-sheet__type {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: #ecfeff;
  color: #0e7490;
}

.aviso-sheet__title {
  margin: 0;
  font-size: clamp(1.2rem, 2.5vw, 1.55rem);
  font-weight: 800;
  line-height: 1.25;
  color: #0f172a;
}

.aviso-sheet__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0.75rem 0 0;
}

.aviso-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  background: #e0f2fe;
  color: #0369a1;
}

.aviso-chip--grade {
  background: #ffedd5;
  color: #9a3412;
}

.aviso-chip--muted {
  background: #f1f5f9;
  color: #475569;
  font-weight: 500;
}

.aviso-sheet__body {
  flex: 1;
  overflow: auto;
  padding: 0.5rem 1.35rem 1rem;
}

.aviso-flyer {
  margin: 0 0 1rem;
  border-radius: 0.85rem;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: #0f172a;
}

.aviso-flyer img {
  display: block;
  width: 100%;
  max-height: min(52vh, 480px);
  object-fit: contain;
  background: #0f172a;
}

.aviso-sheet__content {
  font-size: 0.95rem;
  line-height: 1.55;
  color: #334155;
}

.aviso-sheet__image-only {
  margin: 0;
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
}

.aviso-sheet__footer {
  padding: 0.9rem 1.35rem 1.15rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.aviso-sheet__counter {
  margin: 0;
  font-size: 0.8rem;
  color: #64748b;
}

.aviso-sheet__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-left: auto;
}

.aviso-btn {
  border: none;
  border-radius: 0.7rem;
  padding: 0.55rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.aviso-btn:active {
  transform: scale(0.98);
}

.aviso-btn--ghost {
  background: transparent;
  color: #475569;
}

.aviso-btn--ghost:hover {
  background: #e2e8f0;
}

.aviso-btn--primary {
  background: linear-gradient(135deg, #0e7490, #0891b2);
  color: #fff;
  box-shadow: 0 8px 16px -8px rgba(14, 116, 144, 0.7);
}

.aviso-btn--primary:hover {
  filter: brightness(1.05);
}

.aviso-fade-enter-active,
.aviso-fade-leave-active {
  transition: opacity 0.25s ease;
}

.aviso-fade-enter-from,
.aviso-fade-leave-to {
  opacity: 0;
}

@keyframes aviso-rise {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 576px) {
  .aviso-overlay {
    padding: 0;
    align-items: end;
  }

  .aviso-sheet {
    width: 100%;
    max-height: 94vh;
    border-radius: 1.1rem 1.1rem 0 0;
  }

  .aviso-sheet__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .aviso-sheet__actions {
    margin-left: 0;
  }

  .aviso-btn {
    flex: 1;
  }
}
</style>
