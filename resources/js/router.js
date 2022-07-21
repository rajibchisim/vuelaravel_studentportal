import Vue from 'vue'
import VueRouter from 'vue-router'

import store from './store'

import LoginPage from './page/login.vue'
import RegisterPage from '@/page/register.vue'
import HomePage from '@/page/home.vue'
import DashboardPage from '@/page/admin/Dashboard.vue'
import AdminLayout from '@/layout/Admin.vue'
import DepartmentPage from '@/page/admin/department.vue'
import BatchPage from '@/page/admin/batch.vue'
import StudentPage from '@/page/admin/student.vue'

const routes = [
    {   path: '/login',
        name: 'login',
        component: LoginPage,
        meta: {
            guestOnly: true
        }
    },
    {   path: '/register',
        name: 'register',
        component: RegisterPage,
        meta: {
            guestOnly: true
        }
    },
    {   path: '/',
        component: AdminLayout,
        children: [
        {
            // UserProfile will be rendered inside User's <router-view>
            // when /user/:id/profile is matched
                path: '',
                name: 'home',
                component: DashboardPage,
            },
            {
                path: 'departments/:id',
                component: DepartmentPage,
                name: 'department'
            },
            {
                path: 'batches/:id',
                component: BatchPage,
                name: 'batch'
            },
            {
                path: 'students/:id',
                component: StudentPage,
                name: 'student'
            },
        ],
        // component: () => import('@/page/admin/Dashboard.vue'),
        meta: {
            requiresAuth: true
        }
    },

]





Vue.use( VueRouter )
const router = new VueRouter({
    mode: 'history',
    routes
})


router.beforeEach(async (to, from, next) => {
    console.warn('From:', from, 'To:', to)
    // prevent signed in user to visit login
    const user = await store.dispatch('auth/user', { to,from })
    console.log('router user: ', user)

    if(to.matched.some(record => record.meta.guestOnly)){
        if(user) next({ name: 'home' }) // redirect to home
        else next() // allow visit guestonly pages
    }

    // prevent unauthorized user to visit
    if(to.matched.some(record => record.meta.requiresAuth)){
        if(user){
            next()
            // if(to.matched.some(record => record.meta.isAdmin)) {
            //     if(store.state.isAdmin) {
            //         next()
            //     } else {
            //         next({ name: 'notifications' })
            //     }

            // } else {
            //     next()

            // }
        } else {
            next({
                name: 'login',
                // query: {
                //     redirect: to.fullPath
                // }
            })
        }

    }

})


export default router
