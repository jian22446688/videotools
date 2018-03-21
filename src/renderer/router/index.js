import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/aaa',
            name: 'landing-page',
            component: require('@/components/LandingPage').default
        },
        {
            path: '/',
            name: 'index-page',
            component: require('@/components/index').default,
            children :[
                {
                    path: '/',
                    name: 'videocompress',
                    component: require('@/components/VideoTools/VideoCompress').default

                },
                {
                    path:'/videocombine',
                    name: 'videocombine',
                    component: require('@/components/VideoTools/VideoCombine').default
                },
                {
                    path:'/watermark',
                    name: 'watermark',
                    component: require('@/components/VideoTools/Watermark').default
                }
            ]
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})

// {
//     path: '/',
//         component: require('@/components/index/index').default,
//     children :[
//     {
//         path: '/',
//         name: 'systeminfo',
//         component: require('@/components/LandingPage/SystemInformation').default,
//     },
//     {
//         path: '/animater',
//         name: 'animater',
//         component: require('@/components/index/animater/animater').default,
//     },
//
// ]
// },
