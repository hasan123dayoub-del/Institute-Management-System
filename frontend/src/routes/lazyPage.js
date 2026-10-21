// lazyPage(() => import('../pages/x/Page.jsx')) makes a route that downloads the page only when someone opens it,
// so the first load stays small (the chart library, for example, is only needed by the admin dashboard).
//   { path: 'students', ...lazyPage(() => import('../pages/secretary/Students.jsx')), handle: { title: 'Students' } }
export const lazyPage = (importer) => ({
  lazy: async () => ({ Component: (await importer()).default }),
})
