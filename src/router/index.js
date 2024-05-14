import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '',
      name: 'Clump App',
      // route level code-splitting
      // this generates a separate chunk (Home-[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/HomePage.vue')
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginPage.vue')
    },
    {
      path: '/signup',
      name: 'Sign Up',
      component: () => import('@/views/SignUpPage.vue')
    },
    {
      path: '/clumps',
      name: 'Clumps',
      component: () => import('@/views/ClumpsPage.vue')
    },
    {
      path: '/schedules',
      name: 'Schedules',
      component: () => import('@/views/SchedulesPage.vue')
    },
    {
      path: '/tags',
      name: 'Tags',
      component: () => import('@/views/TagsPage.vue')
    },
    {
      path: '/members',
      name: 'Members',
      component: () => import('@/views/MembersPage.vue')
    },
    {
      path: '/roles',
      name: 'Roles',
      component: () => import('@/views/RolesPage.vue')
    },
    {
      path: '/event-templates',
      name: 'EventTemplates',
      component: () => import('@/views/EventTemplatesPage.vue')
    },
    {
      path: '/my-account',
      name: 'My Account',
      component: () => import('@/views/AccountPage.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'Not Found',
      component: () => import('@/views/NotFound.vue')
    }
  ]
});

export default router;
