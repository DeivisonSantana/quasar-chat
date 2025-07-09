<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex items-center justify-center bg-grey-2">
        <div class="q-pa-md rounded-xl shadow-lg q-gutter-lg" style="max-width: 900px; width: 100%">
          <q-img
            src="~assets/login-illustration.png"
            style="max-width: 100%; max-height: 360px"
            alt="Profissionais de marketing usando celular"
            fit="cover"
          />
          <q-form @submit.prevent="logarUsuario" class="" ref="formRef">
            <q-input
              ref="emailRef"
              v-model="login.email"
              label="E-mail"
              type="email"
              class="q-mb-md"
              rounded
              outlined
              lazy-rules
              :rules="[() => (showErrors.email ? !!login.email || 'Informe seu e-mail' : true)]"
              @focus="clearError('email')"
            />

            <q-input
              ref="passwordRef"
              v-model="login.password"
              label="Senha"
              type="password"
              class="q-mb-md"
              rounded
              outlined
              lazy-rules
              :disable="!login.email || auth.loading"
              :hint="disable ? 'Informe seu e-mail primeiro' : ''"
              :rules="[
                () => (showErrors.password ? !!login.password || 'Informe sua senha' : true),
              ]"
              @focus="clearError('password')"
            />

            <q-btn
              type="submit"
              color="primary"
              label="Entrar"
              icon="login"
              class="full-width q-mt-md"
              unelevated
              :loading="auth.loading"
              :disable="!login.email || !login.password || auth.loading"
            />
          </q-form>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { LocalStorage } from 'quasar'
import { reactive, ref } from 'vue'
import { useAuthStore } from 'src/stores/auth' // ajuste o caminho conforme seu projeto
import { useRouter } from 'vue-router'
import { echo } from 'src/boot/echo'

const formRef = ref(null)
const emailRef = ref(null)
const passwordRef = ref(null)
const router = useRouter()
const disable = ref(false)

const auth = useAuthStore()

const showErrors = reactive({
  email: false,
  password: false,
})

function clearError(field) {
  showErrors[field] = false

  if (field === 'email') emailRef.value?.resetValidation()
  if (field === 'password') passwordRef.value?.resetValidation()
}

const login = reactive({
  email: '',
  password: '',
})

async function logarUsuario() {
  showErrors.email = true
  showErrors.password = true

  const valid = await formRef.value.validate()
  if (!valid) return
  try {
    await auth.logarUsuario(login).then(() => {
      echo.connector.options.auth.headers.Authorization = `Bearer ${LocalStorage.getItem('token')}`
      echo.disconnect()
      echo.connect()
      router.push('/chat')
    })
  } catch (error) {
    console.log(error)
    auth.error = error.response?.data?.message || 'Erro ao fazer login'
    login.email = ''
    login.password = ''
  }
}
</script>
