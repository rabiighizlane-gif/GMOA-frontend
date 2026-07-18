<template>
  <section class="type-grid">
    <button v-for="type in types" :key="type.id" type="button" :class="{ active: modelValue === type.id }" @click="$emit('update:modelValue', type.id)">
      <span>{{ type.icon }}</span>
      <strong>{{ type.label }}</strong>
      <small>{{ type.description }}</small>
    </button>
  </section>
</template>

<script setup>
defineProps({ modelValue: { type: String, required: true }, types: { type: Array, default: () => [] } })
defineEmits(['update:modelValue'])
</script>

<style scoped>
.type-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 12px; }
button { display: grid; gap: 7px; padding: 15px; background: white; border: 1px solid #edf0e8; border-radius: 16px; color: #4a0a0a; text-align: left; cursor: pointer; transition: .2s ease; }
button:hover, button.active { border-color: #b6c65b; background: #f7fbef; transform: translateY(-2px); }
span { display: inline-grid; width: 38px; height: 38px; place-items: center; background: #eff5df; border: 1px solid #dce9c6; border-radius: 12px; color: #6a9a2a; font-size: 20px; line-height: 1; }
button.active span { background: #6a9a2a; border-color: #6a9a2a; color: white; }
strong { font-size: 12px; }
small { color: #94a3b8; font-size: 10px; font-weight: 700; line-height: 1.35; }
@media (max-width: 1500px) { .type-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 760px) { .type-grid { grid-template-columns: 1fr; } }
</style>
