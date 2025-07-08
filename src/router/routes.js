const routes = [
  {
    path: '/',
    component: () => import('src/pages/LoginPage.vue'),
    meta: {
      login: false,
    },
  },
  {
    path: '/chat',
    component: () => import('layouts/MainLayout.vue'),
    meta: {
      login: true,
    },
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: 'user/:id',
        name: 'chat-user',
        component: () => import('pages/ChatPage.vue'),
        props: { type: 'user' },
      },
      {
        path: 'grupo/:id',
        name: 'chat-grupo',
        component: () => import('pages/ChatPage.vue'),
        props: { type: 'grupo' },
      },
      {
        path: 'empresa/:id',
        name: 'chat-empresa',
        component: () => import('pages/ChatPage.vue'),
        props: { type: 'empresa' },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('pages/SettingsPage.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
