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
  border-left: 2px solid rgba(126, 146, 170, 0.26);
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
  border: 3px solid rgba(17, 27, 38, 0.96);
  border-radius: 50%;
  color: #f8fbff;
  font-size: 10px;
  font-weight: 900;
}

.green { background: #83b95c; }
.yellow { background: #facc15; color: #111927; }
.orange { background: #f97316; }
.red { background: #dc3747; }
.gray { background: #7e92aa; }

.timeline-item strong {
  color: #f8fbff;
}

.timeline-item p {
  margin: 5px 0;
  color: #d7e0ec;
  font-size: 12px;
}

.timeline-item small {
  color: #8d9aab;
  font-size: 11px;
}
</style>
