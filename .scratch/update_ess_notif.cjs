const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeDashboardPage.jsx', 'utf8');

const oldView = `function ESSNotificationsView() {
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const notifs = storeState.notifications || []`;

const newView = `function ESSNotificationsView() {
  const { user } = useAuth()
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const notifs = hrStore.getUserNotifications ? hrStore.getUserNotifications(user) : (storeState.notifications || [])`;

const normC = code.replace(/\r\n/g, '\n');
const normO = oldView.replace(/\r\n/g, '\n');

if (normC.includes(normO)) {
  const updated = normC.replace(normO, newView);
  fs.writeFileSync('src/pages/EmployeeDashboardPage.jsx', updated.replace(/\n/g, '\r\n'), 'utf8');
  console.log('Successfully updated ESSNotificationsView in EmployeeDashboardPage.jsx');
} else {
  console.error('Target not found in EmployeeDashboardPage.jsx');
}

