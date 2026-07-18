<template>
  <div class="timeline">
    <article v-for="event in events" :key="`${event.title}-${event.date}-${event.time}`" class="timeline-item">
      <span class="timeline-dot" :class="event.color">{{ event.icon }}</span>
      <div>
        <strong>{{ event.title }}</strong>
        <p>{{ event.description }}</p>
        <small>{{ event.user }} · {{ event.date }} {{ event.time }}</small>
      </div>
    </article>
  </div>
</template>

<script setup>
defineProps({
  events: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.timeline {
  margin-left: 12px;
  padding-left: 24px;
  border-left: 2px solid #e4ead9;
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;
}

.timeline-dot {
  position: absolute;
  top: 0;
  left: -36px;
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border: 3px solid #f7f9f3;
  border-radius: 50%;
  color: white;
  font-size: 10px;
  font-weight: 900;
}

.green { background: #6a9a2a; }
.yellow { background: #e8b300; }
.orange { background: #ff6a00; }
.red { background: #e31e24; }
.gray { background: #64748b; }

.timeline-item strong {
  color: #111827;
}

.timeline-item p {
  margin: 5px 0;
  color: #64748b;
  font-size: 12px;
}

.timeline-item small {
  color: #94a3b8;
  font-size: 11px;
}
</style>
