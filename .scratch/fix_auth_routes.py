with open('server/src/modules/auth/auth.routes.js', 'rb') as f:
    raw = f.read()

text = raw.decode('utf-8', errors='ignore')
text = text.replace('\r\r\n', '\n').replace('\r\n', '\n').replace('\r', '\n')

helper_fn = """function canManageUsers(user) {
  if (!user) return false
  const role = user.role
  const permissions = user.permissions || []
  return ['admin', 'hr', 'director', 'managing_director', 'co_founder', 'vertical_head'].includes(role) ||
    permissions.includes('*') ||
    permissions.includes('admin.access') ||
    permissions.includes('users.read') ||
    user.email === 'jagadishbabu@edufyitech.in'
}
"""

old_router_start = """export function createAuthRouter({ authService, auth, userStore }) {
  const router = express.Router()

  router.get('/users', auth.authenticate, async (request, response, next) => {
    try {
      if (!['admin', 'hr'].includes(request.auth.user.role)) {
        return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only Admin or HR can view user accounts.' } })
      }"""

new_router_start = helper_fn + """export function createAuthRouter({ authService, auth, userStore }) {
  const router = express.Router()

  router.get('/users', auth.authenticate, async (request, response, next) => {
    try {
      if (!canManageUsers(request.auth.user)) {
        return response.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only Admin or HR can view user accounts.' } })
      }"""

assert old_router_start in text, "old_router_start not found in auth.routes.js"
text = text.replace(old_router_start, new_router_start, 1)

# POST /users
old_post_users = """  router.post('/users', auth.authenticate, async (request, response, next) => {
    try {
      if (request.auth.user.role !== 'admin' && request.auth.user.role !== 'hr') {"""

new_post_users = """  router.post('/users', auth.authenticate, async (request, response, next) => {
    try {
      if (!canManageUsers(request.auth.user)) {"""

assert old_post_users in text, "old_post_users not found in auth.routes.js"
text = text.replace(old_post_users, new_post_users, 1)

# POST /users/:id/password
old_post_password = """  router.post('/users/:id/password', auth.authenticate, async (request, response, next) => {
    try {
      if (!['admin', 'hr'].includes(request.auth.user.role)) {"""

new_post_password = """  router.post('/users/:id/password', auth.authenticate, async (request, response, next) => {
    try {
      if (!canManageUsers(request.auth.user)) {"""

assert old_post_password in text, "old_post_password not found in auth.routes.js"
text = text.replace(old_post_password, new_post_password, 1)

# DELETE /users/:id
old_del_users = """  router.delete('/users/:id', auth.authenticate, async (request, response, next) => {
    try {
      if (!['admin', 'hr'].includes(request.auth.user.role)) {"""

new_del_users = """  router.delete('/users/:id', auth.authenticate, async (request, response, next) => {
    try {
      if (!canManageUsers(request.auth.user)) {"""

assert old_del_users in text, "old_del_users not found in auth.routes.js"
text = text.replace(old_del_users, new_del_users, 1)

output = text.replace('\n', '\r\n')
with open('server/src/modules/auth/auth.routes.js', 'wb') as f:
    f.write(output.encode('utf-8'))

print("Successfully updated server/src/modules/auth/auth.routes.js")

