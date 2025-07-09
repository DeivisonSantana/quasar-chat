<script setup>
import { computed } from 'vue'

const props = defineProps(['conversations', 'modelValue'])
const emit = defineEmits(['update:modelValue'])

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

function getIcon(typeName) {
  const icons = {
    privados: 'chat',
    grupos: 'group',
    empresas: 'business',
  }
  return icons[typeName] || 'perm_identity'
}

function getLabel(typeName) {
  const labels = {
    privados: 'Conversas',
    grupos: 'Grupos',
    empresas: 'Empresas',
  }
  const label = labels[typeName] || typeName
  return `${label} `
}
</script>

<template>
  <q-footer class="bg-grey-2">
    <q-tabs dense align="justify" class="text-grey-8" v-model="model">
      <q-tab
        v-for="(index, typeName) in conversations"
        :key="index"
        :name="typeName"
        :icon="getIcon(typeName)"
        :label="getLabel(typeName)"
      />
    </q-tabs>
  </q-footer>
</template>
