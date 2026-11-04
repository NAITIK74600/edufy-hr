with open('server/src/modules/leave/leave.routes.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

old_routes = """  router.get('/team', ...protectedRoute(PERMISSIONS.LEAVE_TEAM_READ), async (request, response, next) => { try { return response.json({ success: true, data: await service.listTeam(request.auth.user, listFilters(request.query)) }) } catch (error) { return next(error) } })
  router.get('/team/calendar', ...protectedRoute(PERMISSIONS.LEAVE_TEAM_READ), async (request, response, next) => { try { return response.json({ success: true, data: await service.calendar(request.auth.user, { ...listFilters(request.query), scope: 'team' }) }) } catch (error) { return next(error) } })
  router.post('/team/:id/approve', auth.authenticate, auth.requireAnyPermission([PERMISSIONS.LEAVE_TEAM_APPROVE, PERMISSIONS.LEAVE_HR_REVIEW, PERMISSIONS.ADMIN_ACCESS]), async (request, response, next) => { try { return response.json({ success: true, data: await service.decide(request.params.id, 'approve', request.body ?? {}, request.auth.user, 'team') }) } catch (error) { return next(error) } })
  router.post('/team/:id/reject', auth.authenticate, auth.requireAnyPermission([PERMISSIONS.LEAVE_TEAM_APPROVE, PERMISSIONS.LEAVE_HR_REVIEW, PERMISSIONS.ADMIN_ACCESS]), async (request, response, next) => { try { return response.json({ success: true, data: await service.decide(request.params.id, 'reject', request.body ?? {}, request.auth.user, 'team') }) } catch (error) { return next(error) } })"""

new_routes = """  router.get('/team', auth.authenticate, async (request, response, next) => { try { return response.json({ success: true, data: await service.listTeam(request.auth.user, listFilters(request.query)) }) } catch (error) { return next(error) } })
  router.get('/team/calendar', auth.authenticate, async (request, response, next) => { try { return response.json({ success: true, data: await service.calendar(request.auth.user, { ...listFilters(request.query), scope: 'team' }) }) } catch (error) { return next(error) } })
  router.post('/team/:id/approve', auth.authenticate, async (request, response, next) => { try { return response.json({ success: true, data: await service.decide(request.params.id, 'approve', request.body ?? {}, request.auth.user, 'team') }) } catch (error) { return next(error) } })
  router.post('/team/:id/reject', auth.authenticate, async (request, response, next) => { try { return response.json({ success: true, data: await service.decide(request.params.id, 'reject', request.body ?? {}, request.auth.user, 'team') }) } catch (error) { return next(error) } })"""

assert old_routes in content, "old_routes not found in leave.routes.js"
content = content.replace(old_routes, new_routes, 1)

with open('server/src/modules/leave/leave.routes.js', 'w', encoding='utf-8') as f:
    f.write(content.replace('\n', '\r\n'))

print("[SUCCESS] server/src/modules/leave/leave.routes.js updated!")

