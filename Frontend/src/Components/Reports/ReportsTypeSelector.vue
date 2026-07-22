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
button { display: grid; gap: 7px; padding: 15px; background: rgba(17, 27, 38, 0.9); border: 1px solid rgba(116, 135, 158, 0.28); border-radius: 8px; color: #f4f7fb; text-align: left; cursor: pointer; transition: .2s ease; }
button:hover, button.active { border-color: rgba(131, 185, 92, 0.56); background: rgba(131, 185, 92, 0.1); transform: translateY(-2px); }
span { display: inline-grid; width: 38px; height: 38px; place-items: center; background: rgba(131, 185, 92, 0.18); border: 1px solid rgba(131, 185, 92, 0.28); border-radius: 8px; color: #bce39d; font-size: 20px; line-height: 1; }
button.active span { background: #5f8f2f; border-color: rgba(131, 185, 92, 0.44); color: #f8fbff; }
strong { font-size: 12px; }
small { color: #8d9aab; font-size: 10px; font-weight: 700; line-height: 1.35; }
@media (max-width: 1500px) { .type-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 760px) { .type-grid { grid-template-columns: 1fr; } }
</style>
