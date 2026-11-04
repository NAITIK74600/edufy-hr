with open('src/services/connectedStore.js', 'rb') as f:
    raw = f.read()

text = raw.decode('utf-8', errors='ignore')
text = text.replace('\r\r\n', '\n').replace('\r\n', '\n').replace('\r', '\n')

old_line = "        users: management ? apiClient.get('/auth/users') : Promise.resolve({ data: [] }),"
new_line = "        users: management ? apiClient.get('/auth/users').catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),"

assert old_line in text, "old_line not found in connectedStore.js"
text = text.replace(old_line, new_line, 1)

output = text.replace('\n', '\r\n')
with open('src/services/connectedStore.js', 'wb') as f:
    f.write(output.encode('utf-8'))

print("Successfully updated src/services/connectedStore.js")

